const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const axios = require('axios');
const { calculateProfileCompletion } = require('../utils/profileCompletion');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      university,
      degree,
      major,
      year,
      expectedGraduation,
      education,
      skills,
      gpa,
      locationPreference,
      careerPreferences,
      phone
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields with validation
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    // Handle nested education object if provided (from Profile.js)
    if (education) {
      if (education.university) user.university = education.university;
      if (education.degree) user.degree = education.degree;
      if (education.major) user.major = education.major;
      if (education.graduationYear) {
        const gradDate = new Date(education.graduationYear);
        if (!isNaN(gradDate.getTime())) {
          user.expectedGraduation = gradDate;
        }
      }
      if (education.gpa !== undefined && education.gpa !== null && education.gpa !== '') {
        const gpaNum = parseFloat(education.gpa);
        if (!isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 4) {
          user.gpa = gpaNum;
        }
      }
    }

    // Also handle flat fields (for backwards compatibility)
    if (university) user.university = university;
    if (degree) user.degree = degree;
    if (major) user.major = major;
    if (year) user.year = year;
    if (expectedGraduation) {
      // Ensure expectedGraduation is a valid date
      const gradDate = new Date(expectedGraduation);
      if (isNaN(gradDate.getTime())) {
        return res.status(400).json({ message: 'Invalid graduation date' });
      }
      user.expectedGraduation = gradDate;
    }
    if (skills && Array.isArray(skills)) user.skills = skills;
    if (gpa !== undefined && gpa !== null && gpa !== '') {
      const gpaNum = parseFloat(gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
        return res.status(400).json({ message: 'GPA must be between 0 and 4' });
      }
      user.gpa = gpaNum;
    }
    if (locationPreference) {
      // Ensure locationPreference has required structure
      user.locationPreference = {
        ...user.locationPreference,
        ...locationPreference
      };
    }
    if (careerPreferences) {
      // Ensure careerPreferences has required structure
      user.careerPreferences = {
        ...user.careerPreferences,
        ...careerPreferences
      };
    }

    // Check if profile is completed
    const requiredFields = ['university', 'major', 'year', 'expectedGraduation'];
    console.log('Checking profile completion:', {
      university: user.university,
      major: user.major,
      year: user.year,
      expectedGraduation: user.expectedGraduation,
      skillsLength: user.skills ? user.skills.length : 0,
      locationPreference: user.locationPreference,
      postcode: user.locationPreference ? user.locationPreference.postcode : null
    });

    const hasRequiredFields = requiredFields.every(field => user[field]);
    const hasSkills = user.skills && user.skills.length > 0;
    const hasPostcode = user.locationPreference && user.locationPreference.postcode;

    const isCompleted = hasRequiredFields && hasSkills && hasPostcode;
    console.log('Profile completion result:', { hasRequiredFields, hasSkills, hasPostcode, isCompleted });

    user.profileCompleted = Boolean(isCompleted);

    await user.save();

    res.json({
      success: true,
      user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({
      message: 'Server error during profile update',
      error: error.message
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/profile/completion
// @desc    Get profile completion status
// @access  Private
router.get('/profile/completion', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const completion = calculateProfileCompletion(user);

    res.json({
      success: true,
      completion
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/geocode
// @desc    Geocode UK postcode to coordinates
// @access  Public (no auth required for geocoding)
router.post('/geocode', async (req, res) => {
  try {
    const { postcode, city } = req.body;

    if (!postcode) {
      return res.status(400).json({ message: 'Postcode is required' });
    }

    let coordinates = { lat: 51.5074, lng: -0.1278 }; // Default to London

    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        // Use both city and postcode for better accuracy
        const address = city ? `${postcode}, ${city}, UK` : `${postcode}, UK`;

        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address: address,
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          coordinates = { lat: location.lat, lng: location.lng };
        }
      } catch (error) {
        console.error('Google Maps API error:', error);
        // Use fallback coordinates
      }
    } else {
      console.log('Google Maps API key not found, using fallback coordinates for London');
    }

    res.json({ success: true, coordinates });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Error geocoding location' });
  }
});

module.exports = router;
