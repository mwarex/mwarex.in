const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const authMiddleware = require("../middlewares/userMiddleware");

router.post("/create-order", authMiddleware, (req, res) => PaymentController.createOrder(req, res));
router.post("/verify", authMiddleware, (req, res) => PaymentController.verify(req, res));
router.get("/subscription", authMiddleware, (req, res) => PaymentController.getSubscription(req, res));
router.get("/history", authMiddleware, (req, res) => PaymentController.getHistory(req, res));
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => PaymentController.razorpayWebhook(req, res));

module.exports = router;
