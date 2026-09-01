import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['learner', 'author', 'admin'], default: 'learner' }
}, { timestamps: true });

userSchema.methods.verifyPassword = function (password) { return bcrypt.compare(password, this.passwordHash); };
userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);
export default mongoose.model('User', userSchema);
