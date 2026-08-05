import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();

router.get('/overview', protect, adminOnly, async (req, res, next) => {
  try {
    const [totalUsers, score, commonEvents, recentEvents, activeUsers] = await Promise.all([
      User.countDocuments(),
      QuizAttempt.aggregate([{ $group: { _id: null, average: { $avg: '$score' } } }]),
      Event.aggregate([
        { $group: { _id: '$eventName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Event.find().sort('-createdAt').limit(50).populate('userId', 'name email'),
      Event.distinct('userId', { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    res.json({
      totalUsers,
      averageScore: Math.round(score[0]?.average || 0),
      dailyActiveUsers: activeUsers.length,
      commonEvents: commonEvents.map((e) => ({ name: e._id, count: e.count })),
      recentEvents
    });
  } catch (e) {
    next(e);
  }
});

router.get('/export', protect, adminOnly, async (req, res, next) => {
  try {
    const events = await Event.find().sort('-createdAt').populate('userId', 'name email');
    let csv = 'Timestamp,Event ID,User ID,User Name,User Email,Event Name,Component,Event Context,Origin,Description,Resource Type,Resource ID\n';
    
    for (const e of events) {
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };
      
      csv += `${escape(e.createdAt?.toISOString())},${escape(e._id)},${escape(e.userId?._id)},${escape(e.userId?.name)},${escape(e.userId?.email)},${escape(e.eventName)},${escape(e.component)},${escape(e.eventContext)},${escape(e.origin)},${escape(e.description)},${escape(e.resourceType)},${escape(e.resourceId)}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=clickstream_export_${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (e) {
    next(e);
  }
});

export default router;
