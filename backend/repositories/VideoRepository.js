const BaseRepository = require("./BaseRepository");
const videoModel = require("../models/video");

class VideoRepository extends BaseRepository {
    constructor() {
        super(videoModel);
    }

    async findWithFilter(filter, sortBy = { createdAt: -1 }) {
        return this.model.find(filter).sort(sortBy).populate("editorId", "name email");
    }

    async findByIdPopulated(id) {
        return this.model
            .findById(id)
            .populate("comments.senderId", "name email")
            .populate("editorId", "name")
            .populate("creatorId", "name");
    }

    async updateThumbnail(videoId, thumbnailUrl) {
        return this.model.findByIdAndUpdate(
            videoId,
            { thumbnailUrl },
            { new: true }
        );
    }

    async updateEditSettings(videoId, editSettings) {
        return this.model.findByIdAndUpdate(
            videoId,
            { editSettings },
            { new: true }
        );
    }

    async addComment(videoId, senderId, text, isAI = false) {
        const video = await this.model.findById(videoId);
        if (!video) return null;

        video.comments.push({ senderId, text, isAI, createdAt: new Date() });
        await video.save();

        return this.model
            .findById(videoId)
            .populate("comments.senderId", "name email");
    }
}

module.exports = new VideoRepository();
