const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    name: { type: String, default: "Anonymous" },
    role: { type: String, default: "Guest" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true },
    avatarUrl: { type: String },
}, { timestamps: true });

const feedbackModel = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
module.exports = feedbackModel;
