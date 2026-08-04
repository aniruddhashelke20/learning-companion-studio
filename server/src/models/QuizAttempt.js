import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answers: [{ questionId: String, selected: Number, correct: Boolean }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true }
}, { timestamps: true });
export default mongoose.model('QuizAttempt', quizAttemptSchema);
