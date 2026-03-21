const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    editorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    pitchMessage: {
        type: String,
        required: true,
    },
    expectedPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
});

const applicationModel = mongoose.models.Application || mongoose.model("Application", applicationSchema);
module.exports = applicationModel;
