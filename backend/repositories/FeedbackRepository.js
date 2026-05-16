const BaseRepository = require("./BaseRepository");
const feedbackModel = require("../models/feedback");

class FeedbackRepository extends BaseRepository {
    constructor() {
        super(feedbackModel);
    }
}

module.exports = new FeedbackRepository();
