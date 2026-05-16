const BaseRepository = require("./BaseRepository");
const Payment = require("../models/payment");

class PaymentRepository extends BaseRepository {
    constructor() {
        super(Payment);
    }

    async findByOrderId(orderId) {
        return this.model.findOne({ orderId });
    }

    async findPaidByUserId(userId) {
        return this.model
            .find({ userId, status: "paid" })
            .sort({ createdAt: -1 });
    }

    async findByPaymentId(paymentId) {
        return this.model.findOne({ paymentId });
    }
}

module.exports = new PaymentRepository();
