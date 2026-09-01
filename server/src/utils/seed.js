import 'dotenv/config';
import { connectDatabase } from '../config/db.js';
import { seedDatabase } from './seedData.js';

await connectDatabase();
await seedDatabase();
process.exit(0);
