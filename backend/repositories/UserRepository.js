const BaseRepository = require("./BaseRepository");
const userModel = require("../models/user");

class UserRepository extends BaseRepository {
    constructor() {
        super(userModel);
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    async findByIdWithoutPassword(id) {
        return this.model.findById(id).select("-password");
    }

    async findEditorsByCreatorId(creatorId) {
        return this.model.find({
            creatorId,
            role: "editor",
        }).select("name email _id");
    }

    async updateSettings(userId, settings) {
        return this.model.findByIdAndUpdate(
            userId,
            { $set: { settings } },
            { new: true }
        ).select("-password");
    }

    async updateYoutubeTokens(userId, tokens) {
        return this.model.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "youtubeTokens.accessToken": tokens.accessToken,
                    "youtubeTokens.refreshToken": tokens.refreshToken,
                    "youtubeTokens.updatedAt": new Date(),
                },
            },
            { new: true }
        );
    }

    async updateSubscription(userId, subscriptionData) {
        return this.model.findByIdAndUpdate(
            userId,
            { $set: { subscription: subscriptionData } },
            { new: true }
        );
    }

    async addRoomToUser(userId, roomId) {
        return this.model.findByIdAndUpdate(userId, {
            $addToSet: { joinedRooms: roomId },
        });
    }

    async unlinkEditor(editorId) {
        return this.model.findByIdAndUpdate(editorId, {
            $set: { creatorId: null },
        });
    }
}

module.exports = new UserRepository();
