const BaseController = require("./BaseController");
const FeedbackService = require("../services/FeedbackService");

class FeedbackController extends BaseController {
    constructor(feedbackService) {
        super();
        this.feedbackService = feedbackService;
    }

    async addFeedback(req, res) {
        try {
            const feedback = await this.feedbackService.addFeedback({
                name: req.body.name,
                role: req.body.role,
                rating: req.body.rating,
                message: req.body.message,
                avatarUrl: req.body.avatarUrl,
            });
            return this.success(res, { message: "Feedback submitted successfully", feedback });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getFeedbacks(req, res) {
        try {
            const feedbacks = await this.feedbackService.getFeedbacks();
            return this.success(res, feedbacks);
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new FeedbackController(FeedbackService);
