# Quick Start Guide - MicroCourses LMS

This guide will help you get the MicroCourses Learning Management System up and running quickly.

## Prerequisites Checklist

- ✅ Node.js 16 or higher installed
- ✅ MongoDB Atlas account (already configured)
- ✅ Redis installed locally OR use a cloud Redis service (optional but recommended)

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Verify Backend Environment Variables

The `.env` file is already created with:
- MongoDB Atlas connection string
- JWT secret
- Certificate secret
- Redis URL (localhost)

### 3. Seed the Database

```bash
npm run seed
```

This creates test users and sample course data.

**Test Accounts Created:**
- 👨‍💼 Admin: `admin@example.com` / `Admin123!`
- 👨‍🏫 Creator: `creator@example.com` / `Creator123!`
- 👨‍🎓 Learner: `learner@example.com` / `Learner123!`

### 4. Start Backend Server

```bash
npm run dev
```

Backend will run on: http://localhost:5000

### 5. (Optional) Start Transcript Worker

In a new terminal:
```bash
cd backend
npm run worker
```

This enables auto-transcript generation for video lessons.

### 6. Install Frontend Dependencies

In a new terminal:
```bash
cd frontend
npm install
```

### 7. Start Frontend Application

```bash
npm start
```

Frontend will run on: http://localhost:3000

## Testing the Application

### As a Learner

1. Login with: `learner@example.com` / `Learner123!`
2. Browse courses at `/courses`
3. Click on "Introduction to Web Development"
4. Click "Enroll Now"
5. Start a lesson and mark it complete
6. View progress at `/progress`

### As a Creator

1. Login with: `creator@example.com` / `Creator123!`
2. Go to "Creator Dashboard"
3. Create a new course
4. Add lessons to your course
5. Drag and drop to reorder lessons
6. Submit course for review

### As an Admin

1. Login with: `admin@example.com` / `Admin123!`
2. Go to "Review Courses" to approve/reject courses
3. Go to "Creator Applications" to manage applications

## API Testing with curl

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"learner@example.com","password":"Learner123!"}'
```

### Get courses
```bash
curl http://localhost:5000/api/courses
```

## Common Issues & Solutions

### Redis Connection Error
If you see Redis connection errors:
- The app will continue to work but without idempotency and rate limiting
- Install Redis locally: https://redis.io/download
- Or use a cloud Redis service like Redis Cloud (free tier available)

### MongoDB Connection Error
- Verify your IP is whitelisted in MongoDB Atlas
- Check the connection string in `.env`

### Port Already in Use
- Backend (5000): Change `PORT` in `.env`
- Frontend (3000): It will prompt to use a different port

## Next Steps

1. **Customize**: Update branding, colors, and content
2. **Deploy**: Follow the deployment guide in README.md
3. **Enhance**: Add more features like:
   - Video upload functionality
   - Payment integration
   - Advanced analytics
   - Email notifications

## Project Structure Overview

```
Learning Management System/
├── backend/              # Express.js API server
│   ├── config/          # Database & Redis setup
│   ├── middleware/      # Auth, rate limiting, etc.
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── workers/         # Background jobs
│   ├── scripts/         # Utilities (seed data)
│   └── server.js        # Entry point
│
└── frontend/            # React application
    ├── src/
    │   ├── api/        # Axios configuration
    │   ├── components/ # Reusable components
    │   ├── context/    # React context (Auth)
    │   ├── pages/      # Route components
    │   └── App.js      # Main app component
    └── public/
```

## Support

If you encounter any issues:
1. Check the console logs (backend and frontend)
2. Verify all environment variables are set
3. Ensure MongoDB Atlas and Redis are accessible
4. Review the main README.md for detailed documentation

Happy Learning! 🚀
