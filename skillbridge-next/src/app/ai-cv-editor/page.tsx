'use client';
/* eslint-disable */
// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
  Avatar,
  Divider,
  Chip,
  Grid,
  useTheme
} from '@mui/material';
import {
  Upload,
  CloudUpload,
  Send,
  Download,
  SmartToy,
  Person,
  RestartAlt,
  Description,
  School,
  Work,
  Code,
  EmojiEvents,
  Language as LanguageIcon,
  Email,
  Phone,
  LocationOn,
  Star,
  Edit,
  Save
} from '@mui/icons-material';
import Logo from '@/components/Logo';
import config from '@/config';

const AICVEditorNew = () => {
  const theme = useTheme();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [hasUploadedCV, setHasUploadedCV] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCvData(response.data.user);
        if (response.data.user.resumeUrl) {
          setHasUploadedCV(true);
          addMessage('assistant', 'I can see you already have a CV uploaded. Would you like me to review it or help you make improvements?');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load CV data');
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUploadCV = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    addMessage('user', `Uploading ${selectedFile.name}...`);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('cv', selectedFile);

      const response = await axios.post(`${config.API_URL}/api/cv/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setCvData(response.data.user);
        setSelectedFile(null);
        setHasUploadedCV(true);
        addMessage('assistant', '✅ CV uploaded successfully! Let me analyze it for you...');

        // Automatically analyze the CV
        setTimeout(() => analyzeCV(response.data.user), 1000);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      const errorMsg = error.response?.data?.message || 'Failed to upload CV';
      setError(errorMsg);
      addMessage('assistant', `❌ ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const analyzeCV = async (userData) => {
    setIsChatProcessing(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        addMessage('assistant', '⚠️ Authentication error. Please log in again.');
        setIsChatProcessing(false);
        return;
      }

      console.log('Analyzing CV for user:', userData.firstName, userData.lastName);

      const response = await axios.post(`${config.API_URL}/api/cv/analyze`, {
        cvData: userData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Analysis response:', response.data);

      if (response.data.success) {
        addMessage('assistant', response.data.analysis);
      } else {
        addMessage('assistant', '⚠️ ' + (response.data.message || 'Failed to analyze CV'));
      }
    } catch (error) {
      console.error('Error analyzing CV:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      addMessage('assistant', `⚠️ I encountered an issue while analyzing your CV: ${errorMsg}. But I can still help you improve it! What would you like to change?`);
    } finally {
      setIsChatProcessing(false);
    }
  };

  const handleSendMessage = async (retryCount = 0) => {
    if (!userInput.trim() || isChatProcessing) return;

    const message = userInput.trim();

    // Prevent spamming the same message
    if (messages.length > 0 && messages[messages.length - 1].role === 'user' && messages[messages.length - 1].content === message) {
      // Just ignore duplicate sends without error
      setUserInput('');
      return;
    }

    setUserInput('');
    addMessage('user', message);
    setIsChatProcessing(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        addMessage('assistant', '⚠️ Authentication error. Please log in again.');
        setIsChatProcessing(false);
        return;
      }

      console.log('Sending chat message:', message);
      console.log('Conversation history length:', messages.length);

      // Only send the last 6 messages (3 exchanges) for context to avoid token limits
      const recentHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post(`${config.API_URL}/api/cv/chat`, {
        message,
        cvData,
        conversationHistory: recentHistory
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('Chat response received:', response.data.success);

      if (response.data.success) {
        addMessage('assistant', response.data.reply);

        // If CV data was updated, refresh it
        if (response.data.updatedCvData) {
          setCvData(response.data.updatedCvData);
          addMessage('assistant', '✅ CV updated! Check the preview on the left.');
        }
      } else {
        addMessage('assistant', '⚠️ ' + (response.data.message || 'Something went wrong.'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);

      const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';

      // Handle rate limiting with retry
      const lowerErrorMsg = errorMsg.toLowerCase();
      if ((lowerErrorMsg.includes('429') || lowerErrorMsg.includes('rate limit')) && retryCount < 2) {
        const waitTime = (retryCount + 1) * 2000; // 2s, 4s
        addMessage('assistant', `⏳ Rate limit hit. Retrying in ${waitTime / 1000} seconds...`);
        setTimeout(() => {
          // Remove the retry message
          setMessages(prev => prev.slice(0, -1));
          handleSendMessage(retryCount + 1);
        }, waitTime);
        return;
      }

      addMessage('assistant', `⚠️ Error: ${errorMsg}`);
    } finally {
      setIsChatProcessing(false);
    }
  };

  const handleManualUpdate = async (updatedData) => {
    // Optimistically update local state
    setCvData(updatedData);

    try {
      const token = localStorage.getItem('token');
      // We can reuse the existing profile update endpoint or create a specific one
      // For now, let's assume we can update the profile directly
      await axios.put(`${config.API_URL}/api/users/profile`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error saving manual updates:', error);
      // Revert on error if needed, or show notification
    }
  };

  const handleReset = () => {
    setMessages([]);
    addMessage('assistant', 'Chat cleared! How can I help you with your CV today?');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Premium Glass Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          zIndex: 1200
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', mx: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Logo size={40} />
            <Box>
              <Typography
                variant="h5"
                className="text-gradient"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Description sx={{ color: '#6366f1' }} />
                AI CV Editor
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Interactive AI-powered resume enhancement
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              disabled={uploading}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#cbd5e1',
                color: '#475569',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: 'white'
                }
              }}
            >
              Upload New CV
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
            </Button>
            {selectedFile && (
              <Button
                variant="contained"
                onClick={handleUploadCV}
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'var(--primary-gradient)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                  }
                }}
              >
                {uploading ? 'Uploading...' : 'Parse CV'}
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => window.open(`${config.API_URL}/api/cv/download/${cvData?.resumeUrl}`, '_blank')}
              disabled={!cvData?.resumeUrl}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#cbd5e1',
                color: '#475569',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: 'white'
                }
              }}
            >
              Download
            </Button>
          </Box>
        </Box>
        {selectedFile && (
          <Alert severity="info" sx={{ mt: 2, maxWidth: '1600px', mx: 'auto', borderRadius: '10px' }}>
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </Alert>
        )}
        {uploading && <LinearProgress sx={{ mt: 1, borderRadius: 1, height: 6 }} />}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ m: 2, borderRadius: '10px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ m: 2, borderRadius: '10px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Split Screen Layout */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        p: 3,
        gap: 3,
        maxWidth: '1600px',
        mx: 'auto',
        width: '100%'
      }}>
        {/* Left Side - CV Preview */}
        <Box
          className="glass-panel fade-in-up"
          sx={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'rgba(255, 255, 255, 0.6)'
          }}
        >
          <Box sx={{
            p: 2,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.4)'
          }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
              LIVE PREVIEW
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                startIcon={isEditMode ? <Save /> : <Edit />}
                size="small"
                variant={isEditMode ? "contained" : "outlined"}
                color={isEditMode ? "success" : "primary"}
                onClick={() => setIsEditMode(!isEditMode)}
                sx={{ height: 28 }}
              >
                {isEditMode ? 'Done' : 'Edit'}
              </Button>
              <Chip label="Auto-saving" size="small" color="success" variant="outlined" sx={{ height: 24 }} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
            {cvData ? (
              <CVPreview
                cvData={cvData}
                isEditMode={isEditMode}
                onUpdate={handleManualUpdate}
              />
            ) : (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}>
                <Box sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}>
                  <Description sx={{ fontSize: 60, color: '#cbd5e1' }} />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  No CV Uploaded Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload a CV to see the live preview here
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Side - AI Chatbot */}
        <Box
          className="glass-panel fade-in-up"
          style={{ animationDelay: '0.1s' }}
          sx={{
            width: 450,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <Box sx={{
            p: 2.5,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.5)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                }}>
                  <SmartToy />
                </Avatar>
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  bgcolor: '#22c55e',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  AI Assistant
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {isChatProcessing ? 'Thinking...' : 'Online & Ready'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={handleReset}
              title="Clear chat"
              sx={{
                bgcolor: 'rgba(0,0,0,0.03)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
              }}
            >
              <RestartAlt fontSize="small" />
            </IconButton>
          </Box>

          {/* Chat Messages */}
          <Box sx={{
            flex: 1,
            overflow: 'auto',
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            bgcolor: 'rgba(248, 250, 252, 0.5)'
          }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8, px: 2 }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <SmartToy sx={{ fontSize: 40, color: '#6366f1' }} />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  How can I help?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  I can analyze your CV, suggest improvements, rewrite sections, or fix formatting issues.
                </Typography>
                <Chip
                  label="Upload a CV to start"
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    fontWeight: 600
                  }}
                />
              </Box>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))
            )}
            {isChatProcessing && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: 1 }}>
                <CircularProgress size={16} thickness={5} sx={{ color: '#6366f1' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  AI is typing...
                </Typography>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>

          {/* Chat Input */}
          <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <Box sx={{
              display: 'flex',
              gap: 1,
              bgcolor: '#f8fafc',
              p: 1,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
              '&:focus-within': {
                borderColor: '#6366f1',
                boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
              }
            }}>
              <TextField
                fullWidth
                placeholder="Type your request..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isChatProcessing || !hasUploadedCV}
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{ px: 1 }}
                multiline
                maxRows={3}
              />
              <IconButton
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isChatProcessing || !hasUploadedCV}
                sx={{
                  bgcolor: userInput.trim() ? '#6366f1' : 'transparent',
                  color: userInput.trim() ? 'white' : 'text.disabled',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: userInput.trim() ? '#4f46e5' : 'transparent',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Send fontSize="small" />
              </IconButton>
            </Box>
            {!hasUploadedCV && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center' }}>
                <Upload sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                Please upload a CV to start the conversation
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Chat Message Component
const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <Box sx={{
      display: 'flex',
      gap: 2,
      alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      maxWidth: '100%'
    }} className="fade-in-up">
      <Avatar sx={{
        background: isUser ? '#475569' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        width: 36,
        height: 36,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {isUser ? <Person sx={{ fontSize: 20 }} /> : <SmartToy sx={{ fontSize: 20 }} />}
      </Avatar>
      <Paper sx={{
        p: 2,
        maxWidth: '80%',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        background: isUser
          ? 'white'
          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: isUser ? 'text.primary' : 'white',
        boxShadow: isUser
          ? '0 2px 8px rgba(0,0,0,0.05)'
          : '0 4px 12px rgba(99, 102, 241, 0.3)',
        border: isUser ? '1px solid #e2e8f0' : 'none'
      }}>
        <Typography variant="body2" sx={{
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
          fontSize: '0.95rem'
        }}>
          {message.content}
        </Typography>
        <Typography variant="caption" sx={{
          display: 'block',
          mt: 1,
          opacity: 0.7,
          fontSize: '0.7rem',
          textAlign: isUser ? 'right' : 'left'
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Paper>
    </Box>
  );
};

// CV Preview Component with Full Editing Support
const CVPreview = ({ cvData, isEditMode, onUpdate }) => {
  // Local state for editing
  const [editData, setEditData] = React.useState(cvData);

  // Update local state when cvData prop changes
  React.useEffect(() => {
    setEditData(cvData);
  }, [cvData]);

  // Handle saving changes
  const handleSave = () => {
    onUpdate(editData);
  };

  // Update handlers for different field types
  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (!isEditMode) {
      onUpdate({ ...editData, [field]: value });
    }
  };

  const updateArrayItem = (arrayName, index, field, value) => {
    const newArray = [...(editData[arrayName] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    setEditData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const addArrayItem = (arrayName, template) => {
    const newArray = [...(editData[arrayName] || []), template];
    setEditData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = [...(editData[arrayName] || [])];
    newArray.splice(index, 1);
    setEditData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  // Save changes when exiting edit mode
  React.useEffect(() => {
    if (!isEditMode && JSON.stringify(editData) !== JSON.stringify(cvData)) {
      handleSave();
    }
  }, [isEditMode]);

  const EditableText = ({ value, onChange, placeholder, variant = "body2", multiline = false }) => (
    isEditMode ? (
      <TextField
        fullWidth
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant="standard"
        multiline={multiline}
        rows={multiline ? 3 : 1}
        sx={{ '& .MuiInput-root': { fontSize: variant === 'h4' ? '2.125rem' : variant === 'h6' ? '1.25rem' : '0.875rem' } }}
      />
    ) : (
      <Typography variant={variant as any} sx={{ whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
        {value || placeholder}
      </Typography>
    )
  );

  return (
    <Paper elevation={3} sx={{
      maxWidth: 800,
      mx: 'auto',
      p: 4,
      bgcolor: 'white',
      minHeight: '100%'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center', borderBottom: 2, borderColor: 'primary.main', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
          {isEditMode ? (
            <>
              <TextField
                value={editData.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="First Name"
                variant="standard"
                sx={{ '& .MuiInput-root': { fontSize: '2.125rem', fontWeight: 700 } }}
              />
              <TextField
                value={editData.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Last Name"
                variant="standard"
                sx={{ '& .MuiInput-root': { fontSize: '2.125rem', fontWeight: 700 } }}
              />
            </>
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {editData.firstName} {editData.lastName}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {editData.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Email sx={{ fontSize: 16 }} />
              <Typography variant="body2">{editData.email}</Typography>
            </Box>
          )}
          {editData.locationPreference?.postcode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16 }} />
              <Typography variant="body2">{editData.locationPreference.postcode}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Professional Summary */}
      {(editData.summary || isEditMode) && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
            Professional Summary
          </Typography>
          {isEditMode ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editData.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)}
              placeholder="Add a professional summary..."
              variant="outlined"
              sx={{ bgcolor: 'white' }}
            />
          ) : (
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
              {editData.summary}
            </Typography>
          )}
        </Box>
      )}

      {/* Education */}
      {(editData.university || isEditMode) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <School color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Education</Typography>
          </Box>
          <Box sx={{ pl: 4 }}>
            {isEditMode ? (
              <>
                <TextField
                  fullWidth
                  value={editData.university || ''}
                  onChange={(e) => updateField('university', e.target.value)}
                  placeholder="University"
                  variant="standard"
                  sx={{ mb: 1, '& .MuiInput-root': { fontSize: '1rem', fontWeight: 600 } }}
                />
                <TextField
                  fullWidth
                  value={editData.major || ''}
                  onChange={(e) => updateField('major', e.target.value)}
                  placeholder="Major/Field of Study"
                  variant="standard"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  value={editData.year || ''}
                  onChange={(e) => updateField('year', e.target.value)}
                  placeholder="Year"
                  variant="standard"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  value={editData.gpa || ''}
                  onChange={(e) => updateField('gpa', parseFloat(e.target.value))}
                  placeholder="GPA"
                  variant="standard"
                  inputProps={{ step: 0.01, min: 0, max: 4 }}
                />
              </>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {editData.university}
                </Typography>
                {editData.major && (
                  <Typography variant="body2" color="text.secondary">
                    {editData.major} {editData.year && `• ${editData.year}`}
                  </Typography>
                )}
                {editData.gpa && (
                  <Typography variant="body2" color="text.secondary">
                    GPA: {editData.gpa}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Skills */}
      {((editData.skills && editData.skills.length > 0) || isEditMode) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Code color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Skills</Typography>
          </Box>
          <Box sx={{ pl: 4 }}>
            {isEditMode ? (
              <TextField
                fullWidth
                multiline
                rows={2}
                value={(editData.skills || []).join(', ')}
                onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="Add skills separated by commas"
                variant="outlined"
                helperText="Separate skills with commas"
              />
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(editData.skills || []).map((skill, index) => (
                  <Chip key={index} label={skill} size="small" variant="outlined" />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Experience */}
      {((editData.experience && editData.experience.length > 0) || isEditMode) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Work color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Experience</Typography>
            </Box>
            {isEditMode && (
              <Button
                size="small"
                onClick={() => addArrayItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '', location: '' })}
              >
                + Add
              </Button>
            )}
          </Box>
          <Box sx={{ pl: 4 }}>
            {(editData.experience || []).map((exp, index) => (
              <Box key={index} sx={{ mb: 2, position: 'relative' }}>
                {isEditMode ? (
                  <>
                    <TextField
                      fullWidth
                      value={exp.position || ''}
                      onChange={(e) => updateArrayItem('experience', index, 'position', e.target.value)}
                      placeholder="Position/Role"
                      variant="standard"
                      sx={{ mb: 0.5, '& .MuiInput-root': { fontWeight: 600 } }}
                    />
                    <TextField
                      fullWidth
                      value={exp.company || ''}
                      onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)}
                      placeholder="Company"
                      variant="standard"
                      sx={{ mb: 0.5 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <TextField
                        value={exp.startDate || ''}
                        onChange={(e) => updateArrayItem('experience', index, 'startDate', e.target.value)}
                        placeholder="Start Date"
                        variant="standard"
                        size="small"
                      />
                      <TextField
                        value={exp.endDate || ''}
                        onChange={(e) => updateArrayItem('experience', index, 'endDate', e.target.value)}
                        placeholder="End Date"
                        variant="standard"
                        size="small"
                      />
                      <TextField
                        value={exp.location || ''}
                        onChange={(e) => updateArrayItem('experience', index, 'location', e.target.value)}
                        placeholder="Location"
                        variant="standard"
                        size="small"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => updateArrayItem('experience', index, 'description', e.target.value)}
                      placeholder="Description"
                      variant="outlined"
                      size="small"
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeArrayItem('experience', index)}
                      sx={{ mt: 0.5 }}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {exp.position}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {exp.company}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {exp.startDate} - {exp.endDate || 'Present'}
                      {exp.location && ` • ${exp.location}`}
                    </Typography>
                    {exp.description && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {exp.description}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Projects */}
      {((editData.projects && editData.projects.length > 0) || isEditMode) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Projects</Typography>
            </Box>
            {isEditMode && (
              <Button
                size="small"
                onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [], url: '' })}
              >
                + Add
              </Button>
            )}
          </Box>
          <Box sx={{ pl: 4 }}>
            {(editData.projects || []).map((project, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {isEditMode ? (
                  <>
                    <TextField
                      fullWidth
                      value={project.name || ''}
                      onChange={(e) => updateArrayItem('projects', index, 'name', e.target.value)}
                      placeholder="Project Name"
                      variant="standard"
                      sx={{ mb: 0.5, '& .MuiInput-root': { fontWeight: 600 } }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={project.description || ''}
                      onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)}
                      placeholder="Description"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <TextField
                      fullWidth
                      value={(project.technologies || []).join(', ')}
                      onChange={(e) => updateArrayItem('projects', index, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      placeholder="Technologies (comma-separated)"
                      variant="standard"
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeArrayItem('projects', index)}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {project.name}
                    </Typography>
                    {project.description && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {project.description}
                      </Typography>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {project.technologies.map((tech, techIndex) => (
                          <Chip key={techIndex} label={tech} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Certifications */}
      {((editData.certifications && editData.certifications.length > 0) || isEditMode) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Certifications</Typography>
            </Box>
            {isEditMode && (
              <Button
                size="small"
                onClick={() => addArrayItem('certifications', { name: '', issuer: '', dateObtained: '' })}
              >
                + Add
              </Button>
            )}
          </Box>
          <Box sx={{ pl: 4 }}>
            {(editData.certifications || []).map((cert, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                {isEditMode ? (
                  <>
                    <TextField
                      fullWidth
                      value={cert.name || ''}
                      onChange={(e) => updateArrayItem('certifications', index, 'name', e.target.value)}
                      placeholder="Certification Name"
                      variant="standard"
                      sx={{ mb: 0.5 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        value={cert.issuer || ''}
                        onChange={(e) => updateArrayItem('certifications', index, 'issuer', e.target.value)}
                        placeholder="Issuer"
                        variant="standard"
                        size="small"
                      />
                      <TextField
                        value={cert.dateObtained || ''}
                        onChange={(e) => updateArrayItem('certifications', index, 'dateObtained', e.target.value)}
                        placeholder="Date"
                        variant="standard"
                        size="small"
                      />
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeArrayItem('certifications', index)}
                      sx={{ mt: 0.5 }}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cert.name}
                    </Typography>
                    {cert.issuer && (
                      <Typography variant="caption" color="text.secondary">
                        {cert.issuer}
                        {cert.dateObtained && ` • ${cert.dateObtained}`}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Languages */}
      {((editData.languages && editData.languages.length > 0) || isEditMode) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LanguageIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Languages</Typography>
            </Box>
            {isEditMode && (
              <Button
                size="small"
                onClick={() => addArrayItem('languages', { language: '', proficiency: 'Conversational' })}
              >
                + Add
              </Button>
            )}
          </Box>
          <Box sx={{ pl: 4 }}>
            {(editData.languages || []).map((lang, index) => (
              <Box key={index} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditMode ? (
                  <>
                    <TextField
                      value={lang.language || ''}
                      onChange={(e) => updateArrayItem('languages', index, 'language', e.target.value)}
                      placeholder="Language"
                      variant="standard"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={lang.proficiency || 'Conversational'}
                      onChange={(e) => updateArrayItem('languages', index, 'proficiency', e.target.value)}
                      placeholder="Proficiency"
                      variant="standard"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeArrayItem('languages', index)}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2">
                    {lang.language} - {lang.proficiency || 'Conversational'}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Custom Sections */}
      {editData.customSections && editData.customSections.length > 0 && (
        <>
          {editData.customSections
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((section, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Star color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{section.title}</Typography>
                </Box>
                <Box sx={{ pl: 4 }}>
                  {section.type === 'list' && section.items && section.items.length > 0 ? (
                    section.items.map((item, itemIndex) => (
                      <Typography key={itemIndex} variant="body2" sx={{ mb: 0.5 }}>
                        • {item}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {section.content}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
        </>
      )}
    </Paper>
  );
};

export default AICVEditorNew;

