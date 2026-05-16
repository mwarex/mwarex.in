const crypto = require("crypto");
const PaymentRepository = require("../repositories/PaymentRepository");
const UserRepository = require("../repositories/UserRepository");

const PLANS = {
    pro: {
        name: "Pro",
        amount: 1100,
        features: ["Unlimited projects", "Priority support", "Advanced AI tools"],
    },
    team: {
        name: "Team",
        amount: 89900,
        features: ["Everything in Pro", "Team collaboration", "Custom integrations"],
    },
};

class PaymentService {
    constructor(paymentRepository, userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    getPlanDetails(planKey) {
        if (!planKey || !PLANS[planKey]) {
            throw { status: 400, message: "Invalid plan selected" };
        }
        return PLANS[planKey];
    }

    async createPaymentRecord(userId, orderId, amount, plan, provider = "razorpay", currency = "INR", paymentId = null) {
        return this.paymentRepository.create({
            userId,
            orderId,
            amount,
            plan,
            provider,
            currency,
            paymentId,
            status: "created",
        });
    }

    verifyRazorpaySignature(orderId, paymentId, signature) {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        return expectedSignature === signature;
    }

    verifyCoinbaseSignature(rawBody, signature) {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.COINBASE_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");

        return expectedSignature === signature;
    }

    async processPaymentVerification(orderId, paymentId, signature, userId) {
        const isAuthentic = this.verifyRazorpaySignature(orderId, paymentId, signature);
        if (!isAuthentic) {
            throw { status: 400, message: "Payment verification failed - Invalid signature" };
        }

        const payment = await this.paymentRepository.findByOrderId(orderId);
        if (!payment) {
            throw { status: 404, message: "Payment record not found" };
        }

        payment.paymentId = paymentId;
        payment.signature = signature;
        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save();

        await this.activateSubscription(userId, payment.plan, paymentId);

        return { plan: payment.plan };
    }

    async activateSubscription(userId, plan, paymentId, provider = "razorpay") {
        return this.userRepository.updateSubscription(userId, {
            plan,
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paymentId,
            provider,
        });
    }

    async getSubscription(userId) {
        const user = await this.userRepository.findById(userId, "subscription");
        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        return user.subscription || { plan: "free", status: "active" };
    }

    async getPaymentHistory(userId) {
        return this.paymentRepository.findPaidByUserId(userId);
    }

    async handleCryptoWebhook(event) {
        if (event.type === "charge:confirmed") {
            const chargeCode = event.data.code;
            const userId = event.data.metadata.userId;
            const plan = event.data.metadata.plan;

            const payment = await this.paymentRepository.findByOrderId(chargeCode);
            if (payment) {
                payment.status = "paid";
                payment.paidAt = new Date();
                await payment.save();

                const targetUserId = payment.userId || userId;
                await this.activateSubscription(targetUserId, plan, event.data.id, "coinbase");
                console.log(`Crypto payment confirmed for user ${targetUserId}, plan ${plan}`);
            }
        }
    }
}

module.exports = new PaymentService(PaymentRepository, UserRepository);
