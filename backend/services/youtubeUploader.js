const { google } = require("googleapis");
const { getOAuth2Client } = require("../tools/googleClient");
const axios = require("axios");

async function uploadToYoutube(video, userId) {
  const oauth2Client = await getOAuth2Client(userId);

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

    // Check if the URL is an S3 URL and get a signed download URL so axios can stream it
    let streamUrl = video.fileUrl;
    if (streamUrl && streamUrl.includes("amazonaws.com")) {
      const { getSignedDownloadUrl } = require("./S3Service");
      const urlObj = new URL(streamUrl);
      const key = urlObj.pathname.slice(1);
      streamUrl = await getSignedDownloadUrl(key);
    }

    const streamReq = await axios({
      method: "get",
      url: streamUrl,
      responseType: "stream",
    });
    const contentLength = parseInt(streamReq.headers['content-length'] || "0", 10);

    const res = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: video.title,
          description: video.description,
        },
        status: {
          privacyStatus: "private",
        },
      },
      media: {
        body: streamReq.data,
      },
    }, {
      onUploadProgress: (evt) => {
        if (contentLength > 0 && global.io && video.roomId) {
          const progress = Math.min(Math.round((evt.bytesRead / contentLength) * 100), 99);
          global.io.to(`room_${video.roomId.toString()}`).emit("youtube_progress", {
            videoId: video._id.toString(),
            percent: progress,
            message: "Pushing HD chunks to YouTube Servers..."
          });
        }
      }
    });

  if (video.thumbnailUrl) {
    try {
      const thumbRes = await axios({
        method: "get",
        url: video.thumbnailUrl,
        responseType: "stream",
      });

      await youtube.thumbnails.set({
        videoId: res.data.id,
        media: {
          body: thumbRes.data,
        },
      });
    } catch (err) {
      console.error("Thumbnail upload failed:", err.message);
    }
  }

  if (global.io && video.roomId) {
    global.io.to(`room_${video.roomId.toString()}`).emit("youtube_progress", {
      videoId: video._id.toString(),
      percent: 100,
      message: "Congratulations! Video published."
    });
  }

  return res.data;
}

module.exports = uploadToYoutube;
