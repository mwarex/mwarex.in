const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const UserMiddleware = async function (req, res, next) {
  try {
    const token = req.headers.token || (req.cookies && req.cookies.auth);
    if (!token) return res.status(403).json({ message: "Unauthorised" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    req.userId = decoded.id;

    const user = await userModel.findById(req.userId);
    if (!user) return res.status(403).json({ message: "User not found" });

    req.role = user.role;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Unauthorised" });
  }
};

module.exports = UserMiddleware;
