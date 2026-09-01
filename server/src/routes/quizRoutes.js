import express from 'express';
import Course from '../models/Course.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect } from '../middleware/auth.js';
import { logEvent } from '../utils/events.js';

const router = express.Router();

const findQuiz = async (courseId, lessonId) => {
  const course = await Course.findById(courseId);
  if (!course) return {};
  const quiz = course.quizzes.find((q) => String(q.lessonId) === lessonId);
  return { course, quiz };
};

router.get('/:courseId/:lessonId', protect, async (req, res, next) => {
  try {
    const { course, quiz } = await findQuiz(req.params.courseId, req.params.lessonId);
    if (!quiz || !quiz.questions.length) return res.status(404).json({ message: 'This lesson does not have a quiz yet.' });
    await logEvent(req, { eventName: 'QUIZ_STARTED', component: 'Quiz', eventContext: course.title, resourceType: 'quiz', resourceId: String(quiz.lessonId), description: `Quiz started for course: ${course.title}` });
    res.json({
      id: String(quiz.lessonId),
      courseTitle: course.title,
      questions: quiz.questions.map((q) => ({ id: String(q._id), prompt: q.prompt, options: q.options }))
    });
  } catch (e) { next(e); }
});

router.post('/:courseId/:lessonId/submit', protect, async (req, res, next) => {
  try {
    const { course, quiz } = await findQuiz(req.params.courseId, req.params.lessonId);
    if (!quiz || !quiz.questions.length) return res.status(404).json({ message: 'This lesson does not have a quiz yet.' });
    const submitted = req.body.answers || {};
    const answers = quiz.questions.map((q) => {
      const selected = submitted[String(q._id)];
      return { questionId: String(q._id), selected, correct: selected === q.answer };
    });
    const correct = answers.filter((a) => a.correct).length;
    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);
    await QuizAttempt.create({ userId: req.user._id, courseId: course._id, lessonId: quiz.lessonId, score, correct, total });
    const attempt = await logEvent(req, { eventName: 'QUIZ_SUBMITTED', component: 'Quiz', eventContext: course.title, resourceType: 'quiz_attempt', resourceId: String(quiz.lessonId), description: `Quiz submitted for course: ${course.title}`, metadata: { score, correct, total } });
    res.json({
      score, correct, total,
      attemptId: String(attempt._id),
      answers,
      correctAnswers: quiz.questions.map((q) => ({ questionId: String(q._id), answer: q.answer }))
    });
  } catch (e) { next(e); }
});

export default router;
