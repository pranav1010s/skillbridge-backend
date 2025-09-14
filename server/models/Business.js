const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: String,
    website: String,
    linkedInUrl: String
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  },
  logoUrl: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  dataSource: {
    type: String,
    enum: ['manual', 'google_places', 'yelp', 'linkedin'],
    default: 'manual'
  },
  googlePlaceId: {
    type: String,
    unique: true,
    sparse: true
  },
  yelpId: {
    type: String,
    unique: true,
    sparse: true
  },
  relevantSkills: [{
    type: String,
    trim: true
  }],
  typicalRoles: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for location-based queries
businessSchema.index({ coordinates: '2dsphere' });

// Index for text search
businessSchema.index({
  name: 'text',
  industry: 'text',
  description: 'text',
  'relevantSkills': 'text'
});

// Get full address
businessSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode } = this.address;
  return [street, city, state, zipCode].filter(Boolean).join(', ');
});

// Ensure virtual fields are serialized
businessSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Business', businessSchema);
