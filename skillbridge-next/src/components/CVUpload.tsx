'use client';
/* eslint-disable */
// @ts-nocheck

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Delete,
  Download,
  AutoAwesome,
  CheckCircle,
  Error
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';


const CVUpload = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [showParsedData, setShowParsedData] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await axios.post(`${config.API_URL}/api/cv/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        setSuccess('CV uploaded and parsed successfully!');
        setParsedData(response.data.parsedData);
        setShowParsedData(true);

        // Update user profile in auth context
        if (response.data.user) {
          updateUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('CV upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload CV');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteCV = async () => {
    try {
      const response = await axios.delete(`${config.API_URL}/api/cv/delete`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess('CV deleted successfully');
        updateUser({ ...user, resumeUrl: null });
      }
    } catch (error) {
      console.error('CV delete error:', error);
      setError(error.response?.data?.message || 'Failed to delete CV');
    }
  };

  const handleDownloadCV = () => {
    if (user?.resumeUrl) {
      window.open(`${config.API_URL}/api/cv/download/${user.resumeUrl}`, '_blank');
    }
  };

  const renderParsedDataDialog = () => (
    <Dialog
      open={showParsedData}
      onClose={() => setShowParsedData(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesome color="primary" />
          AI Extracted Information
        </Box>
      </DialogTitle>
      <DialogContent>
        {parsedData && (
          <Grid container spacing={2}>
            {parsedData.personalInfo && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {parsedData.personalInfo.firstName} {parsedData.personalInfo.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {parsedData.personalInfo.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {parsedData.personalInfo.phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {parsedData.education && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Education</Typography>
                    <Typography variant="body2">
                      <strong>University:</strong> {parsedData.education.university}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Degree:</strong> {parsedData.education.degree}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Major:</strong> {parsedData.education.major}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Graduation:</strong> {parsedData.education.graduationYear}
                    </Typography>
                    {parsedData.education.gpa && (
                      <Typography variant="body2">
                        <strong>GPA:</strong> {parsedData.education.gpa}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {parsedData.skills && parsedData.skills.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Skills</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {parsedData.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {parsedData.experience && parsedData.experience.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Experience</Typography>
                    {parsedData.experience.map((exp, index) => (
                      <Box key={index} mb={2}>
                        <Typography variant="subtitle2">
                          {exp.position} at {exp.company}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exp.startDate} - {exp.endDate}
                        </Typography>
                        <Typography variant="body2">
                          {exp.description}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {parsedData.projects && parsedData.projects.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Projects</Typography>
                    {parsedData.projects.map((project, index) => (
                      <Box key={index} mb={2}>
                        <Typography variant="subtitle2">{project.name}</Typography>
                        <Typography variant="body2">{project.description}</Typography>
                        {project.technologies && (
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                            {project.technologies.map((tech, techIndex) => (
                              <Chip key={techIndex} label={tech} size="small" variant="outlined" />
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {parsedData.certifications && parsedData.certifications.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Certifications</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {parsedData.certifications.map((cert, index) => (
                        <Chip
                          key={index}
                          label={typeof cert === 'string' ? cert : cert.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {parsedData.languages && parsedData.languages.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Languages</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {parsedData.languages.map((lang, index) => (
                        <Chip
                          key={index}
                          label={lang}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowParsedData(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Description />
        CV/Resume Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {user?.resumeUrl ? (
        <Box>
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            icon={<CheckCircle />}
            action={
              <Box>
                <IconButton
                  size="small"
                  onClick={handleDownloadCV}
                  sx={{ mr: 1 }}
                >
                  <Download />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDeleteCV}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            }
          >
            CV uploaded successfully! Your profile has been enhanced with AI-extracted information.
          </Alert>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload your CV/Resume and let our AI extract and populate your profile information automatically.
            Supported formats: PDF, DOC, DOCX (Max 5MB)
          </Typography>

          <input
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="cv-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="cv-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              disabled={uploading}
              sx={{ mb: 2 }}
            >
              {uploading ? 'Processing...' : 'Upload CV/Resume'}
            </Button>
          </label>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {uploadProgress < 100 ? 'Uploading...' : 'Processing with AI...'}
              </Typography>
              <LinearProgress
                variant={uploadProgress < 100 ? "determinate" : "indeterminate"}
                value={uploadProgress}
              />
            </Box>
          )}
        </Box>
      )}

      {renderParsedDataDialog()}
    </Paper>
  );
};

export default CVUpload;
