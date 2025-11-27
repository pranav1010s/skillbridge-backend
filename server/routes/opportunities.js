const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const aiService = require('../services/aiService');

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

    // Build comprehensive user profile
    const userProfile = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      university: user.university || 'Not specified',
      major: user.major || 'Not specified',
      year: user.year || 'Not specified',
      skills: user.skills || [],
      gpa: user.gpa || 'Not specified',
      workExperience: user.experience || [], // Note: User model uses 'experience', not 'workExperience'
      projects: user.projects || [],
      certifications: user.certifications || [],
      languages: user.languages || [],
      interests: user.interests || []
    };

    const criteria = { location, radius, jobTypes, userPrompt: prompt, industries };

    // Generate business recommendations using AI Service
    const opportunities = await aiService.findOpportunities(userProfile, criteria);

    res.json({
      success: true,
      location,
      radius,
      opportunities,
      totalFound: opportunities.length
    });

  } catch (error) {
    console.error('Opportunity finder error:', error);
    // Return fallback opportunities if AI fails
    const fallbackOps = getFallbackOpportunities(req.user, req.body.location);
    res.json({
      success: true,
      location: req.body.location,
      radius: req.body.radius || 10,
      opportunities: fallbackOps,
      totalFound: fallbackOps.length,
      isFallback: true,
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

    const userProfile = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      university: user.university || 'University',
      major: user.major || 'their field of study',
      year: user.year || 'current year',
      skills: user.skills || [],
      workExperience: user.experience || [],
      projects: user.projects || [],
      certifications: user.certifications || [],
      languages: user.languages || [],
      interests: user.interests || []
    };

    const businessDetails = {
      businessName,
      businessDescription,
      potentialRoles,
      contactSuggestion,
      contactEmail,
      phone,
      industry
    };

    // Generate enhanced CV-based cold email template using AI Service
    const emailTemplate = await aiService.generateColdEmail(userProfile, businessDetails);

    res.json({
      success: true,
      businessName,
      emailTemplate
    });

  } catch (error) {
    console.error('Enhanced email template generation error:', error);
    // Fallback
    const fallbackTemplate = getFallbackEnhancedEmailTemplate(
      req.user,
      req.body.businessName,
      req.body.businessDescription,
      req.body.potentialRoles || [],
      req.body.contactEmail
    );
    res.json({
      success: true,
      businessName: req.body.businessName,
      emailTemplate: fallbackTemplate,
      isFallback: true
    });
  }
});

// @route   POST /api/opportunities/email-template
// @desc    Generate cold email template for a specific business (legacy)
// @access  Private
router.post('/email-template', auth, async (req, res) => {
  // Redirect legacy requests to the new enhanced generator if possible, or keep simple
  // For now, let's map it to the new service but with minimal data
  try {
    const { businessName, businessType, contactName = '', jobType = 'internship' } = req.body;

    if (!businessName || !businessType) {
      return res.status(400).json({ message: 'Business name and type are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userProfile = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      university: user.university,
      major: user.major,
      year: user.year,
      skills: user.skills,
      workExperience: user.experience || [],
      projects: user.projects || [],
      certifications: [],
      languages: [],
      interests: []
    };

    const businessDetails = {
      businessName,
      businessDescription: `A ${businessType} company offering ${jobType} opportunities.`,
      potentialRoles: [jobType],
      contactSuggestion: contactName,
      contactEmail: '',
      phone: '',
      industry: businessType
    };

    const emailTemplate = await aiService.generateColdEmail(userProfile, businessDetails);

    res.json({
      success: true,
      businessName,
      emailTemplate
    });

  } catch (error) {
    console.error('Email template generation error:', error);
    const fallback = getFallbackEmailTemplate(req.user, req.body.businessName, req.body.businessType, req.body.contactName, req.body.jobType);
    res.json({ success: true, businessName: req.body.businessName, emailTemplate: fallback, isFallback: true });
  }
});

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
${user.skills && user.skills.length > 0 ? `• Technical skills: ${user.skills.slice(0, 3).join(', ')}` : '• Strong academic foundation in my field'}
${user.experience && user.experience.length > 0 ? `• Experience: ${user.experience[0].position} at ${user.experience[0].company}` : '• Eagerness to apply classroom knowledge in real-world settings'}
${user.projects && user.projects.length > 0 ? `• Project experience: ${user.projects[0].name}` : '• Commitment to continuous learning and growth'}

I believe my ${user.major} background and ${user.skills && user.skills.length > 0 ? 'technical skills' : 'academic foundation'} would allow me to contribute meaningfully to your team while gaining valuable industry experience.

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

${user.skills && user.skills.length > 0 ? `I have developed skills in ${user.skills.slice(0, 3).join(', ')}, which I believe could be valuable to your team.` : 'I am eager to apply my academic knowledge in a real-world setting.'}

I would be grateful for the opportunity to discuss how I could contribute to ${businessName} as a ${jobType} or volunteer. I am flexible with scheduling and committed to making a meaningful impact.

Would you be available for a brief conversation about potential opportunities? I would be happy to send my resume and discuss how I can add value to your organization.

Thank you for your time and consideration.

Best regards,
${user.firstName} ${user.lastName}
${user.email || '[Your Email]'}
[Your Phone Number]`;
}

module.exports = router;
