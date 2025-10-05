# MicroCourses Frontend

Frontend application for the MicroCourses Learning Management System built with React, Tailwind CSS, and React Router.

## Features

- Role-based navigation (Learner, Creator, Admin)
- JWT authentication with auto-refresh
- Course browsing with search and pagination
- Video lesson player with transcripts
- Progress tracking with certificates
- Creator dashboard with drag-and-drop lesson reordering
- Admin dashboards for course and creator application review

## Prerequisites

- Node.js 16+
- Backend API running (default: http://localhost:5000)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production deployment on Render, set:
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## Running the Application

### Development Mode

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Production Build

```bash
npm run build
```

## Test Accounts

After running the backend seed script, you can use these accounts:

- **Admin**: admin@example.com / Admin123!
- **Creator**: creator@example.com / Creator123!
- **Learner**: learner@example.com / Learner123!

## Pages & Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/courses` - Browse all published courses
- `/courses/:id` - Course details with lessons

### Learner Routes
- `/learn/:lessonId` - Lesson video player with transcript
- `/progress` - View enrolled courses, progress, and certificates

### Creator Routes
- `/creator/apply` - Apply to become a creator
- `/creator/dashboard` - Create and manage courses and lessons

### Admin Routes
- `/admin/review/courses` - Review and approve/reject courses
- `/admin/creator-applications` - Review and approve/reject creator applications

## Features in Detail

### Drag & Drop Lesson Reordering
Creators can reorder lessons in their courses using drag-and-drop functionality powered by React Beautiful DnD.

### Progress Tracking
Learners can track their progress through courses with visual progress bars showing completion percentage.

### Certificates
Certificates are automatically issued when a learner completes 100% of a course. They can be viewed and verified using a unique serial number.

### Transcripts
Video transcripts are auto-generated in the background and displayed alongside the video player.

## Deployment on Render

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/build`
5. Add environment variable: `REACT_APP_API_URL` with your backend URL
6. Deploy!

## Technologies Used

- React 18
- React Router 6
- Tailwind CSS
- Axios
- React Beautiful DnD
- Headless UI

## License

MIT
