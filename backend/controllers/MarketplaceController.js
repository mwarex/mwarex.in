const BaseController = require("./BaseController");
const MarketplaceService = require("../services/MarketplaceService");

class MarketplaceController extends BaseController {
    constructor(marketplaceService) {
        super();
        this.marketplaceService = marketplaceService;
    }

    async createProject(req, res) {
        try {
            const project = await this.marketplaceService.createProject(req.userId, req.body);
            return this.success(res, project);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getMarketplaceProjects(req, res) {
        try {
            // Can pass query filters if any from frontend
            const projects = await this.marketplaceService.getMarketplaceProjects(req.query);
            return this.success(res, projects);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getCreatorProjects(req, res) {
        try {
            const projects = await this.marketplaceService.getCreatorProjects(req.userId);
            return this.success(res, projects);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async applyToProject(req, res) {
        try {
            const application = await this.marketplaceService.applyToProject(req.userId, req.params.projectId, req.body);
            return this.success(res, application);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getProjectApplications(req, res) {
        try {
            const applications = await this.marketplaceService.getProjectApplications(req.userId, req.params.projectId);
            return this.success(res, applications);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async acceptApplication(req, res) {
        try {
            const result = await this.marketplaceService.acceptApplication(req.userId, req.params.applicationId);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getApplicationMessages(req, res) {
        try {
            const messages = await this.marketplaceService.getApplicationMessages(req.userId, req.params.applicationId);
            return this.success(res, messages);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async sendMessage(req, res) {
        try {
            const { content } = req.body;
            if (!content) return res.status(400).json({ message: "Content is required" });
            const message = await this.marketplaceService.sendMessage(req.userId, req.params.applicationId, content);
            return this.success(res, message);
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new MarketplaceController(MarketplaceService);
