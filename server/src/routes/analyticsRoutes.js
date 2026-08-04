import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();
router.get('/overview', protect, adminOnly, async (req, res, next) => { try {
  const [totalUsers, score, commonEvents, recentEvents, activeUsers] = await Promise.all([
    User.countDocuments(), QuizAttempt.aggregate([{ $group: { _id: null, average: { $avg: '$score' } } }]),
    Event.aggregate([{ $group: { _id: '$eventName', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
    Event.find().sort('-createdAt').limit(20).populate('userId', 'name email'),
    Event.distinct('userId', { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);
  res.json({ totalUsers, averageScore: Math.round(score[0]?.average || 0), dailyActiveUsers: activeUsers.length, commonEvents: commonEvents.map((e) => ({ name: e._id, count: e.count })), recentEvents });
} catch (e) { next(e); } });
export default router;
