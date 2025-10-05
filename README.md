# MicroCourses - Learning Management System

A full-stack Learning Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring three distinct roles: Learner, Creator, and Admin.

## Features

### Core Functionality
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Three user roles with specific permissions
- **Idempotency** - Safe POST request handling with Redis
- **Rate Limiting** - 60 requests per minute per user
- **Auto-Generated Transcripts** - Background worker for video transcript generation
- **Certificate Generation** - HMAC-verified certificates upon course completion
- **Pagination** - Efficient data loading for all list endpoints

### User Roles

#### Learner
- Browse and search published courses
- Enroll in courses
- Watch video lessons with transcripts
- Track progress across courses
- Receive completion certificates

#### Creator
- Apply for creator status
- Create and manage courses
- Add and reorder lessons (drag & drop)
- Submit courses for admin review
- View auto-generated transcripts

#### Admin
- Review and approve/reject creator applications
- Review and approve/reject course submissions
- Manage platform content

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB (Atlas)
- Redis (for idempotency & rate limiting)
- Bull (job queue for transcripts)
- JWT for authentication
- bcrypt.js for password hashing

### Frontend
- React 18
- React Router 6
- Tailwind CSS
- Axios
- React Beautiful DnD

## Project Structure

```
Learning Management System/
├── backend/
│   ├── config/          # Database & Redis configuration
│   ├── middleware/      # Auth, rate limiting, idempotency, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── workers/         # Background transcript worker
│   ├── scripts/         # Seed data script
│   └── server.js        # Main server file
└── frontend/
    ├── public/
    └── src/
        ├── api/         # Axios configuration
        ├── components/  # Reusable components
        ├── context/     # Auth context
        ├── pages/       # Route components
        ├── App.js
        └── index.js
```

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Redis (local or cloud instance)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Learning Management System"
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://ndakumarsatyam_db_user:uifQWvFG5AsfsU2B@lms.wghkugn.mongodb.net/?retryWrites=true&w=majority&appName=lms
JWT_SECRET=microcourses-jwt-secret-key-2025-production-ready
REDIS_URL=redis://localhost:6379
CERTIFICATE_SECRET=microcourses-certificate-hmac-secret-2025
NODE_ENV=development
```

3. **Seed Database**
```bash
npm run seed
```

This creates:
- Admin: admin@example.com / Admin123!
- Creator: creator@example.com / Creator123!
- Learner: learner@example.com / Learner123!
- 1 published course with 3 lessons

4. **Start Backend**
```bash
npm run dev
```

5. **Start Transcript Worker (optional, in new terminal)**
```bash
npm run worker
```

6. **Setup Frontend**
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

7. **Start Frontend**
```bash
npm start
```

The application will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Creator
- `POST /api/creator/apply` - Apply for creator role
- `GET /api/creator/apply` - Check application status

### Admin
- `GET /api/admin/creator-applications` - List applications
- `POST /api/admin/creator-applications/:id/approve` - Approve application
- `POST /api/admin/creator-applications/:id/reject` - Reject application
- `GET /api/admin/review/courses` - List pending courses
- `POST /api/admin/review/courses/:id/approve` - Approve course
- `POST /api/admin/review/courses/:id/reject` - Reject course

### Courses
- `POST /api/courses` - Create course (creator)
- `GET /api/courses` - List published courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/submit-for-review` - Submit for review

### Lessons
- `POST /api/courses/:courseId/lessons` - Create lesson
- `GET /api/courses/:courseId/lessons` - List lessons
- `GET /api/lessons/:lessonId/transcript` - Get transcript

### Enrollment & Progress
- `POST /api/courses/:courseId/enroll` - Enroll in course
- `POST /api/learn/:lessonId/complete` - Mark lesson complete
- `GET /api/progress` - Get user progress

### Certificates
- `GET /api/certificates/:serial` - Get certificate
- `GET /api/certificates/verify/:serial` - Verify certificate

## Deployment on Render

### Backend Deployment

1. Create a **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `JWT_SECRET` - Secret key for JWT
     - `REDIS_URL` - Your Redis instance URL
     - `CERTIFICATE_SECRET` - Secret for certificate HMAC
     - `NODE_ENV` - production

4. Deploy!

### Transcript Worker (Optional)

1. Create a **Background Worker** on Render
2. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm run worker`
   - Same environment variables as backend

### Frontend Deployment

1. Create a **Static Site** on Render
2. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Environment Variables**:
     - `REACT_APP_API_URL` - Your backend URL (e.g., https://your-backend.onrender.com/api)

3. Deploy!

## Key Features Implementation

### Idempotency
All POST creation endpoints require an `Idempotency-Key` header. Duplicate keys return the cached response.

### Rate Limiting
Users are limited to 60 requests per minute. Exceeding returns a `RATE_LIMIT` error.

### Error Handling
All errors follow a uniform format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "field": "fieldName",
    "message": "Error message"
  }
}
```

### Lesson Order Conflict
When creating a lesson with a duplicate order number:
```json
{
  "error": {
    "code": "ORDER_CONFLICT",
    "field": "order",
    "message": "Lesson order must be unique"
  }
}
```

### Progress Tracking
Marking a lesson complete returns:
```json
{
  "progressPercent": 50,
  "completedLessonsCount": 2,
  "totalLessons": 4
}
```

### Certificate Verification
Certificates use HMAC SHA256 for secure serial generation and verification.

## Development Notes

- Backend runs on port 5000 by default
- Frontend runs on port 3000 by default
- Redis is required for idempotency and rate limiting
- MongoDB Atlas is used for data persistence
- CORS is enabled for all origins (open CORS)

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 30 days
- Certificate serials use HMAC SHA256
- Input validation on all endpoints
- Role-based access control

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
