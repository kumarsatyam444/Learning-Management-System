# MicroCourses Backend API

Backend API for the MicroCourses Learning Management System built with Express.js, MongoDB, and Redis.

## Features

- JWT-based authentication
- Role-based access control (Learner, Creator, Admin)
- Idempotency for POST requests (Redis)
- Rate limiting (60 requests/min per user)
- Auto-generated transcripts using background workers
- Certificate generation with HMAC verification
- Pagination support
- Uniform error handling

## Prerequisites

- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Redis (local or cloud instance)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
CERTIFICATE_SECRET=your_certificate_secret
NODE_ENV=development
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Seed Database

```bash
npm run seed
```

This creates:
- Admin user: admin@example.com / Admin123!
- Creator user: creator@example.com / Creator123!
- Learner user: learner@example.com / Learner123!
- 1 published course with 3 lessons

### Run Transcript Worker

```bash
npm run worker
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Creator
- `POST /api/creator/apply` - Apply for creator role (requires Idempotency-Key)
- `GET /api/creator/apply` - Check application status

### Admin
- `GET /api/admin/creator-applications` - List creator applications
- `POST /api/admin/creator-applications/:id/approve` - Approve application
- `POST /api/admin/creator-applications/:id/reject` - Reject application
- `GET /api/admin/review/courses` - List courses pending review
- `POST /api/admin/review/courses/:id/approve` - Approve course
- `POST /api/admin/review/courses/:id/reject` - Reject course

### Courses
- `POST /api/courses` - Create course (creator, requires Idempotency-Key)
- `GET /api/courses` - List published courses (with pagination & search)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (creator)
- `DELETE /api/courses/:id` - Delete course (creator)
- `POST /api/courses/:id/submit-for-review` - Submit course for review

### Lessons
- `POST /api/courses/:courseId/lessons` - Create lesson (requires Idempotency-Key)
- `GET /api/courses/:courseId/lessons` - List lessons
- `GET /api/courses/:courseId/lessons/:lessonId` - Get lesson details
- `GET /api/lessons/:lessonId/transcript` - Get transcript
- `PUT /api/courses/:courseId/lessons/:lessonId` - Update lesson
- `DELETE /api/courses/:courseId/lessons/:lessonId` - Delete lesson

### Enrollment & Progress
- `POST /api/courses/:courseId/enroll` - Enroll in course (requires Idempotency-Key)
- `POST /api/learn/:lessonId/complete` - Mark lesson complete
- `GET /api/progress` - Get user progress

### Certificates
- `GET /api/certificates/:serial` - Get certificate by serial
- `GET /api/certificates/verify/:serial` - Verify certificate

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard
6. Deploy!

For the transcript worker, create a separate Background Worker service with:
- Build command: `cd backend && npm install`
- Start command: `cd backend && npm run worker`

## Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "field": "fieldName",
    "message": "Error message"
  }
}
```

## License

MIT
