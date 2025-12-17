'use client';

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Chip,
    useTheme
} from '@mui/material';
import {
    CheckCircle,
    RadioButtonUnchecked,
    ArrowForward
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface MissingField {
    field: string;
    label: string;
    weight: number;
    link: string;
}

interface ProfileCompletionProps {
    percentage: number;
    missingFields: MissingField[];
    isComplete: boolean;
}

const ProfileCompletionCard: React.FC<ProfileCompletionProps> = ({
    percentage,
    missingFields,
    isComplete
}) => {
    const theme = useTheme();
    const router = useRouter();

    const getProgressColor = () => {
        if (percentage >= 80) return '#10b981'; // Green
        if (percentage >= 50) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getStatusMessage = () => {
        if (isComplete) return 'Your profile is complete! 🎉';
        if (percentage >= 75) return 'Almost there! Just a few more steps';
        if (percentage >= 50) return 'You\'re halfway there!';
        return 'Let\'s build your profile';
    };

    return (
        <Card
            className="glass-panel"
            sx={{
                borderRadius: 4,
                overflow: 'visible',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b' }}>
                            Profile Completion
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {getStatusMessage()}
                        </Typography>
                    </Box>

                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <Box
                            sx={{
                                position: 'relative',
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: `conic-gradient(${getProgressColor()} ${percentage * 3.6}deg, rgba(99, 102, 241, 0.1) 0deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 800, color: getProgressColor() }}>
                                    {percentage}%
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {!isComplete && missingFields.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#64748b' }}>
                            Complete these to reach 100%:
                        </Typography>

                        <List dense sx={{ mb: 2 }}>
                            {missingFields.slice(0, 3).map((field) => (
                                <ListItem
                                    key={field.field}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        mb: 1,
                                        borderRadius: 2,
                                        background: 'rgba(248, 250, 252, 0.8)',
                                        border: '1px solid rgba(226, 232, 240, 0.8)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: 'white',
                                            borderColor: '#6366f1',
                                            transform: 'translateX(4px)'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 20 }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={field.label}
                                        primaryTypographyProps={{
                                            fontWeight: 500,
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                    <Chip
                                        label={`+${field.weight}%`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                                            color: '#6366f1',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            mr: 1
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                                        onClick={() => router.push(field.link)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            color: '#6366f1',
                                            '&:hover': {
                                                background: 'rgba(99, 102, 241, 0.1)'
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}

                {isComplete && (
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                            border: '2px solid rgba(16, 185, 129, 0.3)',
                            textAlign: 'center'
                        }}
                    >
                        <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981', mb: 0.5 }}>
                            Perfect Profile!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You're all set to find amazing opportunities
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileCompletionCard;
