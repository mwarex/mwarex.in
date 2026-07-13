const router = require("express").Router();
const AIController = require("../controllers/AIController");
const userAuth = require("../middlewares/userMiddleware");

router.post("/generate-titles", userAuth, (req, res) => AIController.generateTitles(req, res));
router.post("/generate-thumbnails", userAuth, (req, res) => AIController.generateThumbnails(req, res));
router.post("/analyze-score", userAuth, (req, res) => AIController.analyzeScore(req, res));
router.post("/chat", userAuth, (req, res) => AIController.chat(req, res));
router.post("/analyze-video", userAuth, (req, res) => AIController.analyzeVideo(req, res));
router.post("/trends", userAuth, (req, res) => AIController.fetchTrends(req, res));
router.post("/competitor", userAuth, (req, res) => AIController.analyzeCompetitor(req, res));
router.post("/script", userAuth, (req, res) => AIController.generateScript(req, res));
router.post("/hashtags", userAuth, (req, res) => AIController.generateHashtags(req, res));
router.post("/sponsors", userAuth, (req, res) => AIController.findSponsors(req, res));
router.post("/voiceover", userAuth, (req, res) => AIController.generateVoiceover(req, res));

module.exports = router;
