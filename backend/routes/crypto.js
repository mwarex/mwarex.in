const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const authMiddleware = require("../middlewares/userMiddleware");

router.post("/create-charge", authMiddleware, (req, res) => PaymentController.cryptoCreateCharge(req, res));
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => PaymentController.cryptoWebhook(req, res));

module.exports = router;
