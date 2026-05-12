require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");
  
  const Video = require('./models/video');
  const result = await Video.updateMany(
    { status: "processing" },
    { $set: { status: "pending", rejectionReason: "Reset from stuck state" } }
  );
  console.log("Reset videos count:", result.modifiedCount);
  process.exit(0);
}
fix();
