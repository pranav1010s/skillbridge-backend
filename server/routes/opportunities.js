const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// @route   POST /api/opportunities/find
// @desc    Find suitable businesses for job opportunities based on user location and profile
// @access  Private
router.post('/find', auth, async (req, res) => {
  try {
    const { location, radius = 10, jobTypes = [], prompt = '', industries = [] } = req.body;
    
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Finding opportunities for user:', user.firstName, 'in location:', location);

    // Generate business recommendations using AI
    const opportunities = await findBusinessOpportunities(user, location, radius, jobTypes, prompt, industries);
    
    res.json({
      success: true,
      location,
      radius,
      opportunities,
      totalFound: opportunities.length
    });

  } catch (error) {
    console.error('Opportunity finder error:', error);
    res.status(500).json({ 
      message: 'Failed to find opportunities',
      error: error.message 
    });
  }
});

// @route   POST /api/opportunities/generate-email
// @desc    Generate enhanced CV-based cold email template
// @access  Private
router.post('/generate-email', auth, async (req, res) => {
  try {
    const { 
      businessName, 
      businessDescription, 
      potentialRoles = [], 
      contactSuggestion = '',
      contactEmail = '',
      phone = '',
      industry = ''
    } = req.body;
    
    if (!businessName) {
      return res.status(400).json({ message: 'Business name is required' });
    }

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Generating enhanced email template for:', businessName);

    // Generate enhanced CV-based cold email template
    const emailTemplate = await generateEnhancedColdEmailTemplate(
      user, 
      businessName, 
      businessDescription, 
      potentialRoles, 
      contactSuggestion,
      contactEmail,
      phone,
      industry
    );
    
    res.json({
      success: true,
      businessName,
      emailTemplate
    });

  } catch (error) {
    console.error('Enhanced email template generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate email template',
      error: error.message 
    });
  }
});

// @route   POST /api/opportunities/email-template
// @desc    Generate cold email template for a specific business (legacy)
// @access  Private
router.post('/email-template', auth, async (req, res) => {
  try {
    const { businessName, businessType, contactName = '', jobType = 'internship' } = req.body;
    
    if (!businessName || !businessType) {
      return res.status(400).json({ message: 'Business name and type are required' });
    }

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Generating email template for:', businessName);

    // Generate personalized cold email template
    const emailTemplate = await generateColdEmailTemplate(user, businessName, businessType, contactName, jobType);
    
    res.json({
      success: true,
      businessName,
      emailTemplate
    });

  } catch (error) {
    console.error('Email template generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate email template',
      error: error.message 
    });
  }
});

// AI function to find business opportunities
async function findBusinessOpportunities(user, location, radius, jobTypes, userPrompt = '', industries = []) {
  try {
    if (!GEMINI_API_KEY || !genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build comprehensive user profile including CV data
    const userProfile = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      university: user.university || 'Not specified',
      major: user.major || 'Not specified',
      year: user.year || 'Not specified',
      skills: user.skills || [],
      gpa: user.gpa || 'Not specified',
      careerPreferences: user.careerPreferences || {},
      // Include CV parsed data
      workExperience: user.workExperience || [],
      projects: user.projects || [],
      certifications: user.certifications || [],
      languages: user.languages || [],
      interests: user.interests || []
    };

    const aiPrompt = `
You are an expert career advisor and business analyst. Based on the comprehensive student profile below, find suitable businesses in the specified location that would be excellent targets for cold outreach.

STUDENT PROFILE:
- Name: ${userProfile.name}
- Email: ${userProfile.email}
- University: ${userProfile.university}
- Major: ${userProfile.major}
- Year: ${userProfile.year}
- Skills: ${userProfile.skills.join(', ')}
- GPA: ${userProfile.gpa}
- Work Experience: ${userProfile.workExperience.map(exp => `${exp.position} at ${exp.company}`).join(', ') || 'None specified'}
- Projects: ${userProfile.projects.map(proj => proj.name).join(', ') || 'None specified'}
- Certifications: ${userProfile.certifications.join(', ') || 'None specified'}
- Languages: ${userProfile.languages.join(', ') || 'None specified'}
- Interests: ${userProfile.interests.join(', ') || 'None specified'}

SEARCH CRITERIA:
- Location: ${location}
- Search Radius: ${radius} miles
- Preferred Job Types: ${jobTypes.length > 0 ? jobTypes.join(', ') : 'Any'}
- User's Specific Request: ${userPrompt || 'General opportunities matching profile'}
- Preferred Industries: ${industries.length > 0 ? industries.join(', ') : 'Any industry'}

Please provide a JSON array of 10-15 suitable businesses with the following EXACT structure:
{
  "businesses": [
    {
      "company": "Fulcrum Manufacturing Ltd",
      "industry": "Precision machining",
      "contactEmail": "enquiries@fulcrummanufacturing.co.uk",
      "phone": "023 9269 9331",
      "pitch": "Support supplier orders, cost tracking and Excel reporting",
      "description": "Brief description of what they do",
      "whySuitable": "Why this business is a good match for the student based on their CV and profile",
      "potentialRoles": ["Role 1", "Role 2"],
      "contactSuggestion": "How to find the right person to contact",
      "likelihood": "High/Medium/Low",
      "location": "${location}"
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. The "pitch" field must be personalized based on the student's CV data, skills, and experience
2. Focus heavily on how the student's specific background matches each company's needs
3. Consider the user's prompt/request when selecting companies
4. Prioritize industries specified by the user
5. Make contact emails and phone numbers realistic for the location
6. Ensure "whySuitable" specifically references the student's CV data

Focus on:
1. Companies that align with the student's major, skills, and experience
2. Businesses that match the user's specific request/prompt
3. Companies in the preferred industries (if specified)
4. Local businesses that could benefit from the student's background
5. Startups and growing companies that hire students

Return ONLY the JSON object, no additional text.
`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    console.log('AI opportunity response received');
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return parsedResponse.businesses || [];

  } catch (error) {
    console.error('AI opportunity finder error:', error);
    // Return fallback opportunities if AI fails
    return getFallbackOpportunities(user, location);
  }
}

// Enhanced AI function to generate CV-based cold email template
async function generateEnhancedColdEmailTemplate(user, businessName, businessDescription, potentialRoles, contactSuggestion, contactEmail, phone, industry) {
  try {
    if (!GEMINI_API_KEY || !genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build comprehensive user profile including CV data
    const userProfile = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      university: user.university || 'University',
      major: user.major || 'their field of study',
      year: user.year || 'current year',
      skills: user.skills || [],
      workExperience: user.workExperience || [],
      projects: user.projects || [],
      certifications: user.certifications || [],
      languages: user.languages || [],
      interests: user.interests || []
    };

    const prompt = `
You are an expert at writing highly persuasive, personalized cold outreach emails for students. Create a compelling cold email that highlights how the student's specific background will benefit the company.

STUDENT PROFILE:
- Name: ${userProfile.name}
- Email: ${userProfile.email}
- University: ${userProfile.university}
- Major: ${userProfile.major}
- Year: ${userProfile.year}
- Skills: ${userProfile.skills.join(', ')}
- Work Experience: ${userProfile.workExperience.map(exp => `${exp.position} at ${exp.company} (${exp.duration})`).join(', ') || 'None specified'}
- Projects: ${userProfile.projects.map(proj => `${proj.name}: ${proj.description}`).join(', ') || 'None specified'}
- Certifications: ${userProfile.certifications.join(', ') || 'None specified'}
- Languages: ${userProfile.languages.join(', ') || 'None specified'}
- Interests: ${userProfile.interests.join(', ') || 'None specified'}

TARGET COMPANY:
- Company Name: ${businessName}
- Industry: ${industry}
- Description: ${businessDescription}
- Potential Roles: ${potentialRoles.join(', ')}
- Contact Email: ${contactEmail}
- Phone: ${phone}
- Contact Suggestion: ${contactSuggestion}

REQUIREMENTS:
1. Subject line that grabs attention
2. Personalized opening that shows research about the company
3. Highlight 2-3 specific skills/experiences that directly benefit this company
4. Reference specific potential roles or how the student can contribute
5. Show genuine enthusiasm and cultural fit
6. Professional but conversational tone
7. Clear, specific call to action
8. Keep under 250 words
9. Include proper email formatting (Subject, greeting, body, signature)

Focus on VALUE PROPOSITION - what specific benefits the student brings to THIS company based on their CV and the company's needs.

Return a complete, ready-to-send email template.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailTemplate = response.text();
    
    console.log('Enhanced email template generated successfully');
    return emailTemplate;

  } catch (error) {
    console.error('AI enhanced email template error:', error);
    return getFallbackEnhancedEmailTemplate(user, businessName, businessDescription, potentialRoles, contactEmail);
  }
}

// AI function to generate cold email template (legacy)
async function generateColdEmailTemplate(user, businessName, businessType, contactName, jobType) {
  try {
    if (!GEMINI_API_KEY || !genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const userProfile = {
      name: `${user.firstName} ${user.lastName}`,
      university: user.university || 'University',
      major: user.major || 'their field of study',
      year: user.year || 'current year',
      skills: user.skills || []
    };

    const prompt = `
You are an expert at writing professional cold outreach emails for students seeking internships and work experience. 

Create a personalized, professional cold email template for the following:

Student Details:
- Name: ${userProfile.name}
- University: ${userProfile.university}
- Major: ${userProfile.major}
- Year: ${userProfile.year}
- Skills: ${userProfile.skills.join(', ')}

Target Business:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Contact Name: ${contactName || '[Contact Name]'}
- Opportunity Type: ${jobType}

Requirements:
1. Professional but friendly tone
2. Concise (under 200 words)
3. Highlight relevant skills and experience
4. Show genuine interest in the company
5. Clear call to action
6. Include placeholders for customization

Return the email template as plain text, ready to copy and use.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailTemplate = response.text();
    
    console.log('Email template generated successfully');
    return emailTemplate;

  } catch (error) {
    console.error('AI email template error:', error);
    return getFallbackEmailTemplate(user, businessName, businessType, contactName, jobType);
  }
}

// Fallback opportunities if AI fails
function getFallbackOpportunities(user, location) {
  const fallbackBusinesses = [
    {
      name: "Local Tech Startups",
      type: "Technology",
      size: "Small",
      description: "Growing technology companies in the area",
      whySuitable: "Tech startups often need help with various projects and are open to student interns",
      potentialRoles: ["Software Development Intern", "Marketing Assistant", "Data Analyst"],
      contactSuggestion: "Look for founders or hiring managers on LinkedIn",
      likelihood: "Medium"
    },
    {
      name: "Regional Marketing Agencies",
      type: "Marketing & Advertising",
      size: "Medium",
      description: "Local marketing and advertising agencies",
      whySuitable: "Agencies frequently hire students for creative projects and campaign support",
      potentialRoles: ["Marketing Intern", "Social Media Assistant", "Content Creator"],
      contactSuggestion: "Contact the HR department or creative director",
      likelihood: "High"
    },
    {
      name: "Local Accounting Firms",
      type: "Professional Services",
      size: "Small to Medium",
      description: "Regional accounting and financial services firms",
      whySuitable: "Professional services firms often have structured internship programs",
      potentialRoles: ["Accounting Intern", "Tax Preparation Assistant", "Audit Support"],
      contactSuggestion: "Reach out to partners or HR managers",
      likelihood: "Medium"
    }
  ];

  return fallbackBusinesses;
}

// Fallback enhanced email template if AI fails
function getFallbackEnhancedEmailTemplate(user, businessName, businessDescription, potentialRoles, contactEmail) {
  const roles = potentialRoles.length > 0 ? potentialRoles.join(' or ') : 'internship opportunities';
  const contact = contactEmail ? contactEmail.split('@')[0] : 'Hiring Manager';
  
  return `Subject: ${user.major} Student - Interest in ${roles} at ${businessName}

Dear ${contact},

I hope this email finds you well. My name is ${user.firstName} ${user.lastName}, and I am a ${user.year} ${user.major} student at ${user.university}.

I am writing to express my strong interest in ${roles} at ${businessName}. After researching your company, I am impressed by ${businessDescription || 'your innovative work in the industry'}.

My background includes:
${user.skills.length > 0 ? `• Technical skills: ${user.skills.slice(0, 3).join(', ')}` : '• Strong academic foundation in my field'}
${user.workExperience.length > 0 ? `• Experience: ${user.workExperience[0].position} at ${user.workExperience[0].company}` : '• Eagerness to apply classroom knowledge in real-world settings'}
${user.projects.length > 0 ? `• Project experience: ${user.projects[0].name}` : '• Commitment to continuous learning and growth'}

I believe my ${user.major} background and ${user.skills.length > 0 ? 'technical skills' : 'academic foundation'} would allow me to contribute meaningfully to your team while gaining valuable industry experience.

I would welcome the opportunity to discuss how I can add value to ${businessName}. I am available for a brief call or meeting at your convenience and would be happy to provide my resume and portfolio.

Thank you for considering my interest. I look forward to hearing from you.

Best regards,
${user.firstName} ${user.lastName}
${user.email || '[Your Email]'}
[Your Phone Number]`;
}

// Fallback email template if AI fails (legacy)
function getFallbackEmailTemplate(user, businessName, businessType, contactName, jobType) {
  const contact = contactName || '[Contact Name]';
  
  return `Subject: ${user.year} ${user.major} Student Seeking ${jobType} Opportunity

Dear ${contact},

I hope this email finds you well. My name is ${user.firstName} ${user.lastName}, and I am a ${user.year} ${user.major} student at ${user.university}.

I am reaching out because I am very interested in gaining practical experience in ${businessType.toLowerCase()}, and I believe ${businessName} would be an excellent place to learn and contribute.

${user.skills.length > 0 ? `I have developed skills in ${user.skills.slice(0, 3).join(', ')}, which I believe could be valuable to your team.` : 'I am eager to apply my academic knowledge in a real-world setting.'}

I would be grateful for the opportunity to discuss how I could contribute to ${businessName} as a ${jobType} or volunteer. I am flexible with scheduling and committed to making a meaningful impact.

Would you be available for a brief conversation about potential opportunities? I would be happy to send my resume and discuss how I can add value to your organization.

Thank you for your time and consideration.

Best regards,
${user.firstName} ${user.lastName}
${user.email || '[Your Email]'}
[Your Phone Number]`;
}

module.exports = router;
