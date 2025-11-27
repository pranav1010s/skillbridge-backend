const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  university: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  degree: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  major: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  year: {
    type: String,
    required: false,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD'],
    default: '1st Year'
  },
  expectedGraduation: {
    type: Date,
    required: false,
    default: null
  },
  skills: [{
    type: String,
    trim: true
  }],
  resumeUrl: {
    type: String,
    default: null
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0,
    default: null
  },
  locationPreference: {
    city: { type: String, default: '' },
    postcode: { type: String, default: '' },
    radius: { type: Number, default: 10 },
    coordinates: {
      lat: { type: Number, default: 51.5074 },
      lng: { type: Number, default: -0.1278 }
    }
  },
  careerPreferences: {
    jobTypes: [{
      type: String,
      enum: ['Internship', 'Part-time', 'Co-op', 'Project-based', 'Full-time', 'Graduate Jobs', 'Select All']
    }],
    industries: [{
      type: String,
      trim: true
    }]
  },
  experience: [{
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true }
  }],
  projects: [{
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    technologies: [{ type: String, trim: true }],
    url: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true }
  }],
  certifications: [{
    name: { type: String, trim: true },
    issuer: { type: String, trim: true },
    dateObtained: { type: String, trim: true },
    expiryDate: { type: String, trim: true },
    credentialId: { type: String, trim: true }
  }],
  languages: [{
    language: { type: String, trim: true },
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
      default: 'Conversational'
    }
  }],
  interests: [{
    type: String,
    trim: true
  }],
  summary: {
    type: String,
    trim: true,
    default: ''
  },
  customSections: [{
    title: { type: String, trim: true, required: true },
    content: { type: String, trim: true },
    items: [{ type: String, trim: true }],
    type: {
      type: String,
      enum: ['text', 'list'],
      default: 'text'
    },
    order: { type: Number, default: 0 }
  }],
  profileCompleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: {
    type: String,
    default: undefined
  },
  passwordResetExpires: {
    type: Date,
    default: undefined
  },
  savedJobs: [{
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    salary: { type: String },
    jobType: { type: String },
    url: { type: String },
    contactEmail: { type: String },
    phone: { type: String },
    industry: { type: String },
    pitch: { type: String },
    savedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
