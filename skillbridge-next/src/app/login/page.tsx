'use client';
/* eslint-disable */
// @ts-nocheck

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    ArrowForward
} from '@mui/icons-material';
import axios from 'axios';
import Logo from '@/components/Logo';
import config from '@/config';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setResetMessage('');
        try {
            await axios.post(`${config.API_URL}/api/auth/forgot-password`, { email: resetEmail });
            setResetMessage('Password reset link sent to your email!');
            setTimeout(() => {
                setForgotPasswordOpen(false);
                setResetEmail('');
                setResetMessage('');
            }, 2000);
        } catch (err) {
            setResetMessage(err.response?.data?.message || 'Failed to send reset link');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated Background Orbs */}
            <Box
                className="animate-float"
                sx={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                    top: '-100px',
                    left: '-100px',
                    filter: 'blur(60px)'
                }}
            />
            <Box
                className="animate-float"
                sx={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                    bottom: '-50px',
                    right: '-50px',
                    filter: 'blur(60px)',
                    animationDelay: '2s'
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    className="glass-card-strong"
                    sx={{
                        p: { xs: 4, sm: 6 },
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Gradient Top Border */}
                    <Box
                        className="animate-gradient"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                            backgroundSize: '200% 100%'
                        }}
                    />

                    {/* Logo and Title */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box className="animate-scale-in" sx={{ display: 'inline-block', mb: 2 }}>
                            <Logo size={60} />
                        </Box>
                        <Typography
                            variant="h4"
                            className="text-gradient fade-in-up"
                            sx={{
                                fontWeight: 800,
                                mb: 1,
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="body1"
                            className="fade-in-up delay-100"
                            sx={{ color: '#64748b' }}
                        >
                            Sign in to continue your journey
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="fade-in-up delay-200"
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(248, 250, 252, 1)',
                                        '& fieldset': {
                                            borderColor: '#667eea'
                                        }
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white',
                                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                        '& fieldset': {
                                            borderColor: '#667eea',
                                            borderWidth: '2px'
                                        }
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: '#667eea' }} />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="fade-in-up delay-300"
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(248, 250, 252, 1)',
                                        '& fieldset': {
                                            borderColor: '#667eea'
                                        }
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white',
                                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                        '& fieldset': {
                                            borderColor: '#667eea',
                                            borderWidth: '2px'
                                        }
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: '#667eea' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{
                                                color: '#667eea',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                                                }
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Box sx={{ textAlign: 'right', mb: 3 }}>
                            <Link
                                component="button"
                                type="button"
                                onClick={() => setForgotPasswordOpen(true)}
                                className="fade-in-up delay-400"
                                sx={{
                                    color: '#667eea',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                            className="hover-glow fade-in-up delay-500"
                            sx={{
                                py: 1.75,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                                },
                                '&:disabled': {
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    opacity: 0.6
                                },
                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    <Box className="fade-in-up delay-600" sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Don't have an account?{' '}
                            <Link
                                component="button"
                                onClick={() => router.push('/register')}
                                sx={{
                                    color: '#667eea',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Container>

            {/* Forgot Password Dialog */}
            <Dialog
                open={forgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
                PaperProps={{
                    className: 'glass-card',
                    sx: {
                        borderRadius: 3,
                        p: 2,
                        minWidth: { xs: '90%', sm: '400px' }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Reset Password
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Typography>
                    {resetMessage && (
                        <Alert severity={resetMessage.includes('sent') ? 'success' : 'error'} sx={{ mb: 2 }}>
                            {resetMessage}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setForgotPasswordOpen(false)}
                        sx={{ color: '#64748b', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleForgotPassword}
                        variant="contained"
                        disabled={!resetEmail}
                        sx={{
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                            }
                        }}
                    >
                        Send Reset Link
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Login;
