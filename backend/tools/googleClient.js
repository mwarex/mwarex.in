const { google } = require("googleapis");
const userModel = require("../models/user");
require("dotenv").config();

const getOAuth2Client = async (userId) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT
  );

  const user = await userModel.findById(userId);

  if (user && user.youtubeTokens) {
    oauth2Client.setCredentials({
      access_token: user.youtubeTokens.accessToken,
      refresh_token: user.youtubeTokens.refreshToken,
    });
  } else if (process.env.YOUTUBE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });
  }

  oauth2Client.on("tokens", async (tokens) => {
    try {
      const updateData = {
        "youtubeTokens.updatedAt": new Date(),
      };
      if (tokens.access_token) {
        updateData["youtubeTokens.accessToken"] = tokens.access_token;
      }
      if (tokens.refresh_token) {
        updateData["youtubeTokens.refreshToken"] = tokens.refresh_token;
      }
      await userModel.findByIdAndUpdate(userId, { $set: updateData });
    } catch (err) {
      console.error("Failed to save refreshed tokens:", err.message);
    }
  });

  return oauth2Client;
};

module.exports = { getOAuth2Client };
