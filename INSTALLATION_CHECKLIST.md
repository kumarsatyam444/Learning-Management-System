# ✅ Installation & Verification Checklist

Use this checklist to ensure everything is set up correctly.

---

## 📋 Pre-Installation Checklist

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional, for deployment)
- [ ] MongoDB Atlas connection string ready
- [ ] Redis installed or cloud Redis URL (optional)

---

## 🔧 Backend Setup Checklist

### Installation
- [ ] Navigate to backend folder: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] No errors during installation

### Configuration
- [ ] `.env` file exists in `/backend`
- [ ] `MONGODB_URI` is set correctly
- [ ] `JWT_SECRET` is set
- [ ] `CERTIFICATE_SECRET` is set
- [ ] `REDIS_URL` is set (or empty if skipping Redis)

### Database Setup
- [ ] Run seed script: `npm run seed`
- [ ] Seed completes successfully
- [ ] Console shows: "Database seeding completed successfully"
- [ ] 3 users created (admin, creator, learner)
- [ ] 1 course created
- [ ] 3 lessons created

### Start Backend
- [ ] Run: `npm run dev`
- [ ] Server starts on port 5000
- [ ] Console shows: "Server running on port 5000"
- [ ] Console shows: "MongoDB connected successfully"
- [ ] Console shows: "Redis connected successfully" (or "Continuing without Redis")

### Verify Backend
- [ ] Open browser: http://localhost:5000/health
- [ ] Response: `{"status":"ok","timestamp":"..."}`
- [ ] Open: http://localhost:5000/api/courses
- [ ] Returns JSON with courses array
- [ ] At least 1 course in the response

---

## 🎨 Frontend Setup Checklist

### Installation
- [ ] Open new terminal
- [ ] Navigate to frontend folder: `cd frontend`
- [ ] Install dependencies: `npm install`
- [ ] No errors during installation

### Configuration
- [ ] `.env` file exists in `/frontend`
- [ ] `REACT_APP_API_URL` is set to `http://localhost:5000/api`

### Start Frontend
- [ ] Run: `npm start`
- [ ] Browser opens automatically at http://localhost:3000
- [ ] No compilation errors
- [ ] Application loads

### Verify Frontend
- [ ] Homepage loads
- [ ] Navigation bar appears
- [ ] "MicroCourses" logo visible
- [ ] "Courses" link works
- [ ] "Login" and "Register" buttons visible

---

## 🧪 Feature Verification Checklist

### Authentication
- [ ] Click "Login"
- [ ] Login page loads
- [ ] Enter: learner@example.com / Learner123!
- [ ] Login successful
- [ ] Redirected to /courses
- [ ] User name appears in navbar
- [ ] "Logout" button appears

### Learner Features
- [ ] Courses page shows "Introduction to Web Development"
- [ ] Search box works
- [ ] Click on course
- [ ] Course details page loads
- [ ] Lessons are listed (3 lessons)
- [ ] "Enroll Now" button appears
- [ ] Click "Enroll Now"
- [ ] Enrollment successful message
- [ ] Button changes to "Continue Learning"
- [ ] Click "Start" on a lesson
- [ ] Lesson player loads
- [ ] Transcript section appears
- [ ] Click "Mark as Complete"
- [ ] Progress percentage shown
- [ ] Go to /progress
- [ ] Enrolled course appears
- [ ] Progress bar shows correct percentage

### Creator Features
- [ ] Logout
- [ ] Login as: creator@example.com / Creator123!
- [ ] "Creator Dashboard" link in navbar
- [ ] Click "Creator Dashboard"
- [ ] Dashboard loads
- [ ] "Create New Course" button visible
- [ ] Click "Create New Course"
- [ ] Modal opens
- [ ] Fill in course details
- [ ] Course created successfully
- [ ] Click on created course
- [ ] Lessons panel appears
- [ ] Click "Add Lesson"
- [ ] Lesson form modal opens
- [ ] Add lesson successfully
- [ ] Lesson appears in list
- [ ] Drag & drop works (try reordering)
- [ ] Click "Submit for Review"
- [ ] Course status changes to "pending_review"

### Admin Features
- [ ] Logout
- [ ] Login as: admin@example.com / Admin123!
- [ ] "Review Courses" link in navbar
- [ ] "Creator Applications" link in navbar
- [ ] Click "Review Courses"
- [ ] Pending course appears (if submitted by creator)
- [ ] "Approve" and "Reject" buttons work
- [ ] Click "Creator Applications"
- [ ] Applications list loads (might be empty)
- [ ] Approve/Reject buttons functional

---

## 🔍 API Testing Checklist

### Test with curl or Postman

- [ ] GET http://localhost:5000/health
  - Response: `{"status":"ok"}`
  
- [ ] GET http://localhost:5000/api/courses
  - Returns array of courses
  
- [ ] POST http://localhost:5000/api/auth/login
  - Body: `{"email":"learner@example.com","password":"Learner123!"}`
  - Returns token and user object
  
- [ ] GET http://localhost:5000/api/progress (with auth header)
  - Returns user progress

---

## 🐛 Troubleshooting Checklist

### Backend Won't Start

- [ ] Check MongoDB Atlas connection string
- [ ] Verify IP whitelist in MongoDB Atlas (0.0.0.0/0)
- [ ] Check if port 5000 is available
- [ ] Look for errors in console
- [ ] Try without Redis (comment out REDIS_URL)

### Frontend Won't Start

- [ ] Check if backend is running
- [ ] Verify .env file exists
- [ ] Clear node_modules and reinstall
- [ ] Check for port conflicts

### Can't Login

- [ ] Verify seed script ran successfully
- [ ] Check backend is running
- [ ] Verify API URL in frontend .env
- [ ] Check browser console for errors

### Courses Not Loading

- [ ] Backend is running
- [ ] Seed script completed
- [ ] Check network tab in browser dev tools
- [ ] Verify API endpoint returns data

---

## 📊 Performance Checklist

- [ ] Pages load in < 2 seconds
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth navigation
- [ ] Drag & drop responsive

---

## 🔒 Security Checklist

- [ ] Passwords are not visible in network tab
- [ ] JWT token is sent in Authorization header
- [ ] Can't access admin pages as learner
- [ ] Can't access creator pages as learner
- [ ] Rate limiting works (test with multiple requests)

---

## 📱 Browser Compatibility Checklist

Test in multiple browsers:

- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work

---

## 🚀 Deployment Readiness Checklist

- [ ] All features work locally
- [ ] No console errors
- [ ] Database is seeded
- [ ] Environment variables documented
- [ ] README.md reviewed
- [ ] DEPLOYMENT.md reviewed
- [ ] GitHub repository created (optional)
- [ ] Render account created (for deployment)

---

## ✅ Final Verification

Complete this final check:

1. **Backend**
   - [ ] Starts without errors
   - [ ] Health endpoint responds
   - [ ] API endpoints work
   - [ ] Database connected
   - [ ] Redis connected (or gracefully disabled)

2. **Frontend**
   - [ ] Builds without errors
   - [ ] All pages load
   - [ ] Navigation works
   - [ ] Forms submit correctly
   - [ ] API calls succeed

3. **Features**
   - [ ] Authentication works
   - [ ] All 3 roles function correctly
   - [ ] Course creation works
   - [ ] Enrollment works
   - [ ] Progress tracking works
   - [ ] Certificates generate
   - [ ] Transcripts work

4. **Documentation**
   - [ ] README.md read
   - [ ] QUICKSTART.md followed
   - [ ] All features understood
   - [ ] Deployment process clear

---

## 🎉 Success Criteria

You're ready to deploy when:

✅ All backend checklist items complete  
✅ All frontend checklist items complete  
✅ All features verified  
✅ No critical errors  
✅ Test accounts work  
✅ Documentation reviewed  

---

## 📞 If Something Doesn't Work

1. **Check Console Logs**
   - Backend terminal
   - Browser console (F12)

2. **Review Documentation**
   - START_HERE.md
   - QUICKSTART.md
   - README.md

3. **Common Issues**
   - MongoDB connection → Check Atlas IP whitelist
   - Port conflicts → Change ports in .env
   - Missing dependencies → Run npm install again
   - Redis errors → It's optional, can run without it

4. **Verify Basics**
   - Node.js version 16+
   - npm installed
   - MongoDB Atlas accessible
   - Correct .env values

---

## 🏆 Completion

When all items are checked:

✅ **Your MicroCourses LMS is fully functional!**

Next steps:
1. Deploy to production (see DEPLOYMENT.md)
2. Customize branding
3. Add your own courses
4. Share with users!

---

**Need Help?**

- Read QUICKSTART.md for setup
- Read TESTING.md for feature testing
- Read DEPLOYMENT.md for going live

**Ready to Deploy?** See DEPLOYMENT.md

---

Last Updated: $(date)
