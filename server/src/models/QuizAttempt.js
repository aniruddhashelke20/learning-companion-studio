import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  score: { type: Number, required: true },
  correct: { type: Number, required: true },
  total: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
