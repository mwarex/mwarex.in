const BaseController = require("./BaseController");
const RoomService = require("../services/RoomService");

class RoomController extends BaseController {
    constructor(roomService) {
        super();
        this.roomService = roomService;
    }

    async create(req, res) {
        try {
            const room = await this.roomService.createRoom(req.userId, req.body.name);
            return this.success(res, room);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async verifyToken(req, res) {
        try {
            const result = await this.roomService.verifyInviteToken(req.params.token);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async list(req, res) {
        try {
            const rooms = await this.roomService.listUserRooms(req.userId);
            return this.success(res, rooms);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async join(req, res) {
        try {
            const result = await this.roomService.joinRoom(req.userId, req.body.token);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getDetails(req, res) {
        try {
            const room = await this.roomService.getRoomDetails(req.params.id, req.userId);
            return this.success(res, room);
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new RoomController(RoomService);
