const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  joinedRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  }],
  googleId: String,
  profilePicture: String,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  role: {
    type: String,
    enum: ["creator", "editor", "admin"],
    default: "creator",
  },
  youtubeTokens: {
    accessToken: String,
    refreshToken: String,
    updatedAt: Date,
  },
  settings: {
    aiAutoSuggest: { type: Boolean, default: true },
    aiThumbnailGen: { type: Boolean, default: true },
    contentModeration: { type: String, default: "medium" },
    defaultStyle: { type: String, default: "modern" },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
  },
  subscription: {
    plan: { type: String, enum: ["free", "pro", "team"], default: "free" },
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    paymentId: { type: String, default: null },
  },
  creatorProfile: {
    channelLink: { type: String, default: "" },
    subscribers: { type: String, default: "" },
    contentNiche: { type: String, default: "" },
    budgetRange: { type: String, default: "" },
    typeOfEditing: { type: String, default: "" },
  },
  editorProfile: {
    skills: [{ type: String }],
    editingStyles: [{ type: String }],
    portfolioLinks: [{ type: String }],
    pricePerVideo: { type: String, default: "" },
  },
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = userModel;
