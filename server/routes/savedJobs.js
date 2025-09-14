const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/saved-jobs
// @desc    Get user's saved jobs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedJobs');
    res.json({
      success: true,
      savedJobs: user.savedJobs || []
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/saved-jobs
// @desc    Save a job
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, company, location, description, requirements, salary, jobType, url } = req.body;

    const user = await User.findById(req.user.id);
    
    // Check if job is already saved
    const existingJob = user.savedJobs.find(job => 
      job.title === title && job.company === company
    );
    
    if (existingJob) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Add job to saved jobs
    user.savedJobs.push({
      title,
      company,
      location,
      description,
      requirements: requirements || [],
      salary,
      jobType,
      url,
      savedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Job saved successfully',
      savedJob: user.savedJobs[user.savedJobs.length - 1]
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/saved-jobs/:jobId
// @desc    Remove a saved job
// @access  Private
router.delete('/:jobId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Remove job from saved jobs
    user.savedJobs = user.savedJobs.filter(job => 
      job._id.toString() !== req.params.jobId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Job removed from saved jobs'
    });
  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
