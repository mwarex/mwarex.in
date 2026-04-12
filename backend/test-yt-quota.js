require("dotenv").config();
const { google } = require("googleapis");

async function checkQuota() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT
    );
    
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    console.log("Checking YouTube API connection...");
    
    const res = await youtube.channels.list({
      part: "snippet,statistics",
      mine: true
    });

    console.log("SUCCESS! Got channel info:");
    if (res.data.items && res.data.items.length > 0) {
      console.log("Channel Name:", res.data.items[0].snippet.title);
    } else {
      console.log("No channel found for this account (maybe not created yet on YT).");
    }
  } catch (err) {
    if (err.errors && err.errors[0]) {
      console.log("ERROR REASON:", err.errors[0].reason);
      console.log("ERROR MESSAGE:", err.errors[0].message);
    } else {
      console.error(err.message);
    }
  }
}
checkQuota();
