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

    async analyzeVideo(req, res) {
        try {
            const { videoUrl, title, description, videoId } = req.body;
            if (!videoUrl) {
                throw { status: 400, message: "Video URL required" };
            }
            
            const result = await this.aiService.analyzeVideo(videoUrl, title, description, videoId, req.io);
            return this.success(res, result);
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
    async fetchTrends(req, res) {
        try {
            const { niche } = req.body;
            if (!niche) {
                return this.badRequest(res, "Niche is required");
            }
            const trends = await this.aiService.fetchTrends(niche);
            return this.success(res, { trends });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async analyzeCompetitor(req, res) {
        try {
            const { youtubeUrl } = req.body;
            if (!youtubeUrl) return this.badRequest(res, "YouTube URL is required");
            const analysis = await this.aiService.analyzeCompetitor(youtubeUrl);
            return this.success(res, { analysis });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async generateScript(req, res) {
        try {
            const { title, hook } = req.body;
            if (!title || !hook) return this.badRequest(res, "Title and hook are required");
            const script = await this.aiService.generateScript(title, hook);
            return this.success(res, { script });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async generateHashtags(req, res) {
        try {
            const { topic } = req.body;
            if (!topic) return this.badRequest(res, "Topic is required");
            const hashtags = await this.aiService.generateHashtags(topic);
            return this.success(res, { hashtags });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async findSponsors(req, res) {
        try {
            const { niche } = req.body;
            if (!niche) return this.badRequest(res, "Niche is required");
            const sponsors = await this.aiService.findSponsors(niche);
            return this.success(res, { sponsors });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async generateVoiceover(req, res) {
        try {
            const { text } = req.body;
            if (!text) return this.badRequest(res, "Text is required");
            const audioData = await this.aiService.generateVoiceover(text);
            return this.success(res, { audioData });
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new AIController(AIService);
