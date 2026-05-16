const { Router } = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const EditorAssignment = require("../models/EditorAssignment");

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const invite = await EditorAssignment.findOne({
      editorEmail: email,
      status: "invited",
    });

    const creatorId = invite ? invite.creatorId : null;

    const newUser = await userModel.create({
      email,
      password: hashed,
      role: "editor",
      creatorId: creatorId,
    });

    if (invite) {
      invite.status = "accepted";
      invite.editorId = newUser._id;
      await invite.save();
    }

    res.json({
      message: "Editor signup successful",
      user: {
        _id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
