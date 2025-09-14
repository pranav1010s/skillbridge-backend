import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  School,
  Business,
  Email,
  LocationOn,
  TrendingUp,
  ConnectWithoutContact
} from '@mui/icons-material';
import Logo from '../components/Logo';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <LocationOn sx={{ fontSize: 32, color: '#6366f1' }} />,
      title: 'Hyper-Local Focus',
      description: 'Find opportunities within walking distance of your campus, not just corporate giants.'
    },
    {
      icon: <ConnectWithoutContact sx={{ fontSize: 32, color: '#6366f1' }} />,
      title: 'Smart Matching',
      description: 'Our algorithm matches your skills and interests with local businesses that need them.'
    },
    {
      icon: <Email sx={{ fontSize: 32, color: '#6366f1' }} />,
      title: 'Email Draft Generator',
      description: 'Never struggle with cold emails again. We generate personalized drafts for you.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32, color: '#6366f1' }} />,
      title: 'Career Building',
      description: 'Build real-world experience and professional networks in your local community.'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#fafbfc', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2.5,
              position: 'relative'
            }}
          >
            {/* Logo and Brand - Left Side */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Logo size={44} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    letterSpacing: '-0.025em',
                    fontSize: '1.35rem'
                  }}
                >
                  SkillBridge
                </Typography>
              </Stack>
            </Box>

            {/* Center Navigation (Optional - for future nav items) */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              {/* Future navigation items can go here */}
            </Box>

            {/* Right Side Navigation */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#64748b',
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      color: '#475569'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: '#6366f1',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 4,
                    py: 1.25,
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    boxShadow: '0 2px 4px 0 rgba(99, 102, 241, 0.2)',
                    '&:hover': {
                      bgcolor: '#5856eb',
                      boxShadow: '0 4px 8px 0 rgba(99, 102, 241, 0.3)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Get Started
                </Button>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.1,
              mb: 3,
              letterSpacing: '-0.025em'
            }}
          >
            Bridge the Gap Between{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block'
              }}
            >
              Students & Local Businesses
            </Box>
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: '#64748b',
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Discover internships, part-time jobs, and project opportunities 
            with small-to-medium businesses right in your neighborhood.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#6366f1',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  bgcolor: '#5856eb',
                  boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Start Your Journey
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                color: '#64748b',
                borderColor: '#e2e8f0',
                fontWeight: 600,
                textTransform: 'none',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#f8fafc',
                  borderColor: '#cbd5e1',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'white', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#0f172a',
                mb: 3,
                letterSpacing: '-0.025em'
              }}
            >
              Why Choose SkillBridge?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Connect with local opportunities that match your skills and build meaningful professional relationships
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={index} sx={{ display: 'flex' }}>
                <Card
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: 280,
                    mx: 'auto',
                    p: 4,
                    bgcolor: '#fafbfc',
                    border: '1px solid #f1f5f9',
                    borderRadius: 3,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      bgcolor: 'white',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                        mb: 2,
                        minHeight: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.6,
                        flex: 1
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: '#fafbfc', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#0f172a',
                mb: 3,
                letterSpacing: '-0.025em'
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Get started in three simple steps and unlock local opportunities
            </Typography>
          </Box>

          <Grid container spacing={6} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <School sx={{ fontSize: 40, color: '#6366f1' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 2,
                  minHeight: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                1. Complete Your Profile
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  lineHeight: 1.6,
                  maxWidth: '280px',
                  mx: 'auto'
                }}
              >
                Tell us about your university, major, skills, and location preferences.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <Business sx={{ fontSize: 40, color: '#6366f1' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 2,
                  minHeight: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                2. Discover Matches
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  lineHeight: 1.6,
                  maxWidth: '280px',
                  mx: 'auto'
                }}
              >
                Our algorithm finds local businesses that match your skills and interests.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <Email sx={{ fontSize: 40, color: '#6366f1' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 2,
                  minHeight: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                3. Apply with Ease
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  lineHeight: 1.6,
                  maxWidth: '280px',
                  mx: 'auto'
                }}
              >
                Use our smart email generator to craft personalized applications instantly.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'white', py: 12, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#0f172a',
              mb: 3,
              letterSpacing: '-0.025em'
            }}
          >
            Ready to Build Your Future?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              fontWeight: 400,
              mb: 6,
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            Join thousands of students who have found meaningful opportunities 
            with local businesses through SkillBridge.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: '#6366f1',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                bgcolor: '#5856eb',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Get Started Today
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1e293b', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#94a3b8' }}>
            © 2024 SkillBridge. Connecting students with local opportunities.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
