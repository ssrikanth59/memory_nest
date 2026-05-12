const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://srikanthchauhan2222_db_user:srikanthchauhan2222_db_user@memory-nest.zz9kkww.mongodb.net/memory-nest?appName=memory-nest";

async function testConnection() {
  console.log("Connecting to MongoDB with database name...");
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("MongoDB connected successfully!");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

testConnection();
