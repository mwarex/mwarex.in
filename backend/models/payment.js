const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    provider: {
        type: String,
        enum: ["razorpay", "coinbase"],
        default: "razorpay",
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    paymentId: {
        type: String,
        default: null,
    },
    signature: {
        type: String,
        default: null,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    plan: {
        type: String,
        enum: ["free", "pro", "team"],
        default: "pro",
    },
    status: {
        type: String,
        enum: ["created", "paid", "failed", "refunded"],
        default: "created",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    paidAt: {
        type: Date,
        default: null,
    },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
