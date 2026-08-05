import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { logEvent } from '../utils/events.js';
const router = express.Router();
const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

router.post('/register', async (req, res, next) => { try {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, and an 8-character password are required.' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, passwordHash: await User.hashPassword(password) });
  req.user = user; await logEvent(req, { eventName: 'USER_REGISTERED', component: 'System', description: `User ${user.email} registered`, metadata: { email: user.email, name: user.name, userAgent: req.headers['user-agent'] } });
  res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
} catch (error) { next(error); } });
router.post('/login', async (req, res, next) => { try {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(req.body.password || ''))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  req.user = user; await logEvent(req, { eventName: 'USER_LOGGED_IN', component: 'System', description: `User ${user.email} logged in`, metadata: { email: user.email, userAgent: req.headers['user-agent'] } });
  res.json({ token: tokenFor(user), user: safeUser(user) });
} catch (error) { next(error); } });
router.get('/me', protect, (req, res) => res.json({ user: safeUser(req.user) }));
export default router;
