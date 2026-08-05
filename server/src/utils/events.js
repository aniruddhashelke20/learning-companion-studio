import Event from '../models/Event.js';

export async function logEvent(req, event) {
  // Extract client's IP address robustly
  let ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                  req.ip || 
                  req.socket.remoteAddress || 
                  '127.0.0.1';
  
  // Normalize local IPv6 loopback to IPv4
  if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
    ipAddress = '127.0.0.1';
  }

  // 1. Log event in MongoDB database
  const createdEvent = await Event.create({
    userId: req.user?._id,
    ipAddress,
    origin: 'web',
    ...event
  });

  // 2. Stream to Google Sheet Webhook asynchronously if configured
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    const payload = {
      timestamp: createdEvent.createdAt ? createdEvent.createdAt.toISOString() : new Date().toISOString(),
      eventId: String(createdEvent._id),
      userId: String(createdEvent.userId || ''),
      userName: req.user?.name || 'Unknown',
      userEmail: req.user?.email || 'Unknown',
      eventName: createdEvent.eventName,
      component: createdEvent.component,
      eventContext: createdEvent.eventContext,
      origin: createdEvent.origin,
      ipAddress: createdEvent.ipAddress,
      description: createdEvent.description,
      resourceType: createdEvent.resourceType || '',
      resourceId: createdEvent.resourceId || '',
      metadata: JSON.stringify(createdEvent.metadata || {})
    };

    // Non-blocking fire-and-forget post request
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch((err) => {
      console.error('Google Sheet Webhook logging error:', err.message);
    });
  }

  return createdEvent;
}
