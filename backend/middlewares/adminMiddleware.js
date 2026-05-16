const jwt = require("jsonwebtoken");

const AdminMiddleware = function (req, res, next) {
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(403).json({ message: "Admin Unauthorized" });
  }
};

module.exports = { AdminMiddleware };
