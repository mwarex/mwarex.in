const router = require("express").Router();
const crypto = require("crypto");
const EditorAssignment = require("../models/EditorAssignment");
const userModel = require("../models/user");
const { creatorAuth } = require("../middlewares/creatorMiddleware");
const { sendInviteEmail } = require("../services/emailService");

router.post("/invite", creatorAuth, async (req, res) => {
  try {
    const { email, inviteLink: providedLink } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await EditorAssignment.create({
      creatorId: req.userId,
      editorEmail: email,
      inviteToken: token,
    });

    const frontendUrl = (process.env.FRONTEND_URL || "https://www.mwarex.in").replace(/\/$/, "");
    const inviteLink = providedLink || `${frontendUrl}/join?token=${token}`;

    const creator = await userModel.findById(req.userId);
    const creatorName = creator ? creator.name : "A Creator";

    let emailSent = false;
    if (email) {
      try {
        await sendInviteEmail(email, inviteLink, creatorName);
        emailSent = true;
      } catch (emailErr) {
        console.error("Email Error:", emailErr.message);
      }
    }

    res.json({
      message: emailSent ? "Invite sent via email!" : "Invite link generated!",
      inviteLink,
      emailSent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "something went wrong" });
  }
});

router.get("/verify", async (req, res) => {
  try {
    const token = req.query.token;
    const invite = await EditorAssignment.findOne({ inviteToken: token });

    if (!invite) {
      return res.status(404).json({ message: "Invalid invite link" });
    }

    res.json({
      message: "invite valid, proceed to signup",
      email: invite.editorEmail,
      creatorId: invite.creatorId,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
