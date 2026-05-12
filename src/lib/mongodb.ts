import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.warn('=> MONGODB_URI is not defined.');
}

let isConnected = false;

// Disable buffering so that queries fail instantly if not connected
// This prevents the "Operation timed out" errors you were seeing
mongoose.set('bufferCommands', false);

export async function connectToDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, 
    });
    isConnected = true;
    console.log("=> MongoDB connected");
  } catch (error) {
    console.warn("=> MongoDB connection failed. Project is running in Sanctuary Mode (Local Persistence).");
    isConnected = false;
  }
}
