import express from 'express';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';
import { logEvent } from '../utils/events.js';
const router = express.Router();
router.get('/', protect, async (req, res, next) => { try { const courses = await Course.find().select('title description category level accent lessons.title lessons.durationMinutes'); res.json(courses); } catch (e) { next(e); } });
router.get('/:courseId', protect, async (req, res, next) => { try { const course = await Course.findById(req.params.courseId); if (!course) return res.status(404).json({ message: 'Course not found.' }); await logEvent(req, { eventName: 'COURSE_VIEWED', component: 'Course', eventContext: course.title, resourceType: 'course', resourceId: course.id, description: `Course viewed: ${course.title}` }); res.json(course); } catch (e) { next(e); } });
router.get('/:courseId/lessons/:lessonId', protect, async (req, res, next) => { try { const course = await Course.findById(req.params.courseId); const lesson = course?.lessons.id(req.params.lessonId); if (!lesson) return res.status(404).json({ message: 'Lesson not found.' }); await logEvent(req, { eventName: 'COURSE_MODULE_VIEWED', component: 'Lesson', eventContext: course.title, resourceType: 'lesson', resourceId: lesson.id, description: `Lesson viewed: ${lesson.title}` }); res.json({ course: { id: course.id, title: course.title }, lesson }); } catch (e) { next(e); } });
export default router;
