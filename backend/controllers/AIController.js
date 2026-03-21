const BaseController = require("./BaseController");
const AIService = require("../services/AIService");

class AIController extends BaseController {
    constructor(aiService) {
        super();
        this.aiService = aiService;
    }

    async generateTitles(req, res) {
        try {
            const { keywords } = req.body;
            if (!keywords) {
                throw { status: 400, message: "Keywords required" };
            }
            const result = await this.aiService.generateTitles(keywords);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async generateThumbnails(req, res) {
        try {
            const { topic } = req.body;
            if (!topic) {
                throw { status: 400, message: "Topic required" };
            }
            const thumbnails = await this.aiService.generateThumbnails(topic);
            return this.success(res, { thumbnails });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async analyzeScore(req, res) {
        try {
            const { title, description } = req.body;
            const score = this.aiService.analyzeScore(title, description);
            return this.success(res, { score });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async chat(req, res) {
        try {
            const { messages } = req.body;
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                return this.badRequest(res, "Messages array is required");
            }
            const reply = await this.aiService.chat(messages);
            return this.success(res, { reply });
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new AIController(AIService);
