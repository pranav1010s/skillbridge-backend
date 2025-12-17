/**
 * Calculate user profile completion percentage and identify missing fields
 */
function calculateProfileCompletion(user) {
    // Field weights (must total 100)
    const weights = {
        basics: 20,      // firstName, lastName, email (always filled at registration)
        education: 25,   // university, major, year, expectedGraduation
        skills: 20,      // skills array (minimum 3)
        location: 15,    // city, postcode, coordinates
        preferences: 10, // jobTypes, industries
        cv: 10           // resumeUrl
    };

    let score = weights.basics; // Always have basics after registration
    const missingFields = [];
    const nextSteps = [];

    // Check education
    if (user.university && user.major && user.year && user.expectedGraduation) {
        score += weights.education;
    } else {
        missingFields.push({
            field: 'education',
            label: 'Complete Education Details',
            weight: weights.education,
            link: '/profile'
        });
    }

    // Check skills (need at least 3)
    if (user.skills && user.skills.length >= 3) {
        score += weights.skills;
    } else {
        missingFields.push({
            field: 'skills',
            label: `Add ${user.skills?.length ? (3 - user.skills.length) : 3} More Skills`,
            weight: weights.skills,
            link: '/profile'
        });
    }

    // Check location
    if (user.locationPreference?.city && user.locationPreference?.postcode) {
        score += weights.location;
    } else {
        missingFields.push({
            field: 'location',
            label: 'Set Location Preferences',
            weight: weights.location,
            link: '/profile'
        });
    }

    // Check career preferences
    if ((user.careerPreferences?.jobTypes?.length > 0) ||
        (user.careerPreferences?.industries?.length > 0)) {
        score += weights.preferences;
    } else {
        missingFields.push({
            field: 'preferences',
            label: 'Add Job Preferences',
            weight: weights.preferences,
            link: '/profile'
        });
    }

    // Check CV upload
    if (user.resumeUrl) {
        score += weights.cv;
    } else {
        missingFields.push({
            field: 'cv',
            label: 'Upload Your CV',
            weight: weights.cv,
            link: '/ai-cv-editor'
        });
    }

    // Generate next steps based on completion
    if (score < 100) {
        // Sort by weight (highest impact first)
        const sortedMissing = [...missingFields].sort((a, b) => b.weight - a.weight);
        nextSteps.push(...sortedMissing.slice(0, 3).map(field => ({
            id: field.field,
            title: field.label,
            description: getStepDescription(field.field),
            icon: getStepIcon(field.field),
            link: field.link,
            priority: field.weight
        })));
    } else {
        // Profile complete - suggest next actions
        nextSteps.push({
            id: 'find_opportunities',
            title: 'Find Job Opportunities',
            description: 'Use AI to discover roles that match your profile',
            icon: 'search',
            link: '/dashboard#opportunities',
            priority: 100
        });
    }

    return {
        percentage: Math.round(score),
        completedFields: getCompletedFields(user),
        missingFields,
        nextSteps,
        isComplete: score >= 100
    };
}

function getCompletedFields(user) {
    const completed = ['basics']; // Always have basics

    if (user.university && user.major && user.year && user.expectedGraduation) {
        completed.push('education');
    }
    if (user.skills && user.skills.length >= 3) {
        completed.push('skills');
    }
    if (user.locationPreference?.city && user.locationPreference?.postcode) {
        completed.push('location');
    }
    if ((user.careerPreferences?.jobTypes?.length > 0) ||
        (user.careerPreferences?.industries?.length > 0)) {
        completed.push('preferences');
    }
    if (user.resumeUrl) {
        completed.push('cv');
    }

    return completed;
}

function getStepDescription(field) {
    const descriptions = {
        education: 'Add your university, major, and graduation year',
        skills: 'List your technical and soft skills',
        location: 'Set your preferred work location and radius',
        preferences: 'Choose job types and industries you\'re interested in',
        cv: 'Upload your CV for AI-powered analysis and matching'
    };
    return descriptions[field] || '';
}

function getStepIcon(field) {
    const icons = {
        education: 'school',
        skills: 'workspace_premium',
        location: 'location_on',
        preferences: 'work',
        cv: 'description'
    };
    return icons[field] || 'check_circle';
}

module.exports = {
    calculateProfileCompletion
};
