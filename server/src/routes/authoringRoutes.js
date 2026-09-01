import express from 'express';
import Course from '../models/Course.js';
import { protect, authorOnly } from '../middleware/auth.js';
import { logEvent } from '../utils/events.js';

const router = express.Router();
router.use(protect, authorOnly);

const LESSON_FIELDS = ['title', 'summary', 'content', 'videoUrl', 'durationMinutes', 'order',
  'reflectionSpots', 'lbdQuestions', 'subjectivePrompts', 'resources', 'discussionPrompts'];
const COURSE_FIELDS = ['title', 'description', 'category', 'level', 'accent', 'status'];

const pick = (body, fields) => fields.reduce((acc, f) => {
  if (body[f] !== undefined) acc[f] = body[f];
  return acc;
}, {});

// List every course (drafts included) for the authoring desk.
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find().sort('-updatedAt');
    res.json(courses);
  } catch (e) { next(e); }
});

router.get('/courses/:courseId', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json(course);
  } catch (e) { next(e); }
});

router.post('/courses', async (req, res, next) => {
  try {
    const course = await Course.create({ ...pick(req.body, COURSE_FIELDS), lessons: [], quizzes: [] });
    await logEvent(req, { eventName: 'AUTHOR_COURSE_CREATED', component: 'AuthoringDesk', eventContext: course.title, resourceType: 'course', resourceId: course.id, description: `Course created: ${course.title}` });
    res.status(201).json(course);
  } catch (e) { next(e); }
});

router.put('/courses/:courseId', async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.courseId, pick(req.body, COURSE_FIELDS), { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    await logEvent(req, { eventName: 'AUTHOR_COURSE_UPDATED', component: 'AuthoringDesk', eventContext: course.title, resourceType: 'course', resourceId: course.id, description: `Course updated: ${course.title}`, metadata: { status: course.status } });
    res.json(course);
  } catch (e) { next(e); }
});

router.delete('/courses/:courseId', async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    await logEvent(req, { eventName: 'AUTHOR_COURSE_DELETED', component: 'AuthoringDesk', eventContext: course.title, resourceType: 'course', resourceId: course.id, description: `Course deleted: ${course.title}` });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/courses/:courseId/lessons', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    const payload = pick(req.body, LESSON_FIELDS);
    if (payload.order === undefined) payload.order = course.lessons.length + 1;
    course.lessons.push(payload);
    await course.save();
    const lesson = course.lessons[course.lessons.length - 1];
    await logEvent(req, { eventName: 'AUTHOR_LESSON_CREATED', component: 'AuthoringDesk', eventContext: course.title, resourceType: 'lesson', resourceId: lesson.id, description: `Lesson created: ${lesson.title}` });
    res.status(201).json(course);
  } catch (e) { next(e); }
});

router.put('/courses/:courseId/lessons/:lessonId', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const lesson = course?.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    Object.assign(lesson, pick(req.body, LESSON_FIELDS));
    await course.save();
    await logEvent(req, { eventName: 'AUTHOR_LESSON_UPDATED', component: 'AuthoringDesk', eventContext: course.title, resourceType: 'lesson', resourceId: lesson.id, description: `Lesson updated: ${lesson.title}`, metadata: { lcm: { reflectionSpots: lesson.reflectionSpots.length, lbdQuestions: lesson.lbdQuestions.length, subjectivePrompts: lesson.subjectivePrompts.length, resources: lesson.resources.length, discussionPrompts: lesson.discussionPrompts.length } } });
    res.json(course);
  } catch (e) { next(e); }
});

router.delete('/courses/:courseId/lessons/:lessonId', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const lesson = course?.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    const title = lesson.title;
    lesson.deleteOne();
    course.quizzes = course.quizzes.filter((q) => String(q.lessonId) !== req.params.lessonId);
    await course.save();
    await logEvent(req, { eventName: 'AUTHOR_LESSON_DELETED', component: 'AuthoringDesk', eventContext: course.title, resourceType: 'lesson', resourceId: req.params.lessonId, description: `Lesson deleted: ${title}` });
    res.json(course);
  } catch (e) { next(e); }
});

// Replace the review-quiz questions attached to a lesson.
router.put('/courses/:courseId/quizzes/:lessonId', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    const questions = Array.isArray(req.body.questions) ? req.body.questions : [];
    const existing = course.quizzes.find((q) => String(q.lessonId) === req.params.lessonId);
    if (existing) existing.questions = questions;
    else course.quizzes.push({ lessonId: req.params.lessonId, questions });
    await course.save();
    await logEvent(req, { eventName: 'AUTHOR_QUIZ_UPDATED', component: 'AuthoringDesk', eventContext: course.title, resourceType: 'quiz', resourceId: req.params.lessonId, description: `Quiz updated for course: ${course.title}`, metadata: { questionCount: questions.length } });
    res.json(course);
  } catch (e) { next(e); }
});

export default router;
