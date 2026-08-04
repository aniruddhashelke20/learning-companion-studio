import Event from '../models/Event.js';

export function logEvent(req, event) {
  return Event.create({ userId: req.user._id, ipAddress: req.ip, origin: 'web', ...event });
}
