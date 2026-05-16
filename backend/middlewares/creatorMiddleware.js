const jwt = require("jsonwebtoken");

function creatorAuth(req, res, next) {
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(403).json({ message: "Not authorized" });
  }
}

module.exports = { creatorAuth };
