const express = require('express');
const router = express.Router();
const ukUniversities = require('../data/ukUniversities');

// GET /api/universities - Get all UK universities
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      universities: ukUniversities,
      count: ukUniversities.length
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch universities'
    });
  }
});

// GET /api/universities/search - Search universities by name
router.get('/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json({
        success: true,
        universities: ukUniversities,
        count: ukUniversities.length
      });
    }

    const filteredUniversities = ukUniversities.filter(university =>
      university.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      universities: filteredUniversities,
      count: filteredUniversities.length,
      query
    });
  } catch (error) {
    console.error('Error searching universities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search universities'
    });
  }
});

module.exports = router;
