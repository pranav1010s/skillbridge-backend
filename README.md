# SkillBridge

A web-based platform that bridges the gap between university students and local small-to-medium businesses (SMBs) offering relevant internships, part-time jobs, and project-based work.

## Features

- **Student Onboarding**: Multi-step profile creation with academic info, skills, and location preferences
- **Smart Matching**: Intelligent algorithm that matches students with local businesses based on skills, location, and industry preferences
- **Email Draft Generator**: Automated personalized email drafts for reaching out to businesses
- **Local Business Database**: Curated database of local SMBs with contact information
- **Modern UI/UX**: Clean, responsive design built with Material-UI

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Axios for API calls

### Frontend
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls
- Context API for state management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google Maps API key (optional, for geocoding)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skillbridge
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillbridge
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. Start MongoDB:
Make sure MongoDB is running on your system.

5. Run the application:
```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
# Server only
npm run server

# Client only (in another terminal)
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/profile` - Get user profile
- `POST /api/users/geocode` - Geocode zip code

### Businesses
- `GET /api/businesses/search` - Search businesses
- `GET /api/businesses/:id` - Get single business
- `POST /api/businesses/populate-sample` - Add sample data (development)

### Matches
- `POST /api/matches/generate` - Generate matches for user
- `GET /api/matches` - Get user matches
- `POST /api/matches/:id/draft-email` - Generate email draft
- `PUT /api/matches/:id/email-sent` - Mark email as sent

## Usage

1. **Register**: Create an account with basic information
2. **Complete Profile**: Go through the onboarding flow to add academic info, skills, and preferences
3. **Generate Matches**: The system will find local businesses that match your profile
4. **Draft Emails**: Use the smart email generator to create personalized outreach emails
5. **Apply**: Send emails directly from your email client

## Development Features

- **Sample Data**: Use the floating action button in the dashboard to populate sample businesses
- **Hot Reload**: Both frontend and backend support hot reloading during development
- **Error Handling**: Comprehensive error handling and user feedback

## Future Enhancements

- Business portal for posting opportunities
- In-app messaging system
- Student portfolio showcase
- University partnerships
- Advanced AI matching
- Mobile app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
