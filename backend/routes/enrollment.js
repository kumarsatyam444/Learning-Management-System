const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Certificate = require('../models/Certificate');
const { auth } = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');
const crypto = require('crypto');

const router = express.Router();

router.post('/courses/:courseId/enroll', auth, idempotency, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      userId: req.userId,
      courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Already enrolled in this course'
        }
      });
    }

    const enrollment = new Enrollment({
      userId: req.userId,
      courseId,
      completedLessons: [],
      progressPercent: 0
    });

    await enrollment.save();

    res.status(201).json({
      id: enrollment._id,
      courseId: enrollment.courseId,
      progressPercent: enrollment.progressPercent,
      enrolledAt: enrollment.enrolledAt
    });
  } catch (error) {
    next(error);
  }
});

router.post('/learn/:lessonId/complete', auth, async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Lesson not found'
        }
      });
    }

    const enrollment = await Enrollment.findOne({
      userId: req.userId,
      courseId: lesson.courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        error: {
          code: 'NOT_ENROLLED',
          message: 'You are not enrolled in this course'
        }
      });
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    const completedLessonsCount = enrollment.completedLessons.length;
    const progressPercent = Math.round((completedLessonsCount / totalLessons) * 100);

    enrollment.progressPercent = progressPercent;
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    if (progressPercent === 100) {
      const existingCert = await Certificate.findOne({
        userId: req.userId,
        courseId: lesson.courseId
      });

      if (!existingCert) {
        const timestamp = Date.now();
        const dataToHash = `${req.userId}:${lesson.courseId}:${timestamp}`;
        const serial = crypto
          .createHmac('sha256', process.env.CERTIFICATE_SECRET)
          .update(dataToHash)
          .digest('hex');

        const certificate = new Certificate({
          userId: req.userId,
          courseId: lesson.courseId,
          serial
        });

        await certificate.save();
      }
    }

    res.json({
      progressPercent,
      completedLessonsCount,
      totalLessons
    });
  } catch (error) {
    next(error);
  }
});

router.get('/progress', auth, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.userId })
      .populate('courseId', 'title description thumbnailUrl')
      .sort({ lastAccessedAt: -1 });

    const certificates = await Certificate.find({ userId: req.userId });
    const certMap = {};
    certificates.forEach(cert => {
      certMap[cert.courseId.toString()] = cert.serial;
    });

    const items = await Promise.all(enrollments.map(async (enrollment) => {
      const totalLessons = await Lesson.countDocuments({ courseId: enrollment.courseId._id });
      
      return {
        courseId: enrollment.courseId._id,
        courseTitle: enrollment.courseId.title,
        courseDescription: enrollment.courseId.description,
        courseThumbnail: enrollment.courseId.thumbnailUrl,
        progressPercent: enrollment.progressPercent,
        completedLessons: enrollment.completedLessons.length,
        totalLessons,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        certificateSerial: certMap[enrollment.courseId._id.toString()] || null
      };
    }));

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
