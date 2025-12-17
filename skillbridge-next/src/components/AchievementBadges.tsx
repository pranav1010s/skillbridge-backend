'use client';

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    CheckCircle,
    Description,
    Work,
    Email,
    EmojiEvents,
    Star,
    LocalFireDepartment
} from '@mui/icons-material';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
}

interface AchievementBadgesProps {
    profilePercentage: number;
    hasCV: boolean;
    savedJobsCount: number;
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({
    profilePercentage,
    hasCV,
    savedJobsCount
}) => {
    const theme = useTheme();

    const achievements: Achievement[] = [
        {
            id: 'profile_starter',
            title: 'Getting Started',
            description: 'Created your account',
            icon: 'check',
            unlocked: true // Always unlocked if they're logged in
        },
        {
            id: 'profile_50',
            title: 'Half Way There',
            description: 'Completed 50% of your profile',
            icon: 'star',
            unlocked: profilePercentage >= 50
        },
        {
            id: 'profile_complete',
            title: 'Profile Master',
            description: 'Completed 100% of your profile',
            icon: 'trophy',
            unlocked: profilePercentage >= 100
        },
        {
            id: 'cv_uploaded',
            title: 'Resume Ready',
            description: 'Uploaded your CV',
            icon: 'description',
            unlocked: hasCV
        },
        {
            id: 'first_job_saved',
            title: 'Opportunity Hunter',
            description: 'Saved your first opportunity',
            icon: 'work',
            unlocked: savedJobsCount >= 1
        },
        {
            id: 'five_jobs_saved',
            title: 'Go-Getter',
            description: 'Saved 5+ opportunities',
            icon: 'fire',
            unlocked: savedJobsCount >= 5
        }
    ];

    const getIconComponent = (iconName: string, unlocked: boolean) => {
        const iconProps = {
            sx: {
                fontSize: 32,
                color: unlocked ? '#fff' : '#cbd5e1'
            }
        };

        switch (iconName) {
            case 'check':
                return <CheckCircle {...iconProps} />;
            case 'description':
                return <Description {...iconProps} />;
            case 'work':
                return <Work {...iconProps} />;
            case 'email':
                return <Email {...iconProps} />;
            case 'trophy':
                return <EmojiEvents {...iconProps} />;
            case 'star':
                return <Star {...iconProps} />;
            case 'fire':
                return <LocalFireDepartment {...iconProps} />;
            default:
                return <CheckCircle {...iconProps} />;
        }
    };

    const unlockedCount = achievements.filter(a => a.unlocked).length;

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
                            Achievements
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Unlocked {unlockedCount} of {achievements.length}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            px: 2.5,
                            py: 1,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                        }}
                    >
                        {unlockedCount}/{achievements.length}
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    {achievements.map((achievement) => (
                        <Grid item xs={6} sm={4} md={2} key={achievement.id}>
                            <Tooltip
                                title={
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                            {achievement.title}
                                        </Typography>
                                        <Typography variant="caption">
                                            {achievement.description}
                                        </Typography>
                                        {!achievement.unlocked && (
                                            <Typography variant="caption" display="block" sx={{ mt: 0.5, color: '#fbbf24' }}>
                                                🔒 Locked
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                arrow
                                placement="top"
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        p: 2,
                                        borderRadius: 3,
                                        background: achievement.unlocked
                                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                            : 'rgba(226, 232, 240, 0.5)',
                                        border: achievement.unlocked
                                            ? '2px solid rgba(99, 102, 241, 0.3)'
                                            : '2px dashed #cbd5e1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: 100,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        opacity: achievement.unlocked ? 1 : 0.6,
                                        '&:hover': {
                                            transform: achievement.unlocked ? 'translateY(-4px) scale(1.05)' : 'none',
                                            boxShadow: achievement.unlocked
                                                ? '0 12px 24px rgba(99, 102, 241, 0.3)'
                                                : 'none'
                                        }
                                    }}
                                    className={achievement.unlocked ? 'animate-scale-in' : ''}
                                >
                                    {getIconComponent(achievement.icon, achievement.unlocked)}

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: 1,
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            textAlign: 'center',
                                            color: achievement.unlocked ? 'white' : '#64748b'
                                        }}
                                    >
                                        {achievement.title}
                                    </Typography>

                                    {achievement.unlocked && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 8px rgba(16, 185, 129, 0.4)'
                                            }}
                                        >
                                            <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                                        </Box>
                                    )}
                                </Box>
                            </Tooltip>
                        </Grid>
                    ))}
                </Grid>

                {unlockedCount < achievements.length && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 600 }}>
                            🎯 Keep going! {achievements.length - unlockedCount} more {achievements.length - unlockedCount === 1 ? 'achievement' : 'achievements'} to unlock
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default AchievementBadges;
