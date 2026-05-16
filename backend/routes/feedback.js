const router = require("express").Router();
const FeedbackController = require("../controllers/FeedbackController");

router.post("/", (req, res) => FeedbackController.addFeedback(req, res));
router.get("/", (req, res) => FeedbackController.getFeedbacks(req, res));

module.exports = router;
