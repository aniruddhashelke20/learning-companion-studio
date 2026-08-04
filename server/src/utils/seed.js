import 'dotenv/config';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

await connectDatabase();
await Promise.all([User.deleteMany(), Course.deleteMany()]);
const admin = await User.create({ name: 'Platform Admin', email: 'admin@learnlog.local', passwordHash: await User.hashPassword('AdminPass123!'), role: 'admin' });
const learner = await User.create({ name: 'Harvey Learner', email: 'harvey@learnlog.local', passwordHash: await User.hashPassword('LearnerPass123!') });
const course = await Course.create({ title: 'Introduction to Machine Learning', description: 'Build a confident foundation in the concepts behind modern machine learning.', category: 'Data Science', level: 'Beginner', accent: 'indigo', lessons: [
  { title: 'What is Machine Learning?', summary: 'The key idea: learn patterns from examples.', content: 'Machine learning is a way to build systems that improve their predictions by finding patterns in data. Instead of writing a fixed rule for every situation, we show a model examples and evaluate how well it generalises to new data.', durationMinutes: 12, order: 1 },
  { title: 'Supervised Learning', summary: 'Learning with labelled examples.', content: 'In supervised learning, every training example includes an input and the correct answer. A spam filter learns from emails that have already been labelled spam or not spam. Classification predicts categories; regression predicts numeric values.', durationMinutes: 16, order: 2 },
  { title: 'Measuring Model Quality', summary: 'Use metrics that match the problem.', content: 'Accuracy is useful when classes are balanced. Precision, recall and F1 score tell a richer story when errors have different costs. Always evaluate with data that was not used to train the model.', durationMinutes: 14, order: 3 }
] });
course.quizzes = [{ lessonId: course.lessons[1]._id, questions: [
  { prompt: 'What distinguishes supervised learning?', options: ['It has labelled examples', 'It never uses data', 'It only predicts images', 'It has no evaluation'], answer: 0 },
  { prompt: 'Which task predicts a numeric value?', options: ['Classification', 'Regression', 'Clustering', 'Ranking'], answer: 1 },
  { prompt: 'Why use held-out data?', options: ['To make training slower', 'To test generalisation', 'To remove labels', 'To increase file size'], answer: 1 }
] }]; await course.save();
console.log(`Seeded ${admin.email} and ${learner.email}`); process.exit(0);
