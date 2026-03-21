const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  fileUrl: String,
  title: String,
  description: String,
  thumbnailUrl: String,

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  editorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "uploaded", "processing", "upload_failed", "raw_uploaded", "raw_rejected", "editing_in_progress", "ai_processing"],
    default: "pending",
  },
  rejectionReason: String,

  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  rawFileUrl: String,
  hasRawVideo: { type: Boolean, default: false },
  editorReviewStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  editorRejectionReason: String,

  comments: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    isAI: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],

  editSettings: {
    brightness: { type: Number, default: 100 },
    contrast: { type: Number, default: 100 },
    saturation: { type: Number, default: 100 },
    grayscale: { type: Number, default: 0 },
    sepia: { type: Number, default: 0 },
    trimStart: { type: Number, default: 0 },
    trimEnd: { type: Number, default: 0 },
  },

  aiProgress: {
    percent: { type: Number, default: 0 },
    message: { type: String, default: "" }
  }
}, { timestamps: true });

const videoModel = mongoose.models.Video || mongoose.model("Video", videoSchema);
module.exports = videoModel;


// raw_uploaded → editing_in_progress → pending → processing → uploaded
//                                           ↓
//                                       rejected