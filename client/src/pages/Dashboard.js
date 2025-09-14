import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  Chip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import Logo from '../components/Logo';
import {
  Business,
  LocationOn,
  Person,
  Assignment,
  AccountCircle,
  Delete,
  Email,
  Phone,
  Work
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CVUpload from '../components/CVUpload';
import OpportunityFinder from '../components/OpportunityFinder';
import axios from 'axios';

const Dashboard = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState('');
  const [emailDialog, setEmailDialog] = useState({ open: false, job: null });
  const [emailTemplate, setEmailTemplate] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);

  useEffect(() => {
    if (user && !user.profileCompleted) {
      navigate('/onboarding');
      return;
    }
    if (user && user.profileCompleted) {
      loadSavedJobs();
    }
  }, [user, navigate]);

  const loadSavedJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/saved-jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSavedJobs(response.data.savedJobs);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:5001/api/saved-jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSavedJobs(savedJobs.filter(job => job._id !== jobId));
    } catch (error) {
      setError('Failed to remove job');
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGenerateEmail = async (job) => {
    setEmailDialog({ open: true, job });
    setGeneratingEmail(true);
    setEmailTemplate('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/opportunities/generate-email', {
        businessName: job.company,
        businessDescription: job.description,
        potentialRoles: [job.title],
        contactSuggestion: job.pitch || '',
        contactEmail: job.contactEmail || '',
        phone: job.phone || '',
        industry: job.industry || ''
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setEmailTemplate(response.data.emailTemplate);
    } catch (error) {
      console.error('Error generating email:', error);
      setError('Failed to generate email template');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleCloseEmailDialog = () => {
    setEmailDialog({ open: false, job: null });
    setEmailTemplate('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailTemplate);
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1100
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              py: 2,
              px: 0
            }}
          >
            {/* Left: Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Logo size={36} />
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-0.5px'
                }}
              >
                SkillBridge
              </Typography>
            </Box>

            {/* Right: Welcome and Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                Welcome, {user?.firstName}
              </Typography>
              
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    width: 44,
                    height: 44,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <AccountCircle sx={{ fontSize: 24 }} />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      minWidth: 180
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem 
                    onClick={() => { handleMenuClose(); navigate('/profile'); }}
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' }
                    }}
                  >
                    <Person sx={{ mr: 2, fontSize: 20, color: '#6366f1' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Profile
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleMenuClose(); navigate('/applications'); }}
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' }
                    }}
                  >
                    <Assignment sx={{ mr: 2, fontSize: 20, color: '#6366f1' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Applications
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={logout}
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* CV Upload Section */}
          <CVUpload />

          {/* Opportunity Finder Section */}
          <OpportunityFinder />


        {/* Saved Jobs Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Saved Jobs
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Jobs you've saved from the AI Opportunity Finder
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Saved Jobs Grid */}
        {savedJobs.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No saved jobs yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use the AI Opportunity Finder above to discover and save jobs that match your profile
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {savedJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        {job.title}
                      </Typography>
                      <IconButton
                        onClick={() => handleRemoveJob(job._id)}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.company}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Box>

                    {job.industry && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Work sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.industry}
                        </Typography>
                      </Box>
                    )}

                    {job.contactEmail && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.contactEmail}
                        </Typography>
                      </Box>
                    )}

                    {job.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.phone}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </Typography>

                    {job.pitch && (
                      <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="primary.dark" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Why You're a Great Fit:
                        </Typography>
                        <Typography variant="body2" color="primary.dark" sx={{ fontSize: '0.85rem' }}>
                          {job.pitch}
                        </Typography>
                      </Box>
                    )}
                    
                    {job.requirements && job.requirements.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Requirements:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Chip key={index} label={req} size="small" variant="outlined" />
                          ))}
                          {job.requirements.length > 3 && (
                            <Chip label={`+${job.requirements.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', mb: 2 }}>
                      <Chip label={job.jobType} size="small" color="primary" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        Saved {new Date(job.savedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Email />}
                        onClick={() => handleGenerateEmail(job)}
                        sx={{ flex: 1 }}
                      >
                        Generate Email
                      </Button>
                    </Box>
                    
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Email Generation Dialog */}
      <Dialog
        open={emailDialog.open}
        onClose={handleCloseEmailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Generate Cold Email for {emailDialog.job?.company}
        </DialogTitle>
        <DialogContent>
          {generatingEmail ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Generating personalized email template...</Typography>
            </Box>
          ) : emailTemplate ? (
            <TextField
              multiline
              rows={12}
              fullWidth
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              variant="outlined"
              sx={{ mt: 2 }}
              helperText="You can edit this template before copying it"
            />
          ) : (
            <Typography>Failed to generate email template. Please try again.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog}>
            Close
          </Button>
          {emailTemplate && (
            <Button
              onClick={copyToClipboard}
              variant="contained"
              startIcon={<Email />}
            >
              Copy to Clipboard
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Dashboard;
