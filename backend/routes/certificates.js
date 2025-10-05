const express = require('express');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

router.get('/:serial', async (req, res, next) => {
  try {
    const { serial } = req.params;

    const certificate = await Certificate.findOne({ serial })
      .populate('userId', 'name email')
      .populate('courseId', 'title description');

    if (!certificate) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Certificate not found'
        }
      });
    }

    res.json({
      serial: certificate.serial,
      user: {
        id: certificate.userId._id,
        name: certificate.userId.name,
        email: certificate.userId.email
      },
      course: {
        id: certificate.courseId._id,
        title: certificate.courseId.title,
        description: certificate.courseId.description
      },
      issuedAt: certificate.issuedAt
    });
  } catch (error) {
    next(error);
  }
});

router.get('/verify/:serial', async (req, res, next) => {
  try {
    const { serial } = req.params;

    const certificate = await Certificate.findOne({ serial })
      .populate('userId', 'name email')
      .populate('courseId', 'title description');

    if (!certificate) {
      return res.json({
        valid: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      valid: true,
      user: {
        id: certificate.userId._id,
        name: certificate.userId.name,
        email: certificate.userId.email
      },
      course: {
        id: certificate.courseId._id,
        title: certificate.courseId.title,
        description: certificate.courseId.description
      },
      issuedAt: certificate.issuedAt
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
