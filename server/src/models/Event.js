import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventName: { type: String, required: true, index: true },
  component: { type: String, default: 'System' },
  eventContext: { type: String, default: 'Learning platform' },
  origin: { type: String, default: 'web' },
  description: String,
  resourceType: String,
  resourceId: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: String
}, { timestamps: true });
eventSchema.index({ createdAt: -1 });
export default mongoose.model('Event', eventSchema);
