const FeedbackRepository = require("../repositories/FeedbackRepository");

class FeedbackService {
    constructor(feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    async addFeedback({ name, role, rating, message, avatarUrl }) {
        return this.feedbackRepository.create({
            name: name || "Anonymous",
            role: role || "Guest",
            rating,
            message,
            avatarUrl,
        });
    }

    async getFeedbacks() {
        return this.feedbackRepository.model.find({}, "-__v").sort({ createdAt: -1 });
    }
}

module.exports = new FeedbackService(FeedbackRepository);
