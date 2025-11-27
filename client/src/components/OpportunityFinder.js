import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config';

const OpportunityFinder = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const [jobTypes, setJobTypes] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailDialog, setEmailDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);

  const jobTypeOptions = ['Internship', 'Part-time', 'Co-op', 'Project-based', 'Volunteer'];

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Hospitality', 'Media',
    'Real Estate', 'Legal', 'Consulting', 'Non-profit', 'Government',
    'Energy', 'Agriculture', 'Telecommunications', 'Automotive', 'Aerospace'
  ];

  const handleJobTypeChange = (event) => {
    const value = event.target.value;
    setJobTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setOpportunities([]);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_URL}/api/opportunities/find`,
        {
          location: location.trim(),
          radius,
          jobTypes,
          prompt: prompt.trim(),
          industries: selectedIndustries
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setOpportunities(response.data.opportunities);
        setSuccess(`Found ${response.data.opportunities.length} opportunities!`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to find opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async (business) => {
    setSelectedBusiness(business);
    setEmailDialog(true);
    setEmailLoading(true);
    setEmailTemplate('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_URL}/api/opportunities/generate-email`,
        {
          businessName: business.company || business.name,
          businessDescription: business.description,
          potentialRoles: business.potentialRoles,
          contactSuggestion: business.contactSuggestion,
          contactEmail: business.contactEmail,
          phone: business.phone,
          industry: business.industry
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setEmailTemplate(response.data.emailTemplate);
      }
    } catch (err) {
      console.error('Email generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate email template');
    } finally {
      setEmailLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Email template copied to clipboard!');
  };

  const handleSaveJob = async (business) => {
    try {
      const token = localStorage.getItem('token');
      const jobData = {
        title: business.potentialRoles?.[0] || 'Opportunity',
        company: business.company || business.name,
        location: location,
        description: business.description,
        requirements: business.potentialRoles || [],
        jobType: jobTypes.length > 0 ? jobTypes.join(', ') : 'Various',
        url: business.website || '',
        contactEmail: business.contactEmail,
        phone: business.phone,
        industry: business.industry,
        pitch: business.pitch
      };

      const response = await axios.post(
        `${config.API_URL}/api/saved-jobs`,
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSavedJobs([...savedJobs, response.data.savedJob]);
        setSuccess('Job saved successfully!');
      }
    } catch (err) {
      console.error('Save job error:', err);
      setError(err.response?.data?.message || 'Failed to save job');
    }
  };

  const isJobSaved = (business) => {
    return savedJobs.some(job =>
      job.company === (business.company || business.name) && job.title === (business.potentialRoles?.[0] || 'Opportunity')
    );
  };

  const getLikelihoodColor = (likelihood) => {
    switch (likelihood?.toLowerCase()) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Card
        sx={{
          mb: 6,
          borderRadius: 3,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 2,
                letterSpacing: '-0.025em'
              }}
            >
              AI Opportunity Finder
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              Find personalized opportunities based on your location, preferences, and career goals
            </Typography>
          </Box>

          {/* Search Form */}
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {/* Row 1: What are you looking for */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="What are you looking for?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Entry-level software development role, Marketing internship with growth opportunities..."
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>

            {/* Row 2: Location, Radius, Job Types, Industries */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}>
                <TextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="NYC"
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: '56px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 120px', minWidth: '100px' }}>
                <TextField
                  fullWidth
                  label="Radius"
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  placeholder="10"
                  inputProps={{ min: 1, max: 100 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: '56px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 160px', minWidth: '140px' }}>
                <FormControl fullWidth>
                  <InputLabel
                    shrink={jobTypes.length > 0}
                    sx={{
                      fontSize: '0.875rem',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                  >
                    Job Types
                  </InputLabel>
                  <Select
                    multiple
                    value={jobTypes}
                    onChange={handleJobTypeChange}
                    input={<OutlinedInput label="Job Types" />}
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return '';
                      }
                      if (selected.length === 1) {
                        return selected[0];
                      }
                      return `${selected[0]} +${selected.length - 1}`;
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        height: '56px'
                      },
                      '& .MuiSelect-select': {
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        paddingTop: '16px',
                        paddingBottom: '16px'
                      }
                    }}
                  >
                    {jobTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: '1 1 160px', minWidth: '140px' }}>
                <FormControl fullWidth>
                  <InputLabel
                    shrink={selectedIndustries.length > 0}
                    sx={{
                      fontSize: '0.875rem',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                  >
                    Industries
                  </InputLabel>
                  <Select
                    multiple
                    value={selectedIndustries}
                    onChange={(event) => setSelectedIndustries(event.target.value)}
                    input={<OutlinedInput label="Industries" />}
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return '';
                      }
                      if (selected.length === 1) {
                        return selected[0];
                      }
                      return `${selected[0]} +${selected.length - 1}`;
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        height: '56px'
                      },
                      '& .MuiSelect-select': {
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        paddingTop: '16px',
                        paddingBottom: '16px'
                      }
                    }}
                  >
                    {industryOptions.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Search Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  bgcolor: '#6366f1',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    bgcolor: '#5856eb',
                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? 'Searching...' : 'Find Opportunities'}
              </Button>
            </Box>
          </Box>

          {/* Alerts */}
          {success && (
            <Alert
              severity="success"
              sx={{
                mt: 4,
                borderRadius: 2,
                maxWidth: '800px',
                mx: 'auto'
              }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 4,
                borderRadius: 2,
                maxWidth: '800px',
                mx: 'auto'
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Opportunities List */}
      {opportunities.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Found Opportunities
          </Typography>
          {opportunities.map((business, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {business.company || business.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {business.industry} • {business.location}
                    </Typography>
                    {business.pitch && (
                      <Typography variant="body2" color="primary.main" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        "{business.pitch}"
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={`${business.likelihood || 'High'} Match`}
                    color={getLikelihoodColor(business.likelihood || 'High')}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    {business.contactEmail && (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Contact Email:</strong> {business.contactEmail}
                      </Typography>
                    )}

                    {business.phone && (
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Phone:</strong> {business.phone}
                      </Typography>
                    )}

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Description:</strong> {business.description}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Why it's suitable:</strong> {business.whySuitable}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Potential roles:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {business.potentialRoles?.map((role, roleIndex) => (
                        <Chip key={roleIndex} label={role} variant="outlined" size="small" />
                      ))}
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Contact suggestion:</strong> {business.contactSuggestion}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<EmailIcon />}
                      onClick={() => handleGenerateEmail(business)}
                      sx={{ mb: 1 }}
                    >
                      Generate Cold Email
                    </Button>

                    <Button
                      fullWidth
                      variant={isJobSaved(business) ? "contained" : "outlined"}
                      startIcon={isJobSaved(business) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      onClick={() => handleSaveJob(business)}
                      disabled={isJobSaved(business)}
                      color={isJobSaved(business) ? "success" : "primary"}
                    >
                      {isJobSaved(business) ? 'Saved' : 'Save Job'}
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Email Template Dialog */}
      <Dialog
        open={emailDialog}
        onClose={() => setEmailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Cold Email Template for {selectedBusiness?.company || selectedBusiness?.name}
        </DialogTitle>

        <DialogContent>
          {emailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Personalized email template ready to use
                </Typography>
                <Tooltip title="Copy to clipboard">
                  <IconButton onClick={() => copyToClipboard(emailTemplate)}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={12}
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => copyToClipboard(emailTemplate)}
            disabled={emailLoading}
          >
            Copy Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OpportunityFinder;
