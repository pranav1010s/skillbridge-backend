'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TextField,
  Divider
} from '@mui/material';
import Logo from '@/components/Logo';
import {
  Business,
  LocationOn,
  Person,
  Assignment,
  Description,
  AccountCircle,
  Delete,
  Email,
  Phone,
  Work
} from '@mui/icons-material';

import { useAuth } from '@/contexts/AuthContext';
import CVUpload from '@/components/CVUpload';
import OpportunityFinder from '@/components/OpportunityFinder';
import ProfileCompletionCard from '@/components/ProfileCompletionCard';
import NextStepsCard from '@/components/NextStepsCard';
import AchievementBadges from '@/components/AchievementBadges';
import axios from 'axios';
import config from '@/config';

const Dashboard = () => {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState('');
  const [emailDialog, setEmailDialog] = useState({ open: false, job: null });
  const [emailTemplate, setEmailTemplate] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);

  useEffect(() => {
    if (user && !user.profileCompleted) {
      router.push('/onboarding');
      return;
    }
    if (user && user.profileCompleted) {
      loadSavedJobs();
      loadProfileCompletion();
    }
  }, [user, router]);

  const loadProfileCompletion = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/users/profile/completion`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfileCompletion(response.data.completion);
    } catch (error) {
      console.error('Error loading profile completion:', error);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/saved-jobs`, {
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
      await axios.delete(`${config.API_URL}/api/saved-jobs/${jobId}`, {
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
      const response = await axios.post(`${config.API_URL}/api/opportunities/generate-email`, {
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
      {/* Premium Glass Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              justifyContent: 'space-between',
              py: 1.5,
              px: 2,
              width: '100%',
              minHeight: 70
            }}
          >
            {/* Logo Area */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Logo size={40} />
              <Typography
                variant="h5"
                className="text-gradient"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.5px'
                }}
              >
                SkillBridge
              </Typography>
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' }, mr: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {user?.email}
                </Typography>
              </Box>

              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    width: 45,
                    height: 45,
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.4)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Person />
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
                  <MenuItem onClick={() => { handleMenuClose(); router.push('/profile'); }}>
                    <Person sx={{ mr: 2, fontSize: 20, color: '#6366f1' }} />
                    <Typography variant="body2" fontWeight={500}>Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    <Typography variant="body2" fontWeight={500} color="error">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        py: 8,
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(255,255,255,0) 100%)'
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
                className="fade-in-up"
              >
                Welcome back,<br />
                <span className="text-gradient">{user?.firstName}</span>
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 600, fontWeight: 400 }}
                className="fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                Your AI-powered career assistant is ready. Upload your CV to get started or explore new opportunities tailored just for you.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }} className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Description />}
                  onClick={() => router.push('/ai-cv-editor')}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    py: 1.5,
                    px: 4,
                    background: 'var(--primary-gradient)',
                    boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)',
                    '&:hover': {
                      boxShadow: '0 20px 30px -10px rgba(99, 102, 241, 0.6)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Open AI Editor
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Person />}
                  onClick={() => router.push('/profile')}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    py: 1.5,
                    px: 4,
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    '&:hover': {
                      borderColor: '#cbd5e1',
                      bgcolor: 'white',
                      color: '#1e293b'
                    }
                  }}
                >
                  View Profile
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                className="glass-panel fade-in-up"
                style={{ animationDelay: '0.3s' }}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    mr: 2
                  }}>
                    <Assignment />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Quick Stats</Typography>
                    <Typography variant="caption" color="text.secondary">Your activity overview</Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {savedJobs.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Saved Jobs
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: '#ec4899' }}>
                        {user?.profileCompleted ? '100%' : '50%'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Profile Status
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Profile Completion & Next Steps - Top Priority */}
        {profileCompletion && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={6}>
              <ProfileCompletionCard
                percentage={profileCompletion.percentage || 0}
                missingFields={profileCompletion.missingFields || []}
                isComplete={profileCompletion.isComplete || false}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <NextStepsCard
                nextSteps={profileCompletion.nextSteps || []}
                profilePercentage={profileCompletion.percentage || 0}
              />
            </Grid>
          </Grid>
        )}

        {/* Achievement Badges */}
        {profileCompletion && (
          <Box sx={{ mb: 4 }}>
            <AchievementBadges
              profilePercentage={profileCompletion.percentage || 0}
              hasCV={!!user?.resumeUrl}
              savedJobsCount={savedJobs.length}
            />
          </Box>
        )}

        {/* CV Upload Section */}
        <CVUpload />

        {/* Opportunity Finder Section */}
        <div id="opportunities">
          <OpportunityFinder />
        </div>


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
          <Card
            className="glass-panel fade-in-up"
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              border: '1px dashed rgba(99, 102, 241, 0.3)',
              background: 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <Work sx={{ fontSize: 40, color: '#6366f1' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={700}>
              No saved jobs yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Use the AI Opportunity Finder above to discover and save jobs that match your profile perfectly.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Start Searching
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {savedJobs.map((job, index) => (
              <Grid item xs={12} md={6} lg={4} key={job._id}>
                <Card
                  className="hover-lift fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.05)',
                    background: 'white',
                    overflow: 'visible'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Chip
                          label={job.jobType}
                          size="small"
                          sx={{
                            mb: 1,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            fontWeight: 600,
                            borderRadius: '8px'
                          }}
                        />
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {job.company}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveJob(job._id)}
                        size="small"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#64748b' }}>
                          <LocationOn sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                      </Box>

                      {job.industry && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#64748b' }}>
                            <Work sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.industry}
                          </Typography>
                        </Box>
                      )}

                      {job.contactEmail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#64748b' }}>
                            <Email sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            {job.contactEmail}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {job.pitch && (
                      <Box sx={{
                        mb: 3,
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                        borderRadius: 3,
                        border: '1px solid rgba(99, 102, 241, 0.1)'
                      }}>
                        <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <Assignment sx={{ fontSize: 14 }} /> WHY YOU'RE A MATCH
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {job.pitch}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Email />}
                        onClick={() => handleGenerateEmail(job)}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.2,
                          background: '#1e293b',
                          boxShadow: 'none',
                          '&:hover': {
                            background: '#334155',
                            boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)'
                          }
                        }}
                      >
                        Generate Cold Email
                      </Button>
                      <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: 1.5 }}>
                        Saved on {new Date(job.savedAt).toLocaleDateString()}
                      </Typography>
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
