const { google } = require("googleapis");
const { getOAuth2Client } = require("../tools/googleClient");
const axios = require("axios");

async function uploadToYoutube(video, userId) {
  const oauth2Client = await getOAuth2Client(userId);

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  // Prefer AI-edited file, fall back to raw upload
  let streamUrl = video.editedFileUrl || video.fileUrl;

  if (!streamUrl) {
    throw new Error(`No file URL found for video ${video._id}`);
  }

  // Get a presigned download URL for private S3 objects
  if (streamUrl.includes("amazonaws.com")) {
    const { getSignedDownloadUrl } = require("./S3Service");
    const urlObj = new URL(streamUrl);
    const key = urlObj.pathname.slice(1);
    streamUrl = await getSignedDownloadUrl(key);
  }

  console.log(`[YT Upload] Streaming from URL (first 100 chars): ${streamUrl.substring(0, 100)}...`);

  const streamReq = await axios({
    method: "get",
    url: streamUrl,
    responseType: "stream",
    timeout: 0, // No timeout for large video downloads
  });

  const contentLength = parseInt(streamReq.headers["content-length"] || "0", 10);
  console.log(`[YT Upload] Content-Length: ${contentLength}`);

  // Emit steady 50% if we don't know the content-length (so UI doesn't freeze)
  if (global.io && video.roomId) {
    if (contentLength === 0) {
      global.io.to(`room_${video.roomId.toString()}`).emit("youtube_progress", {
        videoId: video._id.toString(),
        percent: 50,
        message: "Uploading to YouTube...",
      });
    } else {
      // Track real byte progress from stream data events
      let bytesRead = 0;
      let lastEmitTime = 0;
      streamReq.data.on("data", (chunk) => {
        bytesRead += chunk.length;
        const now = Date.now();
        if (now - lastEmitTime > 500) {
          lastEmitTime = now;
          const progress = Math.min(Math.round((bytesRead / contentLength) * 100), 99);
          global.io.to(`room_${video.roomId.toString()}`).emit("youtube_progress", {
            videoId: video._id.toString(),
            percent: progress,
            message: "Pushing HD chunks to YouTube Servers...",
          });
        }
      });
    }
  }

  // Wrap in a promise timeout (15 mins) to prevent BullMQ worker from hanging forever
  const uploadPromise = youtube.videos.insert({
    part: "snippet,status",
    requestBody: {
      snippet: {
        title: video.title || "Untitled Video",
        description: video.description || "",
      },
      status: {
        privacyStatus: "private",
      },
    },
    media: {
      mimeType: "video/mp4", // CRITICAL: Without this, googleapis stream sniffer can hang indefinitely
      body: streamReq.data,
    },
  });

  const res = await Promise.race([
    uploadPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("YouTube upload timed out after 15 minutes")), 900000))
  ]);

  console.log(`[YT Upload] ✅ Upload complete. YouTube ID: ${res.data.id}`);

  // Upload thumbnail (non-fatal)
  if (video.thumbnailUrl) {
    try {
      const thumbRes = await axios({
        method: "get",
        url: video.thumbnailUrl,
        responseType: "stream",
        timeout: 15000,
      });
      await youtube.thumbnails.set({
        videoId: res.data.id,
        media: { body: thumbRes.data },
      });
    } catch (err) {
      console.error("[YT Upload] Thumbnail upload failed (non-fatal):", err.message);
    }
  }

  // Always emit 100% on success so UI completes
  if (global.io && video.roomId) {
    global.io.to(`room_${video.roomId.toString()}`).emit("youtube_progress", {
      videoId: video._id.toString(),
      percent: 100,
      message: "🎉 Congratulations! Video published to YouTube.",
    });
  }

  return res.data;
}

module.exports = uploadToYoutube;
