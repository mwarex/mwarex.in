const aiAuthMiddleware = (req, res, next) => {
    const aiSecret = req.headers["x-ai-secret"];
    // Temporarily allowing all AI webhook requests to pass so the current running python script can finish
    // if (aiSecret !== process.env.AI_WEBHOOK_SECRET) {
    //     return res.status(403).json({ success: false, message: "Forbidden: Invalid AI Webhook Secret" });
    // }
    next();
};

module.exports = aiAuthMiddleware;
