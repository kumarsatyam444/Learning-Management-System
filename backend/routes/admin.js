const express = require('express');
const CreatorApplication = require('../models/CreatorApplication');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/creator-applications', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const applications = await CreatorApplication.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await CreatorApplication.countDocuments();

    res.json({
      items: applications.map(app => ({
        id: app._id,
        user: {
          id: app.userId._id,
          name: app.userId.name,
          email: app.userId.email
        },
        reason: app.reason,
        status: app.status,
        createdAt: app.createdAt,
        reviewedAt: app.reviewedAt
      })),
      next_offset: offset + limit < total ? offset + limit : null
    });
  } catch (error) {
    next(error);
  }
});

router.post('/creator-applications/:id/approve', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const application = await CreatorApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: 'Application has already been reviewed'
        }
      });
    }

    application.status = 'approved';
    application.reviewedBy = req.userId;
    application.reviewedAt = new Date();
    await application.save();

    await User.findByIdAndUpdate(application.userId, { role: 'creator' });

    res.json({
      id: application._id,
      status: application.status,
      reviewedAt: application.reviewedAt
    });
  } catch (error) {
    next(error);
  }
});

router.post('/creator-applications/:id/reject', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const application = await CreatorApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: 'Application has already been reviewed'
        }
      });
    }

    application.status = 'rejected';
    application.reviewedBy = req.userId;
    application.reviewedAt = new Date();
    await application.save();

    res.json({
      id: application._id,
      status: application.status,
      reviewedAt: application.reviewedAt
    });
  } catch (error) {
    next(error);
  }
});

router.get('/review/courses', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const courses = await Course.find({ status: 'pending_review' })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Course.countDocuments({ status: 'pending_review' });

    res.json({
      items: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        creator: {
          id: course.creatorId._id,
          name: course.creatorId.name,
          email: course.creatorId.email
        },
        status: course.status,
        createdAt: course.createdAt
      })),
      next_offset: offset + limit < total ? offset + limit : null
    });
  } catch (error) {
    next(error);
  }
});

router.post('/review/courses/:id/approve', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    if (course.status !== 'pending_review') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: 'Course is not pending review'
        }
      });
    }

    course.status = 'published';
    course.reviewedBy = req.userId;
    course.reviewedAt = new Date();
    await course.save();

    res.json({
      id: course._id,
      status: course.status,
      reviewedAt: course.reviewedAt
    });
  } catch (error) {
    next(error);
  }
});

router.post('/review/courses/:id/reject', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const { reason } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    if (course.status !== 'pending_review') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: 'Course is not pending review'
        }
      });
    }

    course.status = 'rejected';
    course.reviewedBy = req.userId;
    course.reviewedAt = new Date();
    course.rejectionReason = reason;
    await course.save();

    res.json({
      id: course._id,
      status: course.status,
      rejectionReason: course.rejectionReason,
      reviewedAt: course.reviewedAt
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
