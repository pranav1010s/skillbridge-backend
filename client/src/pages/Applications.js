import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Send,
  CheckCircle,
  Schedule,
  Cancel,
  Business,
  Email
} from '@mui/icons-material';

const Applications = () => {
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/matches');
        if (response.data.success) {
          // Filter matches where email was sent (these are applications)
          const sentApplications = response.data.matches.filter(match => match.emailSent);
          setApplications(sentApplications);
        }
      } catch (error) {
        setError('Failed to load applications');
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'primary';
      case 'viewed': return 'info';
      case 'responded': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Send />;
      case 'viewed': return <Schedule />;
      case 'responded': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      default: return <Email />;
    }
  };

  const filterApplications = (status) => {
    if (status === 'all') return applications;
    return applications.filter(app => app.status === status);
  };

  const getFilteredApplications = () => {
    switch (tabValue) {
      case 0: return filterApplications('all');
      case 1: return filterApplications('sent');
      case 2: return filterApplications('viewed');
      case 3: return filterApplications('responded');
      default: return applications;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
          My Applications
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper elevation={3} sx={{ borderRadius: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}
          >
            <Tab label={`All (${applications.length})`} />
            <Tab label={`Sent (${filterApplications('sent').length})`} />
            <Tab label={`Viewed (${filterApplications('viewed').length})`} />
            <Tab label={`Responded (${filterApplications('responded').length})`} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {getFilteredApplications().length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No applications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start applying to businesses from your dashboard to see them here.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {getFilteredApplications().map((application) => (
                  <Grid item xs={12} key={application._id}>
                    <Card sx={{ border: 1, borderColor: 'divider' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {application.business.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {application.business.industry} • {application.business.address.city}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              {application.business.description}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Chip
                              icon={getStatusIcon(application.status || 'sent')}
                              label={application.status || 'sent'}
                              color={getStatusColor(application.status || 'sent')}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              Applied: {new Date(application.emailSentAt || application.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {application.business.relevantSkills.slice(0, 5).map((skill, index) => (
                            <Chip key={index} label={skill} size="small" variant="outlined" />
                          ))}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Match Score: {Math.round(application.relevanceScore)}%
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              href={`mailto:${application.business.contactInfo.email}`}
                            >
                              Follow Up
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => window.open(`/business/${application.business._id}`, '_blank')}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Applications;
