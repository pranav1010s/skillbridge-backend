const express = require('express');
const Match = require('../models/Match');
const Business = require('../models/Business');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate skill match percentage
const calculateSkillMatch = (userSkills, businessSkills) => {
  if (!userSkills.length || !businessSkills.length) return 0;
  
  const matchedSkills = userSkills.filter(userSkill => 
    businessSkills.some(businessSkill => 
      businessSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
      userSkill.toLowerCase().includes(businessSkill.toLowerCase())
    )
  );
  
  return (matchedSkills.length / userSkills.length) * 100;
};

// Calculate industry match
const calculateIndustryMatch = (userPreferences, businessIndustry) => {
  if (!userPreferences.industries || !userPreferences.industries.length) return 50;
  
  const isMatch = userPreferences.industries.some(industry => 
    industry.toLowerCase().includes(businessIndustry.toLowerCase()) ||
    businessIndustry.toLowerCase().includes(industry.toLowerCase())
  );
  
  return isMatch ? 100 : 25;
};

// @route   POST /api/matches/generate
// @desc    Generate matches for current user
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.profileCompleted) {
      return res.status(400).json({ message: 'Please complete your profile first' });
    }

    const { lat, lng } = user.locationPreference.coordinates;
    const radius = user.locationPreference.radius;

    // Find businesses within radius
    const radiusInMeters = radius * 1609.34;
    const businesses = await Business.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      },
      isActive: true
    });

    // Clear existing matches for this user
    await Match.deleteMany({ userId: user._id });

    const matches = [];

    for (const business of businesses) {
      const distance = calculateDistance(lat, lng, business.coordinates.lat, business.coordinates.lng);
      
      // Skip if outside radius
      if (distance > radius) continue;

      const skillsMatch = calculateSkillMatch(user.skills, business.relevantSkills);
      const industryMatch = calculateIndustryMatch(user.careerPreferences, business.industry);
      const locationMatch = Math.max(0, 100 - (distance / radius) * 100);

      // Calculate overall relevance score (weighted)
      const relevanceScore = Math.round(
        (skillsMatch * 0.4) + 
        (industryMatch * 0.3) + 
        (locationMatch * 0.3)
      );

      // Only create matches with relevance score > 20
      if (relevanceScore > 20) {
        const matchedSkills = user.skills.filter(userSkill => 
          business.relevantSkills.some(businessSkill => 
            businessSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
            userSkill.toLowerCase().includes(businessSkill.toLowerCase())
          )
        );

        const match = new Match({
          userId: user._id,
          businessId: business._id,
          relevanceScore,
          matchFactors: {
            skillsMatch,
            locationMatch,
            industryMatch,
            distance
          },
          matchedSkills
        });

        await match.save();
        matches.push(match);
      }
    }

    res.json({
      success: true,
      message: `Generated ${matches.length} matches`,
      matchCount: matches.length
    });
  } catch (error) {
    console.error('Match generation error:', error);
    res.status(500).json({ message: 'Error generating matches' });
  }
});

// @route   GET /api/matches
// @desc    Get matches for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find({ userId: req.user.id, isActive: true })
      .populate('businessId')
      .sort({ relevanceScore: -1 });

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

// @route   POST /api/matches/:matchId/draft-email
// @desc    Generate email draft for a match
// @access  Private
router.post('/:matchId/draft-email', auth, async (req, res) => {
  try {
    const match = await Match.findOne({ 
      _id: req.params.matchId, 
      userId: req.user.id 
    }).populate('businessId');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const user = await User.findById(req.user.id);
    const business = match.businessId;

    // Generate personalized email content
    const subject = `${user.year} ${user.major} Student - Internship/Part-time Opportunity Inquiry`;
    
    const skillsText = match.matchedSkills.length > 0 
      ? `I have experience with ${match.matchedSkills.slice(0, 3).join(', ')}`
      : `I have skills in ${user.skills.slice(0, 3).join(', ')}`;

    const emailBody = `Dear Hiring Manager,

I hope this email finds you well. My name is ${user.fullName}, and I am a ${user.year} ${user.major} student at ${user.university}. I am writing to inquire about potential internship or part-time opportunities at ${business.name}.

${skillsText}, which I believe would be valuable for your ${business.industry.toLowerCase()} operations. I am particularly interested in ${business.name} because of your work in ${business.industry.toLowerCase()} and your location in ${business.address.city}.

I am eager to gain practical experience and contribute to your team while learning from industry professionals. I would welcome the opportunity to discuss how my academic background and enthusiasm can benefit your organization.

I have attached my resume for your review and would be happy to provide any additional information you might need. Thank you for considering my inquiry, and I look forward to hearing from you.

Best regards,
${user.fullName}
${user.email}
${user.university} - ${user.major}
Expected Graduation: ${new Date(user.expectedGraduation).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

    // Mark email as drafted
    match.emailDrafted = true;
    await match.save();

    res.json({
      success: true,
      emailDraft: {
        to: business.contactInfo.email,
        subject,
        body: emailBody,
        businessName: business.name,
        contactEmail: business.contactInfo.email
      }
    });
  } catch (error) {
    console.error('Email draft error:', error);
    res.status(500).json({ message: 'Error generating email draft' });
  }
});

// @route   PUT /api/matches/:matchId/email-sent
// @desc    Mark email as sent
// @access  Private
router.put('/:matchId/email-sent', auth, async (req, res) => {
  try {
    const match = await Match.findOneAndUpdate(
      { _id: req.params.matchId, userId: req.user.id },
      { 
        emailSent: true, 
        emailSentDate: new Date() 
      },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({
      success: true,
      message: 'Email marked as sent',
      match
    });
  } catch (error) {
    console.error('Mark email sent error:', error);
    res.status(500).json({ message: 'Error updating match' });
  }
});

module.exports = router;
