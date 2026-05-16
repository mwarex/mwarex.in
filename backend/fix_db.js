const { connectDB } = require("./db");
const mongoose = require("mongoose");
const Video = require("./models/video");
const dotenv = require("dotenv");
dotenv.config();

async function fix() {
  await connectDB();
  
  // FIX: Reset any "ai_processing" stuck videos
  const aiRes = await Video.updateMany(
    { status: "ai_processing" },
    { $set: { status: "raw_uploaded" } }
  );
  console.log(`Reset ${aiRes.modifiedCount} stuck AI videos.`);

  // FIX: Reset any "processing" (YouTube Uploading) stuck videos back to "approved"
  const ytRes = await Video.updateMany(
    { status: "processing" },
    { $set: { status: "approved" } }
  );
  console.log(`Reset ${ytRes.modifiedCount} stuck YouTube videos.`);
  
  mongoose.disconnect();
}
fix();
