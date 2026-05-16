const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    editingStyle: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["Open", "Assigned", "Completed"],
        default: "Open",
    },
    assignedEditorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const projectModel = mongoose.models.Project || mongoose.model("Project", projectSchema);
module.exports = projectModel;
