const aiAuthMiddleware = (req, res, next) => {
  const secret = req.headers["x-ai-secret"];
  
  if (!secret || secret !== process.env.AI_WEBHOOK_SECRET) {
    return res.status(403).json({ message: "Forbidden: Invalid AI Webhook Secret" });
  }
  
  next();
};

module.exports = aiAuthMiddleware;
