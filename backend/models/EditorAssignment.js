const mongoose = require("mongoose");

const editorAssignmentSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  editorEmail: {
    type: String,
    required: true,
  },
  editorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: {
    type: String,
    enum: ["invited", "accepted", "rejected"],
    default: "invited",
  },
  inviteToken: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("EditorAssignment", editorAssignmentSchema);
