import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.warn('=> MONGODB_URI is not defined. Using Sanctuary Mock Mode.');
}

let isConnected = false;

export async function connectToDB() {
  if (isConnected) return;

  try {
    // Attempt connection but don't let it crash the app if it fails
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, 
    });
    isConnected = true;
    console.log("=> MongoDB connected");
  } catch (error) {
    console.warn("=> MongoDB connection failed (Silent Mode Active). Using Sanctuary Fallback.");
    // We don't throw the error, allowing the app to run in mock mode
  }
}
