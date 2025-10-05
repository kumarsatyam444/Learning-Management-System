const express = require('express');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { auth, requireRole } = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');

const router = express.Router();

router.post('/', auth, requireRole('creator', 'admin'), idempotency, async (req, res, next) => {
  try {
    const { title, description, thumbnailUrl } = req.body;

    if (!title) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'title',
          message: 'Title is required'
        }
      });
    }

    if (!description) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'description',
          message: 'Description is required'
        }
      });
    }

    const course = new Course({
      title,
      description,
      thumbnailUrl,
      creatorId: req.userId,
      status: 'draft'
    });

    await course.save();

    res.status(201).json({
      id: course._id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      createdAt: course.createdAt
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.q || '';

    const query = { status: 'published' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      items: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        creator: {
          id: course.creatorId._id,
          name: course.creatorId.name
        },
        createdAt: course.createdAt
      })),
      next_offset: offset + limit < total ? offset + limit : null
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creatorId', 'name email');

    if (!course) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    if (course.status !== 'published') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    const lessons = await Lesson.find({ courseId: course._id })
      .sort({ order: 1 })
      .select('_id title order duration');

    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      creator: {
        id: course.creatorId._id,
        name: course.creatorId.name
      },
      lessons: lessons.map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration
      })),
      createdAt: course.createdAt
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, requireRole('creator', 'admin'), async (req, res, next) => {
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

    if (course.creatorId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this course'
        }
      });
    }

    const { title, description, thumbnailUrl } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (thumbnailUrl !== undefined) course.thumbnailUrl = thumbnailUrl;

    await course.save();

    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      updatedAt: course.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, requireRole('creator', 'admin'), async (req, res, next) => {
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

    if (course.creatorId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this course'
        }
      });
    }

    await Lesson.deleteMany({ courseId: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/submit-for-review', auth, requireRole('creator'), async (req, res, next) => {
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

    if (course.creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to submit this course'
        }
      });
    }

    if (course.status !== 'draft' && course.status !== 'rejected') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: 'Only draft or rejected courses can be submitted for review'
        }
      });
    }

    const lessonsCount = await Lesson.countDocuments({ courseId: course._id });
    if (lessonsCount === 0) {
      return res.status(400).json({
        error: {
          code: 'NO_LESSONS',
          message: 'Course must have at least one lesson before submission'
        }
      });
    }

    course.status = 'pending_review';
    await course.save();

    res.json({
      id: course._id,
      status: course.status,
      updatedAt: course.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
