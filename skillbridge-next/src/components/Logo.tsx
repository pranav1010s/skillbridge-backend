'use client';
/* eslint-disable */
// @ts-nocheck

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';

interface LogoProps {
    size?: number;
    sx?: object;
}

const Logo = ({ size = 40, sx = {} }: LogoProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push('/dashboard');
    };

    return (
        <Box
            onClick={handleClick}
            sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease-in-out'
                },
                ...sx
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B35" />
                        <stop offset="50%" stopColor="#FF8E53" />
                        <stop offset="100%" stopColor="#E91E63" />
                    </linearGradient>
                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B35" />
                        <stop offset="50%" stopColor="#FF8E53" />
                        <stop offset="100%" stopColor="#E91E63" />
                    </linearGradient>
                </defs>

                {/* Rounded square background */}
                <rect
                    x="5"
                    y="5"
                    width="90"
                    height="90"
                    rx="20"
                    ry="20"
                    fill="url(#bgGradient)"
                />

                {/* Vertical line on left */}
                <rect
                    x="25"
                    y="20"
                    width="4"
                    height="35"
                    rx="2"
                    fill="white"
                />

                {/* Bottom left circle (larger) */}
                <circle
                    cx="27"
                    cy="70"
                    r="8"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                />

                {/* Top right circle (smaller) */}
                <circle
                    cx="65"
                    cy="35"
                    r="6"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                />

                {/* Curved connecting path */}
                <path
                    d="M35 70 Q50 50 59 35"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </Box>
    );
};

export default Logo;
