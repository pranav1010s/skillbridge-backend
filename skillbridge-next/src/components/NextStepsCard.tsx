'use client';

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    useTheme
} from '@mui/material';
import {
    Description,
    Search,
    Person,
    Email,
    ArrowForward,
    SchoolOutlined,
    WorkOutline
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface NextStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
    priority: number;
}

interface NextStepsCardProps {
    nextSteps: NextStep[];
    profilePercentage: number;
}

const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
        description: Description,
        search: Search,
        person: Person,
        email: Email,
        school: SchoolOutlined,
        work: WorkOutline,
        workspace_premium: WorkOutline,
        location_on: Person,
        check_circle: Person
    };
    return icons[iconName] || Person;
};

const NextStepsCard: React.FC<NextStepsCardProps> = ({ nextSteps, profilePercentage }) => {
    const theme = useTheme();
    const router = useRouter();

    if (!nextSteps || nextSteps.length === 0) {
        return null;
    }

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
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b' }}>
                        What's Next?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {profilePercentage < 100
                            ? 'Complete these steps to maximize your opportunities'
                            : 'Your profile is ready - time to find opportunities!'
                        }
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    {nextSteps.map((step, index) => {
                        const IconComponent = getIconComponent(step.icon);

                        return (
                            <Box
                                key={step.id}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: index === 0
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)'
                                        : 'rgba(248, 250, 252, 0.8)',
                                    border: index === 0
                                        ? '2px solid rgba(99, 102, 241, 0.3)'
                                        : '1px solid rgba(226, 232, 240, 0.8)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                        borderColor: '#6366f1'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: index === 0
                                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: index === 0
                                                ? '0 4px 14px rgba(99, 102, 241, 0.4)'
                                                : '0 4px 14px rgba(100, 116, 139, 0.3)'
                                        }}
                                    >
                                        <IconComponent />
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b' }}>
                                            {step.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {step.description}
                                        </Typography>

                                        <Button
                                            variant={index === 0 ? 'contained' : 'outlined'}
                                            endIcon={<ArrowForward />}
                                            onClick={() => {
                                                if (step.link.includes('#')) {
                                                    const element = document.getElementById(step.link.split('#')[1]);
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                } else {
                                                    router.push(step.link);
                                                }
                                            }}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                ...(index === 0 && {
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                                    '&:hover': {
                                                        boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }),
                                                ...(index !== 0 && {
                                                    borderColor: '#e2e8f0',
                                                    color: '#64748b',
                                                    '&:hover': {
                                                        borderColor: '#6366f1',
                                                        color: '#6366f1',
                                                        background: 'rgba(99, 102, 241, 0.05)'
                                                    }
                                                })
                                            }}
                                        >
                                            {index === 0 ? 'Start Now' : 'Go'}
                                        </Button>
                                    </Box>

                                    {index === 0 && (
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                alignSelf: 'flex-start'
                                            }}
                                        >
                                            RECOMMENDED
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>

                {profilePercentage >= 100 && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                            💡 Pro tip: Keep your profile updated to get better matches!
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default NextStepsCard;
