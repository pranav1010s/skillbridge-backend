'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import axios from 'axios';
import Logo from '@/components/Logo';
import config from '@/config';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  VpnKey as VpnKeyIcon,
  Person,
  School,
  Work,
  Code,
  Email,
  Phone,
  Dashboard as DashboardIcon,
  DeleteForever,
  Warning,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [deleteAuthOpen, setDeleteAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    education: {
      university: '',
      degree: '',
      major: '',
      graduationYear: '',
      gpa: ''
    },
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: []
  });

  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        education: {
          university: user.education?.university || user.university || '',
          degree: user.education?.degree || '',
          major: user.education?.major || user.major || '',
          graduationYear: user.education?.graduationYear || '',
          gpa: user.education?.gpa || user.gpa || ''
        },
        skills: user.skills || [],
        experience: user.experience || [],
        projects: user.projects || [],
        certifications: user.certifications || [],
        languages: user.languages || []
      });
    }
  }, [user]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${config.API_URL}/api/users/profile`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setSuccess('Profile updated successfully!');
        setEditDialogOpen(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setPasswordResetLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${config.API_URL}/api/auth/forgot-password`, {
        email: passwordResetEmail
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setPasswordResetDialogOpen(false);
        setPasswordResetEmail('');

        if (response.data.resetUrl) {
          console.log('Reset URL:', response.data.resetUrl);
          alert(`Password reset link generated!\n\nFor development: ${response.data.resetUrl}`);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending password reset email');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${config.API_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email: deleteEmail, password: deletePassword }
      });

      if (response.data.success) {
        // Clear all local data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to landing page
        router.push('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting account');
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      pb: 8
    }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Logo size={40} />
              <Typography
                variant="h5"
                className="text-gradient"
                sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}
              >
                SkillBridge
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<DashboardIcon />}
                onClick={() => router.push('/dashboard')}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.08)' }
                }}
              >
                Dashboard
              </Button>

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
                  <MenuItem onClick={() => { handleMenuClose(); router.push('/dashboard'); }}>
                    <DashboardIcon sx={{ mr: 2, fontSize: 20, color: '#6366f1' }} />
                    <Typography variant="body2" fontWeight={500}>Dashboard</Typography>
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

      <Container maxWidth={false} sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

        <Grid container spacing={4} justifyContent="center">
          {/* Left Column - Profile Summary */}
          <Grid item xs={12}>
            <Paper
              className="glass-panel fade-in-up"
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 100,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
              }} />

              <Avatar sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                border: '4px solid white',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                fontSize: 40,
                position: 'relative',
                zIndex: 1
              }}>
                {user.firstName[0]}
              </Avatar>

              <Typography variant="h5" fontWeight={700} gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {user.email}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                  sx={{ borderRadius: '8px' }}
                >
                  Edit Profile
                </Button>
                <IconButton
                  onClick={() => setPasswordResetDialogOpen(true)}
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  title="Reset Password"
                >
                  <VpnKeyIcon fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForever />}
                onClick={() => setDeleteWarningOpen(true)}
                fullWidth
                sx={{
                  borderRadius: '8px',
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  '&:hover': {
                    borderColor: '#dc2626',
                    bgcolor: 'rgba(239, 68, 68, 0.04)'
                  }
                }}
              >
                Delete Account
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" color="primary" /> Personal Details
                </Typography>
                {user.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">{user.phone}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{user.email}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Details */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Education */}
              <Paper
                className="glass-panel fade-in-up"
                style={{ animationDelay: '0.1s' }}
                sx={{ p: 3, borderRadius: 4 }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                    <School fontSize="small" />
                  </Box>
                  Education
                </Typography>

                {(user.education || user.university) ? (
                  <Box sx={{ pl: 2, borderLeft: '2px solid #e2e8f0' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.education?.university || user.university}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {user.education?.degree || user.degree} {(user.education?.major || user.major) && `in ${user.education?.major || user.major}`}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {user.education?.graduationYear && (
                        <Chip label={`Class of ${user.education.graduationYear}`} size="small" variant="outlined" />
                      )}
                      {(user.education?.gpa || user.gpa) && (
                        <Chip label={`GPA: ${user.education?.gpa || user.gpa}`} size="small" color="primary" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No education details added yet.
                  </Typography>
                )}
              </Paper>

              {/* Skills */}
              <Paper
                className="glass-panel fade-in-up"
                style={{ animationDelay: '0.2s' }}
                sx={{ p: 3, borderRadius: 4 }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                    <Code fontSize="small" />
                  </Box>
                  Skills
                </Typography>

                {user.skills && user.skills.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        sx={{
                          bgcolor: 'white',
                          border: '1px solid #e2e8f0',
                          fontWeight: 500,
                          '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No skills added yet.
                  </Typography>
                )}
              </Paper>

              {/* Experience */}
              <Paper
                className="glass-panel fade-in-up"
                style={{ animationDelay: '0.3s' }}
                sx={{ p: 3, borderRadius: 4 }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <Work fontSize="small" />
                  </Box>
                  Experience
                </Typography>

                {user.experience && user.experience.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {user.experience.map((exp, index) => (
                      <Box key={index} sx={{ pl: 2, borderLeft: '2px solid #e2e8f0', position: 'relative' }}>
                        <Box sx={{
                          position: 'absolute',
                          left: -5,
                          top: 0,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#10b981'
                        }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {exp.position}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={500} gutterBottom>
                          {exp.company}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </Typography>
                        {exp.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {exp.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No experience added yet.
                  </Typography>
                )}
              </Paper>

            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Edit Profile</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: 1 }}>Education</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="University"
                value={editData.education.university}
                onChange={(e) => setEditData({
                  ...editData,
                  education: { ...editData.education, university: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Degree"
                value={editData.education.degree}
                onChange={(e) => setEditData({
                  ...editData,
                  education: { ...editData.education, degree: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Major"
                value={editData.education.major}
                onChange={(e) => setEditData({
                  ...editData,
                  education: { ...editData.education, major: e.target.value }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              background: 'var(--primary-gradient)',
              px: 4
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog
        open={passwordResetDialogOpen}
        onClose={() => setPasswordResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={passwordResetEmail}
            onChange={(e) => setPasswordResetEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPasswordResetDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordReset}
            variant="contained"
            disabled={passwordResetLoading || !passwordResetEmail}
            sx={{ borderRadius: 2 }}
          >
            {passwordResetLoading ? <CircularProgress size={20} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Warning Dialog */}
      <Dialog
        open={deleteWarningOpen}
        onClose={() => setDeleteWarningOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ef4444' }}>
          <Warning />
          Warning: Permanent Account Deletion
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Deleting your account will permanently remove:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2, color: 'text.secondary' }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Your profile and personal information</Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>All saved jobs and applications</Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Your match history</Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>All account data and preferences</Typography>
          </Box>
          <Typography variant="body2" fontWeight={600}>
            Are you absolutely sure you want to delete your account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setDeleteWarningOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setDeleteWarningOpen(false);
              setDeleteAuthOpen(true);
            }}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Yes, Delete My Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Authentication Dialog */}
      <Dialog
        open={deleteAuthOpen}
        onClose={() => {
          setDeleteAuthOpen(false);
          setDeleteEmail('');
          setDeletePassword('');
          setShowDeletePassword(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Confirm Your Identity</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            To confirm account deletion, please enter your email and password.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={deleteEmail}
            onChange={(e) => setDeleteEmail(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete="email"
          />
          <TextField
            fullWidth
            label="Password"
            type={showDeletePassword ? 'text' : 'password'}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  edge="end"
                >
                  {showDeletePassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteAuthOpen(false);
              setDeleteEmail('');
              setDeletePassword('');
              setShowDeletePassword(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={deleteLoading || !deleteEmail || !deletePassword}
            sx={{ borderRadius: 2 }}
          >
            {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
