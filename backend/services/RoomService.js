const crypto = require("crypto");
const RoomRepository = require("../repositories/RoomRepository");
const UserRepository = require("../repositories/UserRepository");

class RoomService {
    constructor(roomRepository, userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    async createRoom(userId, name) {
        if (!name) {
            throw { status: 400, message: "Room name is required" };
        }

        const inviteToken = crypto.randomBytes(16).toString("hex");

        const room = await this.roomRepository.create({
            name,
            ownerId: userId,
            inviteToken,
            members: [],
        });

        await this.userRepository.addRoomToUser(userId, room._id);

        return room;
    }

    async verifyInviteToken(token) {
        const room = await this.roomRepository.findByInviteToken(token);
        if (!room) {
            throw { status: 404, message: "Invalid invite link" };
        }

        return {
            valid: true,
            roomName: room.name,
            ownerName: room.ownerId.name,
            ownerEmail: room.ownerId.email,
            roomId: room._id,
        };
    }

    async listUserRooms(userId) {
        const ownedRooms = await this.roomRepository.findOwnedRooms(userId);
        const joinedRooms = await this.roomRepository.findJoinedRooms(userId);

        const allRooms = [...ownedRooms, ...joinedRooms].reduce((acc, current) => {
            const exists = acc.find(
                (item) => item._id.toString() === current._id.toString()
            );
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, []);

        return allRooms;
    }

    async joinRoom(userId, token) {
        const room = await this.roomRepository.findOne({ inviteToken: token });
        if (!room) {
            throw { status: 404, message: "Invalid invite link" };
        }

        const isMember = room.members.some(
            (m) => m.userId.toString() === userId
        );
        const isOwner = room.ownerId.toString() === userId;

        if (isMember || isOwner) {
            return { message: "Already a member", room };
        }

        await this.roomRepository.addMember(room._id, userId);
        await this.userRepository.addRoomToUser(userId, room._id);

        return { message: "Joined room successfully", room };
    }

    async getRoomDetails(roomId, userId) {
        const room = await this.roomRepository.findByIdWithMembers(roomId);
        if (!room) {
            throw { status: 404, message: "Room not found" };
        }

        const isMember = room.members.some(
            (m) => m.userId.toString() === userId
        );
        const isOwner = room.ownerId.toString() === userId;

        if (!isMember && !isOwner) {
            throw { status: 403, message: "Access denied" };
        }

        return room;
    }
}

module.exports = new RoomService(RoomRepository, UserRepository);
