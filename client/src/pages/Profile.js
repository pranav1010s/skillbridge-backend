import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Logo from '../components/Logo';
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
  Autocomplete,
  useTheme,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const theme = useTheme();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  
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

  const groupSkillsByCategory = (skills) => {
    if (!skills || skills.length === 0) return {};
    
    const categories = {
      'Accounting & Reporting Support': ['Accounting', 'Data entry', 'Invoicing', 'Record-keeping', 'Financial reporting'],
      'Microsoft Excel & Analytics Tools': ['Microsoft Excel', 'Excel', 'Pivot Tables', 'VLOOKUP', 'Formulas', 'Tableau', 'Power BI', 'VBA', 'Macros'],
      'ERP & Systems': ['SAP', 'S/4HANA', 'ERP', 'ECC', 'Snowflake', 'Sage X3', 'TCPCM', 'PLM'],
      'Automation & Productivity Tools': ['Python', 'AI', 'LLM', 'Automation', 'Process improvement'],
      'Office Administration': ['Filing', 'Document preparation', 'Administrative support', 'Office management'],
      'Soft Skills': ['Strategic thinking', 'Communication', 'Teamwork', 'Problem-solving', 'Leadership']
    };

    const grouped = {};
    const uncategorized = [];

    skills.forEach(skill => {
      let categorized = false;
      for (const [category, categorySkills] of Object.entries(categories)) {
        if (categorySkills.some(catSkill => 
          skill.toLowerCase().includes(catSkill.toLowerCase()) ||
          catSkill.toLowerCase().includes(skill.toLowerCase())
        )) {
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(skill);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        uncategorized.push(skill);
      }
    });

    if (uncategorized.length > 0) {
      grouped['Other Skills'] = uncategorized;
    }

    return grouped;
  };

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

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5001/api/users/profile', editData, {
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
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', {
        email: passwordResetEmail
      });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setPasswordResetDialogOpen(false);
        setPasswordResetEmail('');
        
        // Show additional info if email service isn't configured
        if (response.data.resetUrl) {
          console.log('Reset URL (for development):', response.data.resetUrl);
          alert(`Password reset link generated!\n\nFor development: ${response.data.resetUrl}\n\nIn production, this would be sent via email.`);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending password reset email');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  if (!user) {
    return (
      <Paper sx={{ maxWidth: 800, mx: 'auto', p: 4, mt: 3 }}>
        <Typography>Loading profile...</Typography>
      </Paper>
    );
  }

  const skillsGrouped = groupSkillsByCategory(user.skills || []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 5, 
          borderRadius: 2,
          bgcolor: '#fafafa',
          position: 'relative'
        }}
      >
        {/* Logo and Action Buttons */}
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <Logo size={40} />
        </Box>
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => setPasswordResetDialogOpen(true)}
            sx={{ 
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            title="Reset Password"
          >
            <VpnKeyIcon sx={{ color: '#ff9800' }} />
          </IconButton>
          <IconButton 
            onClick={() => setEditDialogOpen(true)}
            sx={{ 
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            title="Edit Profile"
          >
            <EditIcon sx={{ color: '#1976d2' }} />
          </IconButton>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Grid container spacing={4}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              bgcolor: 'white', 
              p: 3, 
              borderRadius: 2, 
              border: '1px solid #e0e0e0',
              height: 'fit-content'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#333',
                borderBottom: '1px solid #eee',
                pb: 1
              }}>
                Personal Information
              </Typography>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography><strong>Name:</strong> {user.firstName} {user.lastName}</Typography>
                <Typography><strong>Email:</strong> {user.email}</Typography>
                {user.phone && <Typography><strong>Phone:</strong> {user.phone}</Typography>}
              </Box>
            </Box>
          </Grid>

          {/* Education */}
          <Grid item xs={12} md={6}>
            {(user.education || user.university) && (
              <Box sx={{ 
                bgcolor: 'white', 
                p: 3, 
                borderRadius: 2, 
                border: '1px solid #e0e0e0',
                height: 'fit-content'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#333',
                  borderBottom: '1px solid #eee',
                  pb: 1
                }}>
                  Education
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography><strong>University:</strong> {user.education?.university || user.university}</Typography>
                  {user.education?.degree && <Typography><strong>Degree:</strong> {user.education.degree}</Typography>}
                  <Typography><strong>Major:</strong> {user.education?.major || user.major}</Typography>
                  {user.education?.graduationYear && <Typography><strong>Graduation:</strong> {user.education.graduationYear}</Typography>}
                  {user.education?.gpa && <Typography><strong>GPA:</strong> {user.education.gpa}</Typography>}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>


        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <Box sx={{ 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            mt: 4
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#333',
              borderBottom: '1px solid #eee',
              pb: 1
            }}>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {user.skills.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  size="small"
                  sx={{ 
                    bgcolor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    '&:hover': { bgcolor: '#e0e0e0' }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Experience */}
        {user.experience && user.experience.length > 0 && (
          <Box sx={{ 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            mt: 4
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#333',
              borderBottom: '1px solid #eee',
              pb: 1
            }}>
              Experience
            </Typography>
            <Box sx={{ '& > *': { mb: 3 } }}>
              {user.experience.map((exp, index) => (
                <Box key={index}>
                  <Typography sx={{ fontWeight: 600, color: '#333' }}>
                    {exp.position} at {exp.company}
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                    {exp.startDate} - {exp.endDate}
                  </Typography>
                  {exp.description && (
                    <Typography sx={{ mt: 0.5, color: '#555', fontSize: '0.95rem' }}>
                      {exp.description.length > 150 ? `${exp.description.substring(0, 150)}...` : exp.description}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Projects */}
        {user.projects && user.projects.length > 0 && (
          <Box sx={{ 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            mt: 4
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#333',
              borderBottom: '1px solid #eee',
              pb: 1
            }}>
              Projects
            </Typography>
            <Box sx={{ '& > *': { mb: 2 } }}>
              {user.projects.map((project, index) => (
                <Box key={index}>
                  <Typography sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                    {project.name}
                  </Typography>
                  {project.description && (
                    <Typography sx={{ color: '#555', fontSize: '0.9rem', mb: 1 }}>
                      {project.description.length > 100 ? `${project.description.substring(0, 100)}...` : project.description}
                    </Typography>
                  )}
                  {project.technologies && (
                    <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
                      <strong>Technologies:</strong> {project.technologies.join(', ')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Certifications */}
        {user.certifications && user.certifications.length > 0 && (
          <Box sx={{ 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            mt: 4
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#333',
              borderBottom: '1px solid #eee',
              pb: 1
            }}>
              Certifications
            </Typography>
            <Box sx={{ '& > *': { mb: 1.5 } }}>
              {user.certifications.map((cert, index) => (
                <Box key={index}>
                  <Typography sx={{ fontWeight: 600, color: '#333' }}>
                    {cert.name}
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                    Issued by: {cert.issuer}
                    {cert.date && ` • ${cert.date}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Languages */}
        {user.languages && user.languages.length > 0 && (
          <Box sx={{ 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            mt: 4
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#333',
              borderBottom: '1px solid #eee',
              pb: 1
            }}>
              Languages
            </Typography>
            <Box sx={{ '& > *': { mb: 1 } }}>
              {user.languages.map((lang, index) => (
                <Typography key={index}>
                  <strong>{lang.language}:</strong> {lang.proficiency}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editData.firstName}
                onChange={(e) => setEditData({...editData, firstName: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editData.lastName}
                onChange={(e) => setEditData({...editData, lastName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Education</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="University"
                value={editData.education.university}
                onChange={(e) => setEditData({
                  ...editData, 
                  education: {...editData.education, university: e.target.value}
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
                  education: {...editData.education, degree: e.target.value}
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
                  education: {...editData.education, major: e.target.value}
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetDialogOpen} onClose={() => setPasswordResetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={passwordResetEmail}
            onChange={(e) => setPasswordResetEmail(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordResetDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordReset} 
            variant="contained"
            disabled={passwordResetLoading || !passwordResetEmail}
          >
            {passwordResetLoading ? <CircularProgress size={20} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
      </Paper>
    </Container>
  );
};

export default Profile;
