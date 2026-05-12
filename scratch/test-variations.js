const mongoose = require('mongoose');

const variations = [
  "mongodb+srv://srikanthchauhan2222:srikanthchauhan2222@memory-nest.zz9kkww.mongodb.net/memory-nest?appName=memory-nest",
  "mongodb+srv://srikanthchauhan2222:srikanthchauhan2222_db_user@memory-nest.zz9kkww.mongodb.net/memory-nest?appName=memory-nest",
  "mongodb+srv://srikanthchauhan2222_db_user:srikanthchauhan2222@memory-nest.zz9kkww.mongodb.net/memory-nest?appName=memory-nest",
];

async function testVariations() {
  for (const uri of variations) {
    console.log(`Testing: ${uri.split('@')[0]}...`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log("SUCCESS with URI:", uri);
      process.exit(0);
    } catch (e) {
      console.log("FAILED:", e.message);
    }
  }
  process.exit(1);
}

testVariations();
