import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Please define the MONGODB_URI environment variable inside the Vercel dashboard');
  }
  // Fallback for local development if not in .env.local
  // Note: It's better to always require it, but we can fallback to localhost for ease of development
}

const finalUri = MONGODB_URI || "mongodb://localhost:27017/memory-nest";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(finalUri, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
