const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/cvs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user ? req.user.id : 'unknown';
    cb(null, `cv-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

console.log('Gemini API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No');

// Function to extract text from uploaded file
async function extractTextFromFile(filePath, fileType) {
  try {
    if (fileType === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (fileType === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (fileType === '.doc') {
      // For .doc files, we'll use a simpler approach
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
}

// Function to parse CV using Google Gemini
async function parseCVWithAI(cvText) {
  try {
    if (!GEMINI_API_KEY || !genAI) {
      console.log('Gemini API key missing');
      throw new Error('Gemini API key not configured');
    }

    console.log('Gemini API key found, making request...');

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
You are an expert CV/Resume parser. Extract the following information from this CV text and return it as a JSON object:

{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string"
  },
  "education": {
    "university": "string",
    "degree": "string",
    "major": "string",
    "graduationYear": "string",
    "gpa": "number or null"
  },
  "skills": ["array of skills as strings"],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["array of technologies"]
    }
  ],
  "certifications": ["array of certifications"],
  "languages": ["array of languages"]
}

Only extract information that is clearly present in the CV. Use null for missing fields. Return ONLY the JSON object, no additional text. Here's the CV text:

${cvText}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    console.log('Gemini response:', aiResponse);
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI parsing error:', error);
    throw new Error('Failed to parse CV with AI: ' + error.message);
  }
}

// @route   POST /api/cv/upload
// @desc    Upload and parse CV
// @access  Private
router.post('/upload', (req, res, next) => {
  console.log('CV upload request received');
  auth(req, res, (err) => {
    if (err) {
      console.log('Auth error:', err);
      return res.status(401).json({ message: 'Authentication failed' });
    }
    console.log('Auth successful, user:', req.user?.id);
    upload.single('cv')(req, res, (uploadErr) => {
      if (uploadErr) {
        console.log('Upload error:', uploadErr);
        return res.status(400).json({ message: uploadErr.message });
      }
      handleCVUpload(req, res);
    });
  });
});

async function handleCVUpload(req, res) {
  try {
    console.log('CV upload started');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file.originalname, 'Size:', req.file.size);
    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();

    // Extract text from file
    console.log('Extracting text from CV...');
    const cvText = await extractTextFromFile(filePath, fileType);
    console.log('Text extracted, length:', cvText.length);

    // Parse CV with AI
    console.log('Parsing CV with AI...');
    const parsedData = await parseCVWithAI(cvText);
    console.log('AI parsing completed:', parsedData);

    // Update user profile with parsed data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields with parsed data - with validation
    try {
      // Update personal information
      if (parsedData.personalInfo?.firstName && typeof parsedData.personalInfo.firstName === 'string') {
        user.firstName = parsedData.personalInfo.firstName;
      }
      if (parsedData.personalInfo?.lastName && typeof parsedData.personalInfo.lastName === 'string') {
        user.lastName = parsedData.personalInfo.lastName;
      }
      if (parsedData.personalInfo?.email && typeof parsedData.personalInfo.email === 'string') {
        // Only update email if it's different from current one
        if (user.email !== parsedData.personalInfo.email) {
          console.log('Note: CV contains different email than profile:', parsedData.personalInfo.email);
        }
      }
      
      // Update education information
      if (parsedData.education?.university && typeof parsedData.education.university === 'string') {
        user.university = parsedData.education.university;
      }
      if (parsedData.education?.major && typeof parsedData.education.major === 'string') {
        user.major = parsedData.education.major;
      }
      if (parsedData.education?.degree && typeof parsedData.education.degree === 'string') {
        // Map degree to year if possible
        const degreeToYear = {
          'bachelor': '3rd Year',
          'undergraduate': '2nd Year', 
          'masters': 'Graduate',
          'master': 'Graduate',
          'phd': 'PhD',
          'doctorate': 'PhD'
        };
        const lowerDegree = parsedData.education.degree.toLowerCase();
        for (const [key, value] of Object.entries(degreeToYear)) {
          if (lowerDegree.includes(key)) {
            user.year = value;
            break;
          }
        }
      }
      if (parsedData.education?.graduationYear && typeof parsedData.education.graduationYear === 'string') {
        // Convert graduation year to date
        const gradYear = parseInt(parsedData.education.graduationYear);
        if (gradYear && gradYear > 2020 && gradYear < 2030) {
          user.expectedGraduation = new Date(gradYear, 5, 1); // June 1st of graduation year
        }
      }
      if (parsedData.education?.gpa && typeof parsedData.education.gpa === 'number') {
        user.gpa = Math.min(parsedData.education.gpa, 4.0); // Cap at 4.0
      }
      
      // Replace skills (don't merge)
      if (parsedData.skills && Array.isArray(parsedData.skills) && parsedData.skills.length > 0) {
        const validSkills = parsedData.skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0);
        user.skills = [...new Set(validSkills)]; // Replace with new skills only
      }
      
      // Replace experience (don't merge) - with deduplication
      if (parsedData.experience && Array.isArray(parsedData.experience) && parsedData.experience.length > 0) {
        const validExperience = parsedData.experience
          .filter(exp => exp.company && exp.position)
          .map(exp => ({
            company: exp.company.trim(),
            position: exp.position.trim(),
            startDate: exp.startDate ? exp.startDate.trim() : '',
            endDate: exp.endDate ? exp.endDate.trim() : '',
            description: exp.description ? exp.description.trim() : '',
            location: exp.location ? exp.location.trim() : ''
          }));

        // Deduplicate experience entries based on company, position, and start date
        const deduplicatedExperience = [];
        const seen = new Set();
        
        for (const exp of validExperience) {
          const key = `${exp.company.toLowerCase()}-${exp.position.toLowerCase()}-${exp.startDate}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduplicatedExperience.push(exp);
          }
        }
          
        if (deduplicatedExperience.length > 0) {
          user.experience = deduplicatedExperience; // Replace with deduplicated experience only
          
          // Also update career preferences based on experience
          const industries = deduplicatedExperience
            .map(exp => exp.company)
            .slice(0, 3); // Take first 3 companies
            
          user.careerPreferences = user.careerPreferences || {};
          user.careerPreferences.industries = [...new Set(industries)]; // Replace industries too
        }
      }
      
      // Replace projects (don't merge) - with deduplication
      if (parsedData.projects && Array.isArray(parsedData.projects) && parsedData.projects.length > 0) {
        const validProjects = parsedData.projects
          .filter(project => project.name)
          .map(project => ({
            name: project.name.trim(),
            description: project.description ? project.description.trim() : '',
            technologies: Array.isArray(project.technologies) ? project.technologies : [],
            url: project.url ? project.url.trim() : '',
            startDate: project.startDate ? project.startDate.trim() : '',
            endDate: project.endDate ? project.endDate.trim() : ''
          }));

        // Deduplicate projects based on name
        const deduplicatedProjects = [];
        const seen = new Set();
        
        for (const project of validProjects) {
          const key = project.name.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            deduplicatedProjects.push(project);
          }
        }
          
        if (deduplicatedProjects.length > 0) {
          user.projects = deduplicatedProjects; // Replace with deduplicated projects only
        }
      }
      
      // Replace certifications (don't merge) - with deduplication
      if (parsedData.certifications && Array.isArray(parsedData.certifications) && parsedData.certifications.length > 0) {
        const validCertifications = parsedData.certifications
          .filter(cert => typeof cert === 'string' || cert.name)
          .map(cert => {
            if (typeof cert === 'string') {
              return {
                name: cert.trim(),
                issuer: '',
                dateObtained: '',
                expiryDate: '',
                credentialId: ''
              };
            }
            return {
              name: cert.name ? cert.name.trim() : cert,
              issuer: cert.issuer ? cert.issuer.trim() : '',
              dateObtained: cert.dateObtained ? cert.dateObtained.trim() : '',
              expiryDate: cert.expiryDate ? cert.expiryDate.trim() : '',
              credentialId: cert.credentialId ? cert.credentialId.trim() : ''
            };
          });

        // Deduplicate certifications based on name
        const deduplicatedCertifications = [];
        const seen = new Set();
        
        for (const cert of validCertifications) {
          const key = cert.name.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            deduplicatedCertifications.push(cert);
          }
        }
          
        if (deduplicatedCertifications.length > 0) {
          user.certifications = deduplicatedCertifications; // Replace with deduplicated certifications only
        }
      }
      
      // Replace languages (don't merge) - with deduplication
      if (parsedData.languages && Array.isArray(parsedData.languages) && parsedData.languages.length > 0) {
        const validLanguages = parsedData.languages
          .filter(lang => typeof lang === 'string' && lang.trim().length > 0)
          .map(lang => ({
            language: lang.trim(),
            proficiency: 'Conversational' // Default proficiency
          }));

        // Deduplicate languages based on language name
        const deduplicatedLanguages = [];
        const seen = new Set();
        
        for (const lang of validLanguages) {
          const key = lang.language.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            deduplicatedLanguages.push(lang);
          }
        }
          
        if (deduplicatedLanguages.length > 0) {
          user.languages = deduplicatedLanguages; // Replace with deduplicated languages only
        }
      }
      
      console.log('User data after parsing update:', {
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university,
        major: user.major,
        gpa: user.gpa,
        skills: user.skills?.length,
        experience: user.experience?.length,
        projects: user.projects?.length,
        certifications: user.certifications?.length,
        languages: user.languages?.length,
        profileCompleted: user.profileCompleted
      });
    } catch (updateError) {
      console.error('Error updating user fields:', updateError);
      throw new Error('Failed to update user profile with parsed data');
    }

    // Store CV file path
    user.resumeUrl = req.file.filename;

    // Skip profile completion check for now to avoid casting error
    console.log('Skipping profile completion update to avoid casting error');

    await user.save();

    // Clean up uploaded file (optional - keep for now)
    // fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'CV uploaded and parsed successfully',
      parsedData,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university,
        major: user.major,
        year: user.year,
        expectedGraduation: user.expectedGraduation,
        skills: user.skills,
        gpa: user.gpa,
        resumeUrl: user.resumeUrl,
        experience: user.experience,
        projects: user.projects,
        certifications: user.certifications,
        languages: user.languages,
        careerPreferences: user.careerPreferences,
        locationPreference: user.locationPreference,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('CV upload error:', error);
    
    // Clean up file if upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      message: 'Failed to process CV',
      error: error.message 
    });
  }
}

// @route   GET /api/cv/download/:filename
// @desc    Download CV file
// @access  Private
router.get('/download/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/cvs', filename);

    // Verify user owns this CV
    const user = await User.findById(req.user.id);
    if (!user || user.resumeUrl !== filename) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('CV download error:', error);
    res.status(500).json({ message: 'Failed to download CV' });
  }
});

// @route   DELETE /api/cv/delete
// @desc    Delete user's CV
// @access  Private
router.delete('/delete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resumeUrl) {
      const filePath = path.join(__dirname, '../../uploads/cvs', user.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      user.resumeUrl = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('CV delete error:', error);
    res.status(500).json({ message: 'Failed to delete CV' });
  }
});

module.exports = router;
