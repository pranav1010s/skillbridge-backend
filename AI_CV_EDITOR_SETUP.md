# AI CV Editor Setup Guide

## Prerequisites

The AI CV Editor requires a **Google Gemini API key** to function. This enables:
- CV parsing and analysis
- Conversational AI chat
- Content enhancement suggestions

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy your API key

### 2. Configure Environment Variables

1. Open your `.env` file in the project root:
   ```bash
   cd /Users/sanju/Desktop/CascadeProjects/skillbridge
   nano .env
   ```

2. Add or update the `GEMINI_API_KEY` line:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Save the file (Ctrl+O, Enter, Ctrl+X in nano)

### 3. Restart the Server

After updating the `.env` file, restart your backend server:

```bash
cd /Users/sanju/Desktop/CascadeProjects/skillbridge
npm run dev
```

You should see in the console:
```
Gemini API Key loaded: Yes
```

If you see "No", the API key is not configured correctly.

## Troubleshooting

### "AI chat is not available" Error

**Cause**: The Gemini API key is missing or invalid.

**Solution**:
1. Check your `.env` file has `GEMINI_API_KEY=your_key_here`
2. Make sure there are no quotes around the key
3. Verify the key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Restart the backend server

### "Authentication error" Message

**Cause**: User is not logged in or JWT token expired.

**Solution**:
1. Log out and log back in
2. Check browser console for token errors
3. Clear localStorage and re-authenticate

### Chat Returns Generic Errors

**Solution**:
1. Open browser console (F12)
2. Look for error messages when sending a chat
3. Check backend terminal for detailed error logs
4. Verify MongoDB is running

## Testing the AI CV Editor

1. Navigate to the Applications page (should now show AI CV Editor)
2. Upload a PDF, DOC, or DOCX CV file
3. Wait for automatic AI analysis (should appear in chat)
4. Try commands like:
   - "How can I improve my CV?"
   - "Add React to my skills"
   - "Make my first work experience description better"
   - "What's missing from my CV?"

## Features

### CV Upload & Parsing
- Supports PDF, DOC, DOCX formats
- Max file size: 5MB
- Automatic extraction of:
  - Personal information
  - Education details
  - Skills
  - Work experience
  - Projects
  - Certifications
  - Languages

### AI Chat Assistant
- Conversational interface
- Context-aware responses
- Remembers conversation history
- Provides specific, actionable advice

### Live CV Preview
- Real-time preview of CV content
- Professional formatting
- All sections displayed with icons
- Updates automatically

## API Endpoints

- `POST /api/cv/upload` - Upload and parse CV
- `POST /api/cv/analyze` - Get comprehensive CV review
- `POST /api/cv/chat` - Interactive chat for CV editing
- `POST /api/cv/enhance` - Enhance specific CV sections
- `GET /api/cv/download/:filename` - Download CV file
- `DELETE /api/cv/delete` - Delete CV file

## Need Help?

If you continue to experience issues:
1. Check the browser console for errors
2. Check the backend terminal for logs
3. Verify all environment variables are set
4. Ensure MongoDB is running
5. Try with a different CV file

## Example .env File

```env
# Server Configuration
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/skillbridge

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google Gemini API for CV Parsing and AI Chat
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Remember to never commit your `.env` file to version control!
