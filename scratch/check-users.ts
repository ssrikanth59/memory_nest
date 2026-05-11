import mongoose from 'mongoose';
import { User } from './src/lib/models/User';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/memory-nest";

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const users = await User.find({}, { password: 0 });
    console.log('Users found:', users);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
