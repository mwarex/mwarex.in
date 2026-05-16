const router = require("express").Router();
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT
  );
};

router.get("/google", (req, res) => {
  try {
    const oauth2Client = createOAuth2Client();
    const { origin } = req.query;

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      state: origin || process.env.FRONTEND_URL || "https://www.mwarex.in",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/youtube.upload",
      ],
    });

    return res.redirect(url);
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(500).json({ message: "Failed to generate auth url" });
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const frontend = state || process.env.FRONTEND_URL || "https://www.mwarex.in";

    if (!code) {
      return res.redirect(`${frontend}/auth/signin?error=no_code`);
    }

    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.email) {
      return res.redirect(`${frontend}/auth/signin?error=no_email`);
    }

    let user = await userModel.findOne({ email: googleUser.email });

    if (!user) {
      user = await userModel.create({
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split("@")[0],
        password: null,
        role: "creator",
        googleId: googleUser.id,
        profilePicture: googleUser.picture,
        youtubeTokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          updatedAt: new Date(),
        },
      });
    } else {
      user = await userModel.findByIdAndUpdate(
        user._id,
        {
          $set: {
            googleId: googleUser.id,
            profilePicture: googleUser.picture,
            name: user.name || googleUser.name,
            youtubeTokens: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token || user.youtubeTokens?.refreshToken,
              updatedAt: new Date(),
            },
          },
        },
        { new: true }
      );
    }

    const appToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_USER,
      { expiresIn: "7d" }
    );

    res.cookie("auth", appToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const params = new URLSearchParams();
    params.append("token", appToken);
    params.append("email", user.email);
    params.append("name", user.name || "");
    params.append("role", user.role || "creator");
    params.append("userId", user._id.toString());

    const dashboard = user.role === "editor" ? "/dashboard/editor" : "/dashboard/creator";

    return res.redirect(`${frontend.replace(/\/$/, "")}/auth/google-callback?${params.toString()}&redirect=${encodeURIComponent(dashboard)}`);
  } catch (err) {
    console.error("Google Callback Error:", err.message);
    const frontend = req.query.state || process.env.FRONTEND_URL || "https://www.mwarex.in";
    return res.redirect(`${frontend}/auth/signin?error=auth_failed&message=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;
