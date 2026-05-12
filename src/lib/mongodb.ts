import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  throw new Error('Please define the MONGODB_URI environment variable inside the Vercel dashboard');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
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
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      socketTimeoutMS: 45000,
    };

    const uri = MONGODB_URI || "mongodb://localhost:27017/memory-nest";

    console.log(`📡 Connecting to MongoDB... ${uri.startsWith('mongodb+srv') ? ' (Atlas Cluster)' : '(Local/Other)'}`);

    cached.promise = mongoose.connect(uri, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully to", mongoose.connection.name);
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error.message);
        
        // Provide helpful tips for common Atlas errors
        if (error.message.includes('authentication failed')) {
          console.error("💡 TIP: Your MONGODB_URI username or password appears to be incorrect.");
        } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
          console.error("💡 TIP: Check your network connection and ensure your IP is whitelisted in MongoDB Atlas.");
        }
        
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise so it can retry next time
    throw e;
  }
  
  return cached.conn;
}

