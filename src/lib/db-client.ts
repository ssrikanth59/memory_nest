import { connectToDB } from './mongodb';

// This is a "Perfect" fallback system. 
// If MongoDB is available, it uses it. 
// If not (e.g. bad credentials), it switches to a Mock system that works in the browser.

export async function safeConnect() {
  try {
    await connectToDB();
    return { success: true, mode: 'mongodb' };
  } catch (error) {
    console.warn("⚠️ Falling back to Mock Database due to connection error:", (error as any).message);
    return { success: true, mode: 'mock' };
  }
}
