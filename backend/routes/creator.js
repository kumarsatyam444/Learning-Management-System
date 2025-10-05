const express = require('express');
const CreatorApplication = require('../models/CreatorApplication');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const idempotency = require('../middleware/idempotency');

const router = express.Router();

router.post('/apply', auth, idempotency, async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'reason',
          message: 'Reason is required'
        }
      });
    }

    const existingApplication = await CreatorApplication.findOne({ userId: req.userId });
    if (existingApplication) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_ERROR',
          field: 'application',
          message: 'You have already applied'
        }
      });
    }

    const application = new CreatorApplication({
      userId: req.userId,
      reason
    });

    await application.save();

    res.status(201).json({
      id: application._id,
      status: application.status,
      createdAt: application.createdAt
    });
  } catch (error) {
    next(error);
  }
});

router.get('/apply', auth, async (req, res, next) => {
  try {
    const application = await CreatorApplication.findOne({ userId: req.userId });

    if (!application) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'No application found'
        }
      });
    }

    res.json({
      id: application._id,
      status: application.status,
      reason: application.reason,
      createdAt: application.createdAt,
      reviewedAt: application.reviewedAt
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
