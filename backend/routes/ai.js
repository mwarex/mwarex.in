const router = require("express").Router();
const AIController = require("../controllers/AIController");
const userAuth = require("../middlewares/userMiddleware");

router.post("/generate-titles", userAuth, (req, res) => AIController.generateTitles(req, res));
router.post("/generate-thumbnails", userAuth, (req, res) => AIController.generateThumbnails(req, res));
router.post("/analyze-score", userAuth, (req, res) => AIController.analyzeScore(req, res));
router.post("/chat", userAuth, (req, res) => AIController.chat(req, res));
router.post("/analyze-video", userAuth, (req, res) => AIController.analyzeVideo(req, res));

module.exports = router;
