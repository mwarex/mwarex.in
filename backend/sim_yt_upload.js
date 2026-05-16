require("dotenv").config();
const { google } = require("googleapis");
const axios = require("axios");

async function check() {
  console.log("Simulating streaming a small file...");
  try {
     const res2 = await axios.get("https://raw.githubusercontent.com/mdn/learning-area/master/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4", { responseType: 'stream' });
     
     console.log("Got stream, length:", res2.headers['content-length']);

     const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT
     );
    
     oauth2Client.setCredentials({ refresh_token: process.env.YOUTUBE_REFRESH_TOKEN });

     const youtube = google.youtube({ version: "v3", auth: oauth2Client });
     
     console.log("Calling youtube.videos.insert...");
     const res = await youtube.videos.insert({
       part: "snippet,status",
       requestBody: { snippet: { title: "Test Video" }, status: { privacyStatus: "private" } },
       media: { body: res2.data },
     });
     console.log("DONE! ID:", res.data.id);
  } catch (e) {
     console.error("FAILED:", e.message);
  }
}
check();
