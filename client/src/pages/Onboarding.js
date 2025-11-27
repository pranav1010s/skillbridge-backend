import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config';
import {
  Box,
  Container,
  Paper,
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
  useTheme
} from '@mui/material';

const steps = ['Academic Info', 'Skills & Experience', 'Location & Preferences'];

// UK Universities will be loaded from API

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
  const { updateUser, user, token } = useAuth();
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

  // Load UK universities on component mount
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/universities`);
        if (response.data.success) {
          setUniversities(response.data.universities);
        }
      } catch (error) {
        console.error('Error loading universities:', error);
        // Fallback to a few UK universities if API fails
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
      console.log('Starting profile submission with data:', formData);
      console.log('Current user:', user);
      console.log('Current token:', token);

      // Authentication is handled by axios defaults in AuthContext

      // Validate required fields
      if (!formData.university || !formData.major || !formData.year || !formData.expectedGraduation) {
        throw new Error('Please fill in all required academic information');
      }

      if (!formData.city || !formData.postcode) {
        throw new Error('Please fill in both city and postcode');
      }

      // First geocode the UK postcode
      console.log('Geocoding postcode:', formData.postcode, 'city:', formData.city);
      const geocodeResponse = await axios.post(`${config.API_URL}/api/users/geocode`, {
        postcode: formData.postcode,
        city: formData.city
      });

      const coordinates = geocodeResponse.data.coordinates;
      console.log('Geocoding successful:', coordinates);

      // Update user profile
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

      console.log('Submitting profile data:', profileData);
      const response = await axios.put(`${config.API_URL}/api/users/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Profile update response:', response.data);

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

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Tell us about your academic background
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
                  sx={{ mb: 3 }}
                  helperText={loadingUniversities ? "Loading UK universities..." : "Search from 150+ UK universities"}
                />
              )}
              loading={loadingUniversities}
              freeSolo
              filterOptions={(options, { inputValue }) => {
                const filtered = options.filter(option =>
                  option.toLowerCase().includes(inputValue.toLowerCase())
                );
                return filtered.slice(0, 10); // Limit to 10 results for performance
              }}
            />
            <Autocomplete
              options={majors}
              value={formData.major}
              onChange={(event, newValue) => {
                setFormData({ ...formData, major: newValue || '' });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Major/Course" required sx={{ mb: 3 }} />
              )}
              freeSolo
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Year of Study</InputLabel>
              <Select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
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
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="GPA (Optional)"
              type="number"
              inputProps={{ min: 0, max: 4, step: 0.01 }}
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              What skills do you have?
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
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  placeholder="Select or type your skills"
                  helperText="Select at least 3 skills that represent your abilities"
                />
              )}
              freeSolo
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Where would you like to work?
            </Typography>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              sx={{ mb: 3 }}
              helperText="Enter your city (e.g., London, Manchester, Edinburgh)"
            />
            <TextField
              fullWidth
              label="Postcode"
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
              required
              sx={{ mb: 3 }}
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
              sx={{ mb: 3 }}
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
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Preferred Job Types" sx={{ mb: 3 }} />
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
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Industries of Interest" />
              )}
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" component="h1" textAlign="center" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 4 }}>
            Complete Your Profile
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Complete Profile'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Onboarding;
