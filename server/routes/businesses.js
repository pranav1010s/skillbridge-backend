const express = require('express');
const Business = require('../models/Business');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/businesses/search
// @desc    Search businesses near user location
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 10, industry, skills } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Convert radius from miles to meters for MongoDB
    const radiusInMeters = radius * 1609.34;

    let query = {
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      },
      isActive: true
    };

    // Add industry filter if provided
    if (industry) {
      query.industry = new RegExp(industry, 'i');
    }

    // Add skills filter if provided
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.relevantSkills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    const businesses = await Business.find(query).limit(50);

    res.json({
      success: true,
      count: businesses.length,
      businesses
    });
  } catch (error) {
    console.error('Business search error:', error);
    res.status(500).json({ message: 'Server error during business search' });
  }
});

// @route   GET /api/businesses/:id
// @desc    Get single business
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/businesses/populate-sample
// @desc    Populate database with sample businesses (for development)
// @access  Private
router.post('/populate-sample', auth, async (req, res) => {
  try {
    const sampleBusinesses = [
      {
        name: 'TechStart Solutions',
        industry: 'Technology',
        description: 'A growing software development company specializing in web applications',
        address: {
          street: '123 Shoreditch High Street',
          city: 'London',
          postcode: 'E1 6JE'
        },
        coordinates: { lat: 51.5254, lng: -0.0754 },
        contactInfo: {
          email: 'careers@techstart.co.uk',
          phone: '+44 20 7946 0958',
          website: 'https://techstart.co.uk'
        },
        companySize: '11-50',
        relevantSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        typicalRoles: ['Software Developer Intern', 'Frontend Developer', 'Backend Developer']
      },
      {
        name: 'Manchester Manufacturing Co',
        industry: 'Manufacturing',
        description: 'Sustainable manufacturing company focused on eco-friendly products',
        address: {
          street: '456 Industrial Way',
          city: 'Manchester',
          postcode: 'M1 2HF'
        },
        coordinates: { lat: 53.4808, lng: -2.2426 },
        contactInfo: {
          email: 'hr@manchestermfg.co.uk',
          phone: '+44 161 123 4567',
          website: 'https://manchestermfg.co.uk'
        },
        companySize: '51-200',
        relevantSkills: ['CAD', 'AutoCAD', 'Mechanical Engineering', 'Quality Control', 'Lean Manufacturing'],
        typicalRoles: ['Engineering Intern', 'Quality Assurance', 'Production Assistant']
      },
      {
        name: 'Creative Marketing Hub',
        industry: 'Marketing',
        description: 'Full-service digital marketing agency helping local businesses grow',
        address: {
          street: '789 Creative Lane',
          city: 'Birmingham',
          postcode: 'B1 1AA'
        },
        coordinates: { lat: 52.4862, lng: -1.8904 },
        contactInfo: {
          email: 'jobs@creativehub.co.uk',
          phone: '+44 121 496 0123',
          website: 'https://creativehub.co.uk'
        },
        companySize: '11-50',
        relevantSkills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Adobe Creative Suite', 'SEO'],
        typicalRoles: ['Marketing Intern', 'Content Creator', 'Social Media Assistant']
      },
      {
        name: 'DataFlow Analytics',
        industry: 'Data Science',
        description: 'Data analytics consultancy serving small and medium businesses',
        address: {
          street: '321 Data Drive',
          city: 'Edinburgh',
          postcode: 'EH1 1YZ'
        },
        coordinates: { lat: 55.9533, lng: -3.1883 },
        contactInfo: {
          email: 'careers@dataflow.co.uk',
          phone: '+44 131 496 0321',
          website: 'https://dataflow.co.uk'
        },
        companySize: '1-10',
        relevantSkills: ['Python', 'R', 'SQL', 'Tableau', 'Machine Learning', 'Statistics'],
        typicalRoles: ['Data Analyst Intern', 'Research Assistant', 'Business Intelligence Intern']
      },
      {
        name: 'Bristol FinTech',
        industry: 'Finance',
        description: 'Innovative financial technology startup focusing on SME banking solutions',
        address: {
          street: '15 Queen Square',
          city: 'Bristol',
          postcode: 'BS1 4NT'
        },
        coordinates: { lat: 51.4545, lng: -2.5879 },
        contactInfo: {
          email: 'talent@bristolfintech.co.uk',
          phone: '+44 117 496 0789',
          website: 'https://bristolfintech.co.uk'
        },
        companySize: '11-50',
        relevantSkills: ['JavaScript', 'Python', 'React', 'Financial Modeling', 'API Development'],
        typicalRoles: ['FinTech Developer Intern', 'Product Analyst', 'QA Tester']
      },
      {
        name: 'Leeds Healthcare Solutions',
        industry: 'Healthcare',
        description: 'Healthcare technology company developing patient management systems',
        address: {
          street: '88 Park Row',
          city: 'Leeds',
          postcode: 'LS1 5HD'
        },
        coordinates: { lat: 53.8008, lng: -1.5491 },
        contactInfo: {
          email: 'careers@leedshealthcare.co.uk',
          phone: '+44 113 496 0456',
          website: 'https://leedshealthcare.co.uk'
        },
        companySize: '51-200',
        relevantSkills: ['Java', 'Spring Boot', 'Healthcare IT', 'Database Management', 'GDPR Compliance'],
        typicalRoles: ['Software Developer Intern', 'Business Analyst', 'IT Support']
      }
    ];

    // Clear existing sample data
    await Business.deleteMany({ dataSource: 'manual' });

    // Insert sample businesses
    const insertedBusinesses = await Business.insertMany(sampleBusinesses);

    res.json({
      success: true,
      message: `${insertedBusinesses.length} sample businesses added`,
      businesses: insertedBusinesses
    });
  } catch (error) {
    console.error('Sample data population error:', error);
    res.status(500).json({ message: 'Error populating sample data' });
  }
});

module.exports = router;
