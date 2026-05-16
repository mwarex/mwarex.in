const BaseRepository = require("./BaseRepository");
const roomModel = require("../models/Room");

class RoomRepository extends BaseRepository {
    constructor() {
        super(roomModel);
    }

    async findByInviteToken(token) {
        return this.model.findOne({ inviteToken: token }).populate("ownerId", "name email");
    }

    async findByIdWithMembers(roomId) {
        return this.model
            .findById(roomId)
            .populate("ownerId", "name email")
            .populate("members.userId", "name email");
    }

    async findOwnedRooms(userId) {
        return this.model.find({ ownerId: userId });
    }

    async findJoinedRooms(userId) {
        return this.model.find({ "members.userId": userId });
    }

    async addMember(roomId, userId, role = "editor") {
        const room = await this.model.findById(roomId);
        if (!room) return null;

        room.members.push({ userId, role });
        await room.save();
        return room;
    }
}

module.exports = new RoomRepository();
