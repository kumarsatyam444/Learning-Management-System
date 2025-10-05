const express = require('express');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, requireRole } = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');
const { addTranscriptJob } = require('../workers/transcriptQueue');

const router = express.Router();

router.post('/courses/:courseId/lessons', auth, requireRole('creator', 'admin'), idempotency, async (req, res, next) => {
  try {
    const { title, videoUrl, order, duration } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
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
          message: 'You do not have permission to add lessons to this course'
        }
      });
    }

    if (!title) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'title',
          message: 'Title is required'
        }
      });
    }

    if (!videoUrl) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'videoUrl',
          message: 'Video URL is required'
        }
      });
    }

    if (order === undefined) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'order',
          message: 'Order is required'
        }
      });
    }

    const existingLesson = await Lesson.findOne({ courseId, order });
    if (existingLesson) {
      return res.status(400).json({
        error: {
          code: 'ORDER_CONFLICT',
          field: 'order',
          message: 'Lesson order must be unique'
        }
      });
    }

    const lesson = new Lesson({
      courseId,
      title,
      videoUrl,
      order,
      duration: duration || 0,
      transcript: {
        text: '',
        status: 'pending'
      }
    });

    await lesson.save();

    await addTranscriptJob({
      lessonId: lesson._id,
      videoUrl: lesson.videoUrl
    });

    res.status(201).json({
      id: lesson._id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      duration: lesson.duration,
      transcript: {
        status: lesson.transcript.status
      },
      createdAt: lesson.createdAt
    });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:courseId/lessons', async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.find({ courseId })
      .sort({ order: 1 })
      .select('_id title videoUrl order duration transcript.status');

    res.json({
      items: lessons.map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        order: lesson.order,
        duration: lesson.duration,
        transcriptStatus: lesson.transcript.status
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:courseId/lessons/:lessonId', async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });

    if (!lesson) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Lesson not found'
        }
      });
    }

    res.json({
      id: lesson._id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      duration: lesson.duration,
      transcript: {
        text: lesson.transcript.text,
        status: lesson.transcript.status
      },
      createdAt: lesson.createdAt
    });
  } catch (error) {
    next(error);
  }
});

router.get('/lessons/:lessonId/transcript', async (req, res, next) => {
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

    res.json({
      text: lesson.transcript.text,
      status: lesson.transcript.status
    });
  } catch (error) {
    next(error);
  }
});

router.put('/courses/:courseId/lessons/:lessonId', auth, requireRole('creator', 'admin'), async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, videoUrl, order, duration } = req.body;

    const course = await Course.findById(courseId);
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
          message: 'You do not have permission to edit this lesson'
        }
      });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Lesson not found'
        }
      });
    }

    if (order !== undefined && order !== lesson.order) {
      const existingLesson = await Lesson.findOne({ courseId, order });
      if (existingLesson) {
        return res.status(400).json({
          error: {
            code: 'ORDER_CONFLICT',
            field: 'order',
            message: 'Lesson order must be unique'
          }
        });
      }
      lesson.order = order;
    }

    if (title) lesson.title = title;
    if (videoUrl) lesson.videoUrl = videoUrl;
    if (duration !== undefined) lesson.duration = duration;

    await lesson.save();

    res.json({
      id: lesson._id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      duration: lesson.duration
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/courses/:courseId/lessons/:lessonId', auth, requireRole('creator', 'admin'), async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
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
          message: 'You do not have permission to delete this lesson'
        }
      });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Lesson not found'
        }
      });
    }

    await Lesson.findByIdAndDelete(lessonId);

    res.json({
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
