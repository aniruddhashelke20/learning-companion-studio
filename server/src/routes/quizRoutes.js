import express from 'express';
import Course from '../models/Course.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect } from '../middleware/auth.js';
import { logEvent } from '../utils/events.js';
const router = express.Router();
router.get('/:courseId/:lessonId', protect, async (req, res, next) => { try {
  const course = await Course.findById(req.params.courseId); const quiz = course?.quizzes.find((q) => String(q.lessonId) === req.params.lessonId);
  if (!quiz) return res.status(404).json({ message: 'No quiz exists for this lesson.' });
  await logEvent(req, { eventName: 'QUIZ_STARTED', component: 'Quiz', eventContext: course.title, resourceType: 'quiz', resourceId: String(quiz._id), description: `Quiz started for ${course.title}` });
  res.json({ id: quiz._id, courseTitle: course.title, questions: quiz.questions.map((q) => ({ id: q._id, prompt: q.prompt, options: q.options })) });
} catch (e) { next(e); } });
router.post('/:courseId/:lessonId/submit', protect, async (req, res, next) => { try {
  const course = await Course.findById(req.params.courseId); const quiz = course?.quizzes.find((q) => String(q.lessonId) === req.params.lessonId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
  const answers = quiz.questions.map((question) => { const selected = req.body.answers?.[question._id]; return { questionId: question._id, selected, correct: Number(selected) === question.answer }; });
  const correct = answers.filter((a) => a.correct).length; const score = Math.round((correct / quiz.questions.length) * 100);
  const attempt = await QuizAttempt.create({ userId: req.user._id, courseId: course._id, lessonId: req.params.lessonId, answers, score, totalQuestions: quiz.questions.length });
  await logEvent(req, { eventName: 'QUIZ_SUBMITTED', component: 'Quiz', eventContext: course.title, resourceType: 'quiz_attempt', resourceId: attempt.id, metadata: { score }, description: `Quiz submitted with score ${score}%` });
  res.status(201).json({ score, correct, total: quiz.questions.length, attemptId: attempt.id });
} catch (e) { next(e); } });
export default router;
