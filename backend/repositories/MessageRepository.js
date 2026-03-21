const Message = require("../models/Message");

class MessageRepository {
    async create(messageData) {
        return await Message.create(messageData);
    }

    async findByApplication(applicationId) {
        return await Message.find({ applicationId })
            .populate("senderId", "name email")
            .sort({ timestamp: 1 });
    }
}

module.exports = new MessageRepository();
