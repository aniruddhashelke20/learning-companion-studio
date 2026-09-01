import mongoose from 'mongoose';

// --- LCM (Learner-Centric MOOC) pedagogic component schemas ---

// LeD (Learning Dialogue): reflection spots that punctuate the concept video/text.
const reflectionSpotSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  hint: String
}, { _id: true });

// LbD (Learning by Doing): MCQs where every option carries authored feedback.
const lbdOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  feedback: { type: String, default: '' }
}, { _id: false });

const lbdQuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: { type: [lbdOptionSchema], default: [] },
  answer: { type: Number, default: 0 }
}, { _id: true });

// LbD subjective: open prompt with an author-written exemplar response.
const subjectivePromptSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  exemplar: { type: String, default: '' }
}, { _id: true });

// LxT (Learning Extension Trajectories): curated resource pathways.
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  kind: { type: String, enum: ['article', 'video', 'worksheet', 'tool', 'other'], default: 'article' },
  note: String
}, { _id: true });

// LxI (Learner Experience Interaction): focus prompts for peer discussion.
const discussionPromptSchema = new mongoose.Schema({
  title: { type: String, default: 'Discussion focus' },
  prompt: { type: String, required: true }
}, { _id: true });

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: String,
  content: { type: String, required: true },
  videoUrl: String,
  durationMinutes: { type: Number, default: 10 },
  order: { type: Number, required: true },
  reflectionSpots: { type: [reflectionSpotSchema], default: [] },
  lbdQuestions: { type: [lbdQuestionSchema], default: [] },
  subjectivePrompts: { type: [subjectivePromptSchema], default: [] },
  resources: { type: [resourceSchema], default: [] },
  discussionPrompts: { type: [discussionPromptSchema], default: [] }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  level: { type: String, default: 'Beginner' },
  accent: { type: String, default: 'blue' },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  lessons: [lessonSchema],
  quizzes: [{ lessonId: mongoose.Schema.Types.ObjectId, questions: [{ prompt: String, options: [String], answer: Number }] }]
}, { timestamps: true });
export default mongoose.model('Course', courseSchema);
