import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  LinearProgress,
  useTheme,
  Paper
} from '@mui/material';
import {
  School,
  WorkspacePremium,
  LocationOn,
  ArrowForward,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import Logo from '../components/Logo';

const steps = ['Academic Info', 'Skills & Experience', 'Location & Preferences'];

const majors = [
  'Computer Science', 'Engineering', 'Business Administration', 'Marketing',
  'Data Science', 'Mechanical Engineering', 'Electrical Engineering',
  'Supply Chain Management', 'Finance', 'Psychology', 'Biology', 'Chemistry'
];

const skillOptions = [
  'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'C++',
  'AutoCAD', 'SolidWorks', 'Excel', 'PowerPoint', 'Photoshop', 'Illustrator',
  'Digital Marketing', 'Social Media', 'Content Writing', 'SEO', 'Google Analytics',
  'Project Management', 'Leadership', 'Communication', 'Problem Solving',
  'Data Analysis', 'Machine Learning', 'Statistics', 'Tableau', 'R'
];

const industries = [
  'Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Marketing',
  'Education', 'Retail', 'Consulting', 'Non-profit', 'Government'
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const [formData, setFormData] = useState({
    university: '',
    major: '',
    year: '',
    expectedGraduation: '',
    skills: [],
    gpa: '',
    city: '',
    postcode: '',
    radius: 10,
    jobTypes: [],
    industries: []
  });

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/universities`);
        if (response.data.success) {
          setUniversities(response.data.universities);
        }
      } catch (error) {
        console.error('Error loading universities:', error);
        setUniversities([
          'University of Oxford',
          'University of Cambridge',
          'Imperial College London',
          'University College London (UCL)',
          'King\'s College London',
          'London School of Economics and Political Science (LSE)'
        ]);
      } finally {
        setLoadingUniversities(false);
      }
    };

    loadUniversities();
  }, []);

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!formData.university || !formData.major || !formData.year || !formData.expectedGraduation) {
        throw new Error('Please fill in all required academic information');
      }

      if (!formData.city || !formData.postcode) {
        throw new Error('Please fill in both city and postcode');
      }

      const geocodeResponse = await axios.post(`${config.API_URL}/api/users/geocode`, {
        postcode: formData.postcode,
        city: formData.city
      });

      const coordinates = geocodeResponse.data.coordinates;

      const profileData = {
        firstName: user.firstName,
        lastName: user.lastName,
        university: formData.university,
        major: formData.major,
        year: formData.year,
        expectedGraduation: new Date(formData.expectedGraduation),
        skills: formData.skills,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        locationPreference: {
          city: formData.city,
          postcode: formData.postcode,
          radius: formData.radius,
          coordinates
        },
        careerPreferences: {
          jobTypes: formData.jobTypes,
          industries: formData.industries
        }
      };

      const response = await axios.put(`${config.API_URL}/api/users/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        navigate('/dashboard');
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile submission error:', error);
      setError(error.response?.data?.message || error.message || 'Error completing profile');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 0: return <School />;
      case 1: return <WorkspacePremium />;
      case 2: return <LocationOn />;
      default: return null;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box className="fade-in-up">
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
              Tell us about your academic background
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Help us understand your educational journey
            </Typography>

            <Autocomplete
              options={universities}
              value={formData.university}
              onChange={(event, newValue) => {
                setFormData({ ...formData, university: newValue || '' });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="University"
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'white'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                      }
                    }
                  }}
                  helperText={loadingUniversities ? "Loading UK universities..." : "Search from 150+ UK universities"}
                />
              )}
              loading={loadingUniversities}
              freeSolo
              filterOptions={(options, { inputValue }) => {
                const filtered = options.filter(option =>
                  option.toLowerCase().includes(inputValue.toLowerCase())
                );
                return filtered.slice(0, 10);
              }}
            />

            <Autocomplete
              options={majors}
              value={formData.major}
              onChange={(event, newValue) => {
                setFormData({ ...formData, major: newValue || '' });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Major/Course"
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      '&:hover': { backgroundColor: 'white' },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                      }
                    }
                  }}
                />
              )}
              freeSolo
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Year of Study</InputLabel>
              <Select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }
                }}
              >
                <MenuItem value="1st Year">1st Year</MenuItem>
                <MenuItem value="2nd Year">2nd Year</MenuItem>
                <MenuItem value="3rd Year">3rd Year</MenuItem>
                <MenuItem value="4th Year">4th Year</MenuItem>
                <MenuItem value="Graduate">Graduate</MenuItem>
                <MenuItem value="PhD">PhD</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Expected Graduation"
              type="date"
              value={formData.expectedGraduation}
              onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }
                }
              }}
            />

            <TextField
              fullWidth
              label="GPA (Optional)"
              type="number"
              inputProps={{ min: 0, max: 4, step: 0.01 }}
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }
                }
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box className="fade-in-up">
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
              What skills do you have?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Select at least 3 skills that represent your abilities
            </Typography>

            <Autocomplete
              multiple
              options={skillOptions}
              value={formData.skills}
              onChange={(event, newValue) => {
                setFormData({ ...formData, skills: newValue });
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: '#6366f1',
                      color: '#6366f1'
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  placeholder="Select or type your skills"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      '&:hover': { backgroundColor: 'white' },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                      }
                    }
                  }}
                />
              )}
              freeSolo
            />
          </Box>
        );
      case 2:
        return (
          <Box className="fade-in-up">
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
              Where would you like to work?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Tell us your location preferences
            </Typography>

            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }
                }
              }}
              helperText="Enter your city (e.g., London, Manchester, Edinburgh)"
            />

            <TextField
              fullWidth
              label="Postcode"
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }
                }
              }}
              helperText="Enter your UK postcode (e.g., SW1A 1AA, M1 1AA)"
              inputProps={{
                pattern: "^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$",
                placeholder: "SW1A 1AA"
              }}
            />

            <TextField
              fullWidth
              label="Search Radius (miles)"
              type="number"
              inputProps={{ min: 1, max: 50 }}
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }
                }
              }}
            />

            <Autocomplete
              multiple
              options={['Internship', 'Part-time', 'Co-op', 'Project-based']}
              value={formData.jobTypes}
              onChange={(event, newValue) => {
                setFormData({ ...formData, jobTypes: newValue });
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: '#6366f1',
                      color: '#6366f1'
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preferred Job Types"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      '&:hover': { backgroundColor: 'white' },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                      }
                    }
                  }}
                />
              )}
            />

            <Autocomplete
              multiple
              options={industries}
              value={formData.industries}
              onChange={(event, newValue) => {
                setFormData({ ...formData, industries: newValue });
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: '#6366f1',
                      color: '#6366f1'
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Industries of Interest"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      '&:hover': { backgroundColor: 'white' },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                      }
                    }
                  }}
                />
              )}
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: 4
      }}
    >
      {/* Animated Background Orbs */}
      <Box
        className="animate-float"
        sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          top: '-200px',
          left: '-150px',
          filter: 'blur(60px)'
        }}
      />
      <Box
        className="animate-float"
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          filter: 'blur(60px)',
          animationDelay: '2s'
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          className="glass-card-strong fade-in-up"
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Gradient Top Border */}
          <Box
            className="animate-gradient"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              backgroundSize: '200% 100%'
            }}
          />

          {/* Logo and Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box className="animate-scale-in" sx={{ display: 'inline-block', mb: 2 }}>
              <Logo size={50} />
            </Box>
            <Typography
              variant="h3"
              className="text-gradient"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}
            >
              Complete Your Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Just a few more details to get you started
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 10,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }
                }}
              />
              <Typography variant="caption" sx={{ position: 'absolute', right: 0, top: 12, fontWeight: 600, color: '#6366f1' }}>
                {Math.round(progress)}% Complete
              </Typography>
            </Box>
          </Box>

          {/* Modern Stepper */}
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 5,
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#10b981'
              },
              '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                color: '#10b981'
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#6366f1'
              },
              '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
                color: '#6366f1',
                fontWeight: 700
              },
              '& .MuiStepIcon-root': {
                fontSize: '2rem'
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: index < activeStep
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : index === activeStep
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : 'rgba(203, 213, 225, 0.3)',
                        color: index <= activeStep ? 'white' : '#94a3b8',
                        boxShadow: index <= activeStep ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                        transition: 'all 0.3s ease',
                        border: '2px solid',
                        borderColor: index <= activeStep ? 'transparent' : '#e2e8f0'
                      }}
                    >
                      {index < activeStep ? <CheckCircle /> : getStepIcon(index)}
                    </Box>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.2)',
                bgcolor: 'rgba(254, 242, 242, 0.8)'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ minHeight: 400, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#64748b',
                border: '2px solid #e2e8f0',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  borderColor: '#cbd5e1'
                },
                '&:disabled': {
                  borderColor: '#f1f5f9',
                  color: '#cbd5e1'
                }
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
              className="hover-glow"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 180,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  opacity: 0.6
                },
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {loading ? 'Processing...' : activeStep === steps.length - 1 ? 'Complete Profile' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Onboarding;
