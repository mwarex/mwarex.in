const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin");

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashed = await bcrypt.hash(password, 6);
    await adminModel.create({ email, password: hashed, name });
    res.json({ message: "Admin Created" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "not found" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: "invalid" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_ADMIN);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
