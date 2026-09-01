import mongoose from 'mongoose';

export async function connectDatabase() {
  let uri = process.env.MONGODB_URI;

  // Dev fallback: when no MONGODB_URI is configured (or USE_MEMORY_DB=true),
  // boot an in-memory MongoDB and seed it so the app runs with zero setup.
  if (!uri || process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('learnlog');
    await mongoose.connect(uri);
    console.log('Using in-memory MongoDB (dev fallback) — data resets on restart.');
    const { seedDatabase } = await import('../utils/seedData.js');
    await seedDatabase();
    return;
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
