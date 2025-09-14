const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  relevanceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchFactors: {
    skillsMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    locationMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    industryMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    distance: {
      type: Number, // in miles
      required: true
    }
  },
  matchedSkills: [{
    type: String,
    trim: true
  }],
  emailDrafted: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentDate: {
    type: Date,
    default: null
  },
  response: {
    received: {
      type: Boolean,
      default: false
    },
    responseDate: {
      type: Date,
      default: null
    },
    responseType: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate matches
matchSchema.index({ userId: 1, businessId: 1 }, { unique: true });

// Index for efficient querying
matchSchema.index({ userId: 1, relevanceScore: -1 });
matchSchema.index({ businessId: 1, relevanceScore: -1 });

module.exports = mongoose.model('Match', matchSchema);
