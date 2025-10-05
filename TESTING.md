# Testing Guide - MicroCourses LMS

This document provides comprehensive testing instructions for all features of the MicroCourses Learning Management System.

## Prerequisites

1. Backend running on http://localhost:5000
2. Frontend running on http://localhost:3000
3. Database seeded with test data (`npm run seed`)
4. Redis running (optional but recommended)

## Test Accounts

```
Admin:   admin@example.com / Admin123!
Creator: creator@example.com / Creator123!
Learner: learner@example.com / Learner123!
```

## API Endpoint Testing

### 1. Authentication Tests

#### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "Test123!"
  }'
```

Expected: 201 Created with token and user info

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@example.com",
    "password": "Learner123!"
  }'
```

Expected: 200 OK with token and user info

Save the token for subsequent tests:
```bash
export TOKEN="your-jwt-token-here"
```

### 2. Course Tests

#### List Published Courses
```bash
curl http://localhost:5000/api/courses
```

Expected: List of published courses with pagination

#### Get Course Details
```bash
curl http://localhost:5000/api/courses/<course-id>
```

Expected: Course details with lessons

#### Create Course (Creator)
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "title": "Test Course",
    "description": "This is a test course",
    "thumbnailUrl": "https://example.com/image.jpg"
  }'
```

Expected: 201 Created with course details

### 3. Lesson Tests

#### Create Lesson (Creator)
```bash
curl -X POST http://localhost:5000/api/courses/<course-id>/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "title": "Test Lesson",
    "videoUrl": "https://youtube.com/watch?v=test",
    "order": 1,
    "duration": 600
  }'
```

Expected: 201 Created with lesson details

#### Test Order Conflict
```bash
curl -X POST http://localhost:5000/api/courses/<course-id>/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "title": "Another Lesson",
    "videoUrl": "https://youtube.com/watch?v=test2",
    "order": 1,
    "duration": 600
  }'
```

Expected: 400 Bad Request with ORDER_CONFLICT error

#### Get Transcript
```bash
curl http://localhost:5000/api/lessons/<lesson-id>/transcript
```

Expected: Transcript with status (pending/processing/completed)

### 4. Enrollment & Progress Tests

#### Enroll in Course (Learner)
```bash
curl -X POST http://localhost:5000/api/courses/<course-id>/enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)"
```

Expected: 201 Created with enrollment details

#### Complete Lesson
```bash
curl -X POST http://localhost:5000/api/learn/<lesson-id>/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Progress update with percentage and counts

#### Get Progress
```bash
curl http://localhost:5000/api/progress \
  -H "Authorization: Bearer $TOKEN"
```

Expected: List of enrollments with progress

### 5. Creator Application Tests

#### Apply for Creator Role
```bash
curl -X POST http://localhost:5000/api/creator/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "reason": "I want to share my knowledge"
  }'
```

Expected: 201 Created with application status

#### Check Application Status
```bash
curl http://localhost:5000/api/creator/apply \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Application details with status

### 6. Admin Tests

#### List Creator Applications (Admin)
```bash
curl http://localhost:5000/api/admin/creator-applications \
  -H "Authorization: Bearer $TOKEN"
```

Expected: List of applications

#### Approve Creator Application (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/creator-applications/<app-id>/approve \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Updated application status

#### List Pending Courses (Admin)
```bash
curl http://localhost:5000/api/admin/review/courses \
  -H "Authorization: Bearer $TOKEN"
```

Expected: List of courses pending review

#### Approve Course (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/review/courses/<course-id>/approve \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Updated course status to published

### 7. Certificate Tests

#### Get Certificate
```bash
curl http://localhost:5000/api/certificates/<serial>
```

Expected: Certificate details

#### Verify Certificate
```bash
curl http://localhost:5000/api/certificates/verify/<serial>
```

Expected: Verification result

### 8. Rate Limiting Test

Run this script to test rate limiting:

```bash
for i in {1..65}; do
  echo "Request $i"
  curl http://localhost:5000/api/courses
done
```

Expected: First 60 requests succeed, then 429 RATE_LIMIT error

### 9. Idempotency Test

Run same request twice with same key:

```bash
IDEM_KEY="test-key-123"

curl -X POST http://localhost:5000/api/creator/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $IDEM_KEY" \
  -d '{"reason": "Test"}' | jq

curl -X POST http://localhost:5000/api/creator/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $IDEM_KEY" \
  -d '{"reason": "Test"}' | jq
```

Expected: Both requests return same response

## Frontend Testing

### Learner Flow

1. **Browse Courses**
   - Go to http://localhost:3000/courses
   - Verify courses are displayed
   - Test search functionality
   - Test pagination

2. **View Course Details**
   - Click on a course
   - Verify lessons are listed
   - Check if enrolled status is shown

3. **Enroll in Course**
   - Login as learner
   - Click "Enroll Now"
   - Verify enrollment confirmation

4. **Watch Lesson**
   - Click "Start" on a lesson
   - Verify video player loads
   - Check transcript display
   - Click "Mark as Complete"
   - Verify progress update

5. **View Progress**
   - Go to /progress
   - Verify enrolled courses
   - Check progress bars
   - Test certificate download (after 100% completion)

### Creator Flow

1. **Apply for Creator**
   - Login as learner
   - Go to /creator/apply
   - Fill application form
   - Submit

2. **Creator Dashboard**
   - Login as creator
   - Go to /creator/dashboard
   - Create new course
   - Add lessons to course
   - Test drag-and-drop reordering
   - Submit course for review

3. **Manage Courses**
   - Edit course details
   - Add/remove lessons
   - View transcript status

### Admin Flow

1. **Review Creator Applications**
   - Login as admin
   - Go to /admin/creator-applications
   - Approve/reject applications
   - Verify status updates

2. **Review Courses**
   - Go to /admin/review/courses
   - View pending courses
   - Approve/reject with reason
   - Verify published courses appear in catalog

## Error Testing

### Test Error Responses

1. **Missing Required Fields**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```
Expected: 400 with FIELD_REQUIRED error

2. **Invalid Credentials**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "wrong@example.com", "password": "wrong"}'
```
Expected: 401 with INVALID_CREDENTIALS error

3. **Unauthorized Access**
```bash
curl http://localhost:5000/api/admin/creator-applications
```
Expected: 401 with UNAUTHORIZED error

4. **Duplicate Entry**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "learner@example.com",
    "password": "Test123!"
  }'
```
Expected: 400 with DUPLICATE_ERROR

## Integration Testing Checklist

- [ ] User can register and login
- [ ] Learner can browse courses
- [ ] Learner can enroll in courses
- [ ] Learner can complete lessons
- [ ] Progress tracking works correctly
- [ ] Certificates are issued at 100%
- [ ] Certificate verification works
- [ ] Creator can apply for role
- [ ] Admin can approve creator applications
- [ ] Creator can create courses
- [ ] Creator can add lessons
- [ ] Drag-and-drop lesson reordering works
- [ ] Course submission for review works
- [ ] Admin can approve/reject courses
- [ ] Approved courses appear in catalog
- [ ] Transcripts are auto-generated
- [ ] Rate limiting works (60 req/min)
- [ ] Idempotency prevents duplicates
- [ ] All error responses are uniform
- [ ] Order conflict is detected
- [ ] Role-based access control works

## Performance Testing

### Load Test with Apache Bench

```bash
# Install apache bench
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install httpd

# Test course listing
ab -n 1000 -c 10 http://localhost:5000/api/courses
```

Expected: All requests should complete successfully

## Browser Testing

Test in:
- Chrome
- Firefox
- Safari
- Edge

Verify:
- All pages load correctly
- Navigation works
- Forms submit properly
- Responsive design works

## Accessibility Testing

- [ ] All forms have proper labels
- [ ] Navigation is keyboard accessible
- [ ] Error messages are clear
- [ ] Color contrast is adequate

## Security Testing

- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized
- [ ] JWT tokens expire correctly
- [ ] Passwords are hashed
- [ ] CORS is configured properly

## Checklist Summary

✅ All API endpoints work correctly
✅ Authentication and authorization work
✅ Role-based features are properly restricted
✅ Error handling is consistent
✅ Idempotency prevents duplicates
✅ Rate limiting protects the API
✅ Certificates are secure and verifiable
✅ Frontend integrates with backend
✅ All user flows complete successfully

## Reporting Issues

If you find any bugs:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check backend logs
4. Document expected vs actual behavior
5. Create an issue with details

---

**Testing Complete!** 🎉
