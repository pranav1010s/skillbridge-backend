import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Stack,
    Fade,
    Grow
} from '@mui/material';
import {
    School,
    Business,
    Email,
    LocationOn,
    TrendingUp,
    ConnectWithoutContact,
    ArrowForward,
    CheckCircle
} from '@mui/icons-material';
import Logo from '../components/Logo';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [visibleSections, setVisibleSections] = useState({
        features: false,
        cta: false
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            // Intersection Observer for scroll animations
            const features = document.getElementById('features-section');
            const cta = document.getElementById('cta-section');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections(prev => ({
                            ...prev,
                            [entry.target.id.replace('-section', '')]: true
                        }));
                    }
                });
            }, { threshold: 0.2 });

            if (features) observer.observe(features);
            if (cta) observer.observe(cta);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <LocationOn sx={{ fontSize: 36 }} />,
            title: 'Hyper-Local Focus',
            description: 'Find opportunities within walking distance of your campus, not just corporate giants.',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            icon: <ConnectWithoutContact sx={{ fontSize: 36 }} />,
            title: 'Smart Matching',
            description: 'Our algorithm matches your skills and interests with local businesses that need them.',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            icon: <Email sx={{ fontSize: 36 }} />,
            title: 'Email Draft Generator',
            description: 'Never struggle with cold emails again. We generate personalized drafts for you.',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            icon: <TrendingUp sx={{ fontSize: 36 }} />,
            title: 'Career Building',
            description: 'Build real-world experience and professional networks in your local community.',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        }
    ];

    return (
        <Box sx={{ bgcolor: '#fafbfc', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Premium Header */}
            <Box
                className="glass-panel"
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    background: scrolled
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: scrolled ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 2.5
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2} className="hover-scale" sx={{ cursor: 'pointer' }}>
                            <Logo size={44} />
                            <Typography
                                variant="h5"
                                className="text-gradient"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '-0.025em',
                                    fontSize: '1.4rem'
                                }}
                            >
                                SkillBridge
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                onClick={() => navigate('/login')}
                                sx={{
                                    color: '#64748b',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1.25,
                                    borderRadius: 2,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                                        color: '#6366f1'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                endIcon={<ArrowForward />}
                                className="hover-glow"
                                sx={{
                                    bgcolor: '#6366f1',
                                    color: 'white',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.25,
                                    borderRadius: 2,
                                    fontSize: '0.95rem',
                                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                                    '&:hover': {
                                        bgcolor: '#5856eb',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                            >
                                Get Started
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section with Animated Background */}
            <Box
                sx={{
                    position: 'relative',
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 10, md: 16 },
                    overflow: 'hidden',
                    background: 'linear-gradient(180deg, #fafbfc 0%, #f1f5f9 100%)'
                }}
            >
                {/* Animated Background Orbs */}
                <Box
                    className="animate-float"
                    sx={{
                        position: 'absolute',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                        top: '-200px',
                        right: '-100px',
                        filter: 'blur(80px)',
                        zIndex: 0
                    }}
                />
                <Box
                    className="animate-float"
                    sx={{
                        position: 'absolute',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                        bottom: '-150px',
                        left: '-50px',
                        filter: 'blur(80px)',
                        animationDelay: '2s',
                        zIndex: 0
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
                        <Fade in timeout={800}>
                            <Typography
                                variant="h1"
                                className="fade-in-up"
                                sx={{
                                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                                    fontWeight: 900,
                                    color: '#0f172a',
                                    lineHeight: 1.1,
                                    mb: 3,
                                    letterSpacing: '-0.025em'
                                }}
                            >
                                Bridge the Gap Between{' '}
                                <Box
                                    component="span"
                                    className="text-gradient"
                                    sx={{ display: 'inline-block' }}
                                >
                                    Students & Local Businesses
                                </Box>
                            </Typography>
                        </Fade>

                        <Typography
                            variant="h5"
                            className="fade-in-up delay-200"
                            sx={{
                                color: '#64748b',
                                fontWeight: 400,
                                lineHeight: 1.7,
                                mb: 6,
                                maxWidth: '700px',
                                mx: 'auto',
                                fontSize: { xs: '1.1rem', md: '1.35rem' }
                            }}
                        >
                            Discover internships, part-time jobs, and project opportunities
                            with small-to-medium businesses right in your neighborhood.
                        </Typography>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={3}
                            justifyContent="center"
                            className="fade-in-up delay-300"
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/register')}
                                className="hover-glow animate-pulse-glow"
                                endIcon={<ArrowForward />}
                                sx={{
                                    bgcolor: '#6366f1',
                                    color: 'white',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 6,
                                    py: 2.5,
                                    fontSize: '1.15rem',
                                    borderRadius: 3,
                                    boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
                                    '&:hover': {
                                        bgcolor: '#5856eb',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                            >
                                Start Your Journey
                            </Button>

                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    color: '#6366f1',
                                    borderColor: '#e2e8f0',
                                    borderWidth: '2px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 6,
                                    py: 2.5,
                                    fontSize: '1.15rem',
                                    borderRadius: 3,
                                    bgcolor: 'white',
                                    '&:hover': {
                                        bgcolor: '#f8fafc',
                                        borderColor: '#6366f1',
                                        borderWidth: '2px',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.15)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                            >
                                Learn More
                            </Button>
                        </Stack>

                        {/* Trust Indicators */}
                        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
                            {['500+ Students', '200+ Businesses', '1000+ Connections'].map((stat, idx) => (
                                <Box key={idx} className="fade-in-up" sx={{ animationDelay: `${0.4 + idx * 0.1}s` }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#6366f1', mb: 0.5 }}>
                                        {stat.split(' ')[0]}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                        {stat.split(' ')[1]}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Box id="features-section" sx={{ bgcolor: 'white', py: { xs: 6, md: 8 }, pb: { xs: 2, md: 3 } }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Grow in={visibleSections.features} timeout={800}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2rem', md: '2.75rem' },
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    mb: 2,
                                    letterSpacing: '-0.025em'
                                }}
                            >
                                Why Choose SkillBridge?
                            </Typography>
                        </Grow>
                        <Fade in={visibleSections.features} timeout={1000}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#64748b',
                                    fontWeight: 400,
                                    maxWidth: '650px',
                                    mx: 'auto',
                                    lineHeight: 1.7
                                }}
                            >
                                Connect with local opportunities that match your skills and build meaningful professional relationships
                            </Typography>
                        </Fade>
                    </Box>

                    <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '1100px', mx: 'auto' }}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={6} lg={6} key={index} sx={{ maxWidth: '500px' }}>
                                <Grow in={visibleSections.features} timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                                    <Card
                                        className="glass-card hover-lift"
                                        sx={{
                                            height: '100%',
                                            p: 5,
                                            textAlign: 'center',
                                            border: '1px solid rgba(99, 102, 241, 0.1)',
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                '& .feature-icon': {
                                                    transform: 'scale(1.1) rotate(5deg)',
                                                },
                                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                            }
                                        }}
                                    >
                                        {/* Gradient overlay on hover */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: feature.gradient,
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease',
                                                '.glass-card:hover &': {
                                                    opacity: 1
                                                }
                                            }}
                                        />

                                        <CardContent sx={{ p: 0 }}>
                                            <Box
                                                className="feature-icon"
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 3,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 3,
                                                    background: feature.gradient,
                                                    color: 'white',
                                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                }}
                                            >
                                                {feature.icon}
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    mb: 2
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#64748b',
                                                    lineHeight: 1.7
                                                }}
                                            >
                                                {feature.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Decorative Divider */}
            <Box sx={{
                bgcolor: 'white',
                pt: { xs: 2, md: 3 },
                pb: { xs: 1, md: 1 },
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="md">
                    <Box sx={{
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Gradient Line */}
                        <Box sx={{
                            height: '4px',
                            width: '150px',
                            mx: 'auto',
                            mb: 3,
                            background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                            borderRadius: '2px',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }} />

                        <Typography
                            variant="h3"
                            sx={{
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontWeight: 800,
                                color: '#1e293b',
                                mb: 2,
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Simple. Effective. Local.
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                color: '#64748b',
                                maxWidth: '600px',
                                mx: 'auto',
                                lineHeight: 1.6,
                                fontWeight: 400
                            }}
                        >
                            Your journey to meaningful opportunities starts here
                        </Typography>
                    </Box>
                </Container>

                {/* Decorative background elements */}
                <Box sx={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
                    top: '-100px',
                    left: '-50px',
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />
                <Box sx={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
                    bottom: '-100px',
                    right: '-50px',
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />
            </Box>


            {/* CTA Section */}
            <Box id="cta-section" sx={{ bgcolor: 'white', pt: { xs: 4, md: 6 }, pb: { xs: 10, md: 15 } }}>
                <Container maxWidth="md">
                    <Grow in={visibleSections.cta} timeout={800}>
                        <Box
                            className="glass-card"
                            sx={{
                                p: { xs: 6, md: 8 },
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                                border: '2px solid rgba(99, 102, 241, 0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Animated gradient border */}
                            <Box
                                className="animate-gradient"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                                    backgroundSize: '200% 100%'
                                }}
                            />

                            <CheckCircle
                                sx={{
                                    fontSize: 60,
                                    color: '#6366f1',
                                    mb: 3,
                                    filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))'
                                }}
                            />

                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2rem', md: '2.75rem' },
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    mb: 2,
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
                                    mb: 5,
                                    maxWidth: '550px',
                                    mx: 'auto',
                                    lineHeight: 1.7
                                }}
                            >
                                Join thousands of students who have found meaningful opportunities
                                with local businesses through SkillBridge.
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/register')}
                                endIcon={<ArrowForward />}
                                className="hover-glow animate-pulse-glow"
                                sx={{
                                    bgcolor: '#6366f1',
                                    color: 'white',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 7,
                                    py: 2.5,
                                    fontSize: '1.15rem',
                                    borderRadius: 3,
                                    boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
                                    '&:hover': {
                                        bgcolor: '#5856eb',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                            >
                                Get Started Today
                            </Button>
                        </Box>
                    </Grow>
                </Container>
            </Box>

            {/* Premium Footer */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: 'white',
                    py: 8,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Footer decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                        top: '-200px',
                        right: '-200px'
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-between" alignItems={{ xs: 'center', md: 'flex-start' }}>
                        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Logo size={40} />
                                <Typography variant="h5" className="text-gradient" sx={{ fontWeight: 800 }}>
                                    SkillBridge
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: '300px' }}>
                                Connecting students with local opportunities for meaningful career growth.
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
                                © 2024 SkillBridge. All rights reserved.
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Made with ❤️ for students everywhere
                            </Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
