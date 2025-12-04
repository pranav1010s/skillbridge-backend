import React, { useState, useContext } from 'react';
/* eslint-disable */
// @ts-nocheck
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
  const [country, setCountry] = useState('');
  const [rolePosition, setRolePosition] = useState('');
  const [companySizeRange, setCompanySizeRange] = useState('51-100');
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

  const jobTypeOptions = ['Part-time', 'Full-time', 'Internship', 'Contract', 'Project-based'];

  const companySizeOptions = [
    '1-10',
    '11-50',
    '51-100',
    '101-250',
    '251-500',
    '500+'
  ];

  const countryOptions = [
    'United Kingdom',
    'United States',
    'Canada',
    'Germany',
    'France',
    'Spain',
    'Netherlands',
    'Australia',
    'India',
    'Singapore'
  ];

  const industryOptions = [
    'Manufacturing', 'Technology', 'Healthcare', 'Finance', 'Education',
    'Retail', 'Construction', 'Transportation', 'Hospitality', 'Media',
    'Real Estate', 'Legal Services', 'Consulting', 'Non-profit', 'Government',
    'Energy', 'Agriculture', 'Telecommunications', 'Automotive', 'Aerospace'
  ];

  const handleJobTypeChange = (event) => {
    const value = event.target.value;
    setJobTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSearch = async () => {
    if (!location.trim() && !country) {
      setError('Please enter a location or select a country');
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
          country,
          rolePosition: rolePosition.trim(),
          companySizeRange,
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
        setSuccess(`Found ${response.data.opportunities.length} companies perfect for cold email outreach!`);
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
          industry: business.industry,
          employeeCount: business.employeeCount || business.companySizeCategory,
          decisionMaker: business.decisionMaker
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
              🎯 AI Cold Email Opportunity Finder
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              Find small companies (50-100 employees) perfect for cold email outreach.
              Target decision-makers directly and create your own opportunities!
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

            {/* Row 2: Role Position and Country */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px' }}>
                <TextField
                  fullWidth
                  label="Role/Position You're Looking For"
                  value={rolePosition}
                  onChange={(e) => setRolePosition(e.target.value)}
                  placeholder="e.g., Procurement Analyst, Marketing Intern"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: '56px'
                    }
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    label="Country"
                    sx={{
                      borderRadius: 2,
                      height: '56px'
                    }}
                  >
                    <MenuItem value="">
                      <em>Any</em>
                    </MenuItem>
                    {countryOptions.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: '1 1 180px' }}>
                <TextField
                  fullWidth
                  label="City (Optional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Manchester"
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: '56px'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Row 3: Company Size, Job Types, Industries */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 160px', minWidth: '140px' }}>
                <FormControl fullWidth>
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    value={companySizeRange}
                    onChange={(event) => setCompanySizeRange(event.target.value)}
                    label="Company Size"
                    sx={{
                      borderRadius: 2,
                      height: '56px'
                    }}
                  >
                    {companySizeOptions.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} employees
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                      borderRadius: 2,
                      height: '56px',
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
                      borderRadius: 2,
                      height: '56px',
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
                {loading ? 'Searching...' : '🎯 Find Cold Email Targets'}
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
            🎯 Companies Perfect for Cold Email Outreach
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
                      {business.industry} • {business.employeeCount || business.companySizeCategory || 'Small (50-100)'} employees • {business.location}
                    </Typography>
                    {business.pitch && (
                      <Typography variant="body2" color="primary.main" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        "{business.pitch}"
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                    <Chip
                      label={`${business.coldEmailScore || 'High'} Cold Email Score`}
                      color={business.coldEmailScore === 'High' ? 'success' : business.coldEmailScore === 'Medium' ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid xs={12} md={8}>
                    {(business.website || business.linkedIn) && (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Website:</strong> {business.website || business.linkedIn || 'N/A'}
                      </Typography>
                    )}

                    {business.decisionMaker && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ mb: 0.5 }}>
                          <strong>Decision Maker:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          • Title: {business.decisionMaker.title || 'CEO/Hiring Manager'}
                        </Typography>
                        {business.decisionMaker.estimatedEmail && (
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            • Email Format: {business.decisionMaker.estimatedEmail}
                          </Typography>
                        )}
                        {business.decisionMaker.howToFind && (
                          <Typography variant="body2" sx={{ ml: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                            {business.decisionMaker.howToFind}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Description:</strong> {business.description}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Why Perfect for Cold Outreach:</strong> {business.whySuitableForColdEmail || business.whySuitable}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Potential roles:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {business.potentialRoles?.map((role, roleIndex) => (
                        <Chip key={roleIndex} label={role} variant="outlined" size="small" />
                      ))}
                    </Box>

                    {business.bestTimeToContact && (
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        <strong>Best Time to Contact:</strong> {business.bestTimeToContact}
                      </Typography>
                    )}
                  </Grid>

                  <Grid xs={12} md={4}>
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
