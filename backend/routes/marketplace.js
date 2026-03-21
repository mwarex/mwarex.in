const express = require("express");
const marketplaceController = require("../controllers/MarketplaceController");
const userMiddleware = require("../middlewares/userMiddleware");

const router = express.Router();

// Middleware to ensure user is logged in
router.use(userMiddleware);

// Creator routes
router.post("/projects", (req, res) => marketplaceController.createProject(req, res));
router.get("/projects/my", (req, res) => marketplaceController.getCreatorProjects(req, res));
router.get("/projects/:projectId/applications", (req, res) => marketplaceController.getProjectApplications(req, res));
router.post("/applications/:applicationId/accept", (req, res) => marketplaceController.acceptApplication(req, res));

// Editor / Marketplace routes
router.get("/projects", (req, res) => marketplaceController.getMarketplaceProjects(req, res));
router.post("/projects/:projectId/apply", (req, res) => marketplaceController.applyToProject(req, res));

// Common/Chat routes
router.get("/applications/my", async (req, res) => {
    // Need a controller method for editor to get their applications.
    // Wait, the controller doesn't have it yet. Let's add it there or just proxy directly.
    // Actually, I should add getEditorApplications to MarketplaceController.
    try {
        const applications = await require("../services/MarketplaceService").getEditorApplications(req.userId);
        res.status(200).json(applications);
    } catch(err) {
        res.status(err.status || 500).json({message: err.message || "Internal server error"});
    }
});
router.get("/applications/:applicationId/messages", (req, res) => marketplaceController.getApplicationMessages(req, res));
router.post("/applications/:applicationId/messages", (req, res) => marketplaceController.sendMessage(req, res));

module.exports = router;
