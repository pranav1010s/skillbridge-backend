import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme
} from '@mui/material';
import {
  Business,
  LocationOn,
  Email,
  Phone,
  Language,
  People,
  Work,
  ArrowBack,
  Send
} from '@mui/icons-material';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailDialog, setEmailDialog] = useState({ open: false, draft: null });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/businesses/${id}`);
        if (response.data.success) {
          setBusiness(response.data.business);
        }
      } catch (error) {
        setError('Failed to load business details');
        console.error('Error fetching business:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  const handleGenerateEmail = async () => {
    setGenerating(true);
    try {
      // This would typically call a match-specific endpoint
      // For now, we'll generate a basic email template
      const emailDraft = {
        to: business.contactInfo.email,
        subject: `Internship Opportunity Inquiry - ${business.name}`,
        body: `Dear ${business.name} Team,

I hope this email finds you well. I am a student interested in exploring internship opportunities with your company.

I am particularly drawn to ${business.name} because of your work in ${business.industry} and your focus on ${business.description}.

My skills in ${business.relevantSkills.slice(0, 3).join(', ')} align well with your typical roles such as ${business.typicalRoles.slice(0, 2).join(' and ')}.

I would love to discuss how I can contribute to your team while gaining valuable experience in the industry.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
[Your Name]
[Your Contact Information]`
      };

      setEmailDialog({ open: true, draft: emailDraft });
    } catch (error) {
      setError('Failed to generate email draft');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    const emailContent = `Subject: ${emailDialog.draft.subject}\n\n${emailDialog.draft.body}`;
    navigator.clipboard.writeText(emailContent);
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(emailDialog.draft.subject);
    const body = encodeURIComponent(emailDialog.draft.body);
    const mailtoLink = `mailto:${emailDialog.draft.to}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
    setEmailDialog({ open: false, draft: null });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !business) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Business not found'}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, py: 4 }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Business sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {business.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {business.industry}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {business.description}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={generating ? <CircularProgress size={20} /> : <Send />}
              onClick={handleGenerateEmail}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Email Draft'}
            </Button>
          </Box>

          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1 }} />
                    Contact Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography>{business.contactInfo.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography>{business.contactInfo.phone}</Typography>
                    </Box>
                    {business.contactInfo.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Language sx={{ mr: 2, color: 'text.secondary' }} />
                        <Typography 
                          component="a" 
                          href={business.contactInfo.website}
                          target="_blank"
                          sx={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                        >
                          {business.contactInfo.website}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1 }} />
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {business.address.street}
                  </Typography>
                  <Typography variant="body1">
                    {business.address.city}, {business.address.postcode}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <People sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Company Size: {business.companySize} employees
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Skills & Requirements */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Relevant Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {business.relevantSkills.map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <Work sx={{ mr: 1 }} />
                    Typical Roles
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {business.typicalRoles.map((role, index) => (
                      <Chip 
                        key={index} 
                        label={role} 
                        variant="filled"
                        color="secondary"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Email Draft Dialog */}
        <Dialog 
          open={emailDialog.open} 
          onClose={() => setEmailDialog({ open: false, draft: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Email Draft Generated</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="To"
              value={emailDialog.draft?.to || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Subject"
              value={emailDialog.draft?.subject || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={12}
              value={emailDialog.draft?.body || ''}
              disabled
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailDialog({ open: false, draft: null })}>
              Close
            </Button>
            <Button onClick={handleCopyEmail} variant="outlined">
              Copy to Clipboard
            </Button>
            <Button onClick={handleOpenEmail} variant="contained">
              Open in Email Client
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BusinessDetail;
