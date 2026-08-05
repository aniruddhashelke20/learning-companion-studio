import express from 'express';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';
import { logEvent } from '../utils/events.js';
const router = express.Router();

const allowed = new Set([
  'DASHBOARD_VIEWED',
  'LESSON_SCROLLED',
  'VIDEO_PLAYED',
  'VIDEO_PAUSED',
  'VIDEO_COMPLETED',
  'VIDEO_SEEKED',
  'QUIZ_STARTED',
  'QUIZ_REVIEWED',
  'COURSE_CARD_CLICKED',
  'QUIZ_OPTION_SELECTED',
  'THEME_TOGGLED',
  'EXPORT_CLICKED',
  'LEARNER_LOG_VIEWED'
]);

router.post('/', protect, async (req, res, next) => {
  try {
    const { eventName, component, eventContext, resourceType, resourceId, metadata } = req.body;
    if (!allowed.has(eventName)) {
      return res.status(400).json({ message: 'Unsupported client event.' });
    }
    await logEvent(req, {
      eventName,
      component,
      eventContext,
      resourceType,
      resourceId,
      metadata,
      description: `${eventName} on ${eventContext || 'learning platform'}`
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    const events = await Event.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(50);
    res.json(events);
  } catch (e) {
    next(e);
  }
});

export default router;
