const BaseController = require("./BaseController");
const PaymentService = require("../services/PaymentService");

class PaymentController extends BaseController {
    constructor(paymentService) {
        super();
        this.paymentService = paymentService;
    }

    async createOrder(req, res) {
        try {
            const Razorpay = require("razorpay");
            const planDetails = this.paymentService.getPlanDetails(req.body.plan);

            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            const shortUserId = req.userId.toString().slice(-10);
            const receiptId = `ord_${Date.now()}_${shortUserId}`;

            const order = await razorpay.orders.create({
                amount: planDetails.amount,
                currency: "INR",
                receipt: receiptId,
                notes: { userId: req.userId, plan: req.body.plan },
            });

            await this.paymentService.createPaymentRecord(
                req.userId,
                order.id,
                planDetails.amount,
                req.body.plan
            );

            return this.success(res, {
                success: true,
                order: {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                },
                key: process.env.RAZORPAY_KEY_ID,
                plan: planDetails,
            });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async verify(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const result = await this.paymentService.processPaymentVerification(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                req.userId
            );

            return this.success(res, {
                success: true,
                message: "Payment verified successfully!",
                plan: result.plan,
            });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getSubscription(req, res) {
        try {
            const subscription = await this.paymentService.getSubscription(req.userId);
            return this.success(res, { success: true, subscription });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getHistory(req, res) {
        try {
            const payments = await this.paymentService.getPaymentHistory(req.userId);
            return this.success(res, { success: true, payments });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async razorpayWebhook(req, res) {
        try {
            const event = req.body;

            if (event.event === "payment.failed") {
                const PaymentRepository = require("../repositories/PaymentRepository");
                const failedPayment = await PaymentRepository.findByPaymentId(
                    event.payload.payment.entity.id
                );
                if (failedPayment) {
                    failedPayment.status = "failed";
                    await failedPayment.save();
                }
            }

            return this.success(res, { received: true });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async cryptoCreateCharge(req, res) {
        try {
            const axios = require("axios");
            const planDetails = this.paymentService.getPlanDetails(req.body.plan);

            if (!process.env.COINBASE_API_KEY) {
                throw { status: 500, message: "Crypto payment gateway is not configured." };
            }

            const CRYPTO_PLANS = {
                pro: { amount: "11.00", currency: "INR" },
                team: { amount: "899.00", currency: "INR" },
            };

            const cryptoPlan = CRYPTO_PLANS[req.body.plan];

            const response = await axios.post(
                "https://api.commerce.coinbase.com/charges",
                {
                    name: `Mwarex ${planDetails.name} Plan`,
                    description: "Subscription to Mwarex",
                    local_price: {
                        amount: cryptoPlan.amount,
                        currency: cryptoPlan.currency,
                    },
                    pricing_type: "fixed_price",
                    metadata: { userId: req.userId, plan: req.body.plan },
                    redirect_url: `${process.env.FRONTEND_URL || "https://mwarex.in"}/dashboard/creator?payment=success`,
                    cancel_url: `${process.env.FRONTEND_URL || "https://mwarex.in"}/#pricing`,
                },
                {
                    headers: {
                        "X-CC-Api-Key": process.env.COINBASE_API_KEY,
                        "X-CC-Version": "2018-03-22",
                        "Content-Type": "application/json",
                    },
                }
            );

            const charge = response.data.data;

            await this.paymentService.createPaymentRecord(
                req.userId,
                charge.code,
                parseFloat(cryptoPlan.amount) * 100,
                req.body.plan,
                "coinbase",
                cryptoPlan.currency,
                charge.id
            );

            return this.success(res, { success: true, hosted_url: charge.hosted_url });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async cryptoWebhook(req, res) {
        try {
            const signature = req.headers["x-cc-webhook-signature"];

            if (!process.env.COINBASE_WEBHOOK_SECRET || !signature) {
                throw { status: 400, message: "Webhook not configured or missing signature" };
            }

            const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
            const isValid = this.paymentService.verifyCoinbaseSignature(rawBody, signature);

            if (!isValid) {
                throw { status: 400, message: "Invalid webhook signature" };
            }

            const event = JSON.parse(rawBody).event;
            await this.paymentService.handleCryptoWebhook(event);

            return this.success(res, { received: true });
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new PaymentController(PaymentService);
