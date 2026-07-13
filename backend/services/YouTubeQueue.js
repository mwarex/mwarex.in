const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");
const uploadToYoutube = require("./youtubeUploader");
const VideoRepository = require("../repositories/VideoRepository");

const QUEUE_NAME = "youtube-upload";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// ─── Redis Connection ─────────────────────────────────────────────────────
// Supports both:
//   Local:   redis://127.0.0.1:6379
//   Upstash: rediss://default:<password>@<host>:6380  (TLS = rediss://)
// ─────────────────────────────────────────────────────────────────────────
let redisConnection;
let youtubeUploadQueue;
let worker;

try {
    const isTLS = REDIS_URL.startsWith("rediss://");

    redisConnection = new IORedis(REDIS_URL, {
        maxRetriesPerRequest: null, // required by BullMQ
        tls: isTLS ? { rejectUnauthorized: false } : undefined,
        enableReadyCheck: false,
        lazyConnect: false,
    });

    redisConnection.on("connect", () => console.log("[Redis] ✅ Connected:", REDIS_URL.split("@").pop()));
    redisConnection.on("error",   (err) => console.error("[Redis] ❌ Error:", err.message));

    // ── Queue ─────────────────────────────────────────────────────────────
    youtubeUploadQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

    // ── Worker ────────────────────────────────────────────────────────────
    worker = new Worker(
        QUEUE_NAME,
        async (job) => {
            const { videoId, creatorId } = job.data;
            console.log(`[YouTubeQueue] Processing job for video ${videoId}`);

            const video = await VideoRepository.findById(videoId);
            if (!video) throw new Error(`Video ${videoId} not found`);

            // Streams directly from S3 URL → YouTube API
            const ytData = await uploadToYoutube(video, creatorId);

            video.youtubeId = ytData.id;
            video.status = "uploaded";
            await video.save();

            console.log(`[YouTubeQueue] ✅ Uploaded video ${videoId} → YouTube ID: ${ytData.id}`);
            return { youtubeId: ytData.id };
        },
        {
            connection: redisConnection,
            concurrency: 2, // max 2 simultaneous YouTube uploads
        }
    );

    worker.on("completed", (job, result) => console.log(`[YouTubeQueue] Job ${job.id} done:`, result));
    worker.on("failed", async (job, err) => {
        console.error(`[YouTubeQueue] ❌ Job ${job.id} failed:`, err.message);
        try {
            const videoId = job?.data?.videoId;
            await VideoRepository.findByIdAndUpdate(videoId, {
                status: "upload_failed",
            });
            
            if (global.io) {
                // Fetch video to get roomId
                const video = await VideoRepository.findById(videoId);
                if (video && video.roomId) {
                    global.io.to(`room_${video.roomId.toString()}`).emit("youtube_progress", {
                        videoId: videoId,
                        percent: 0,
                        message: "❌ Upload failed: " + err.message,
                        error: true
                    });
                }
            }
        } catch (dbErr) {
            console.error(`[YouTubeQueue] Failed to update status to upload_failed:`, dbErr.message);
        }
    });
    worker.on("error", (err) => console.error("[YouTubeQueue] Worker error:", err.message));

    console.log("[YouTubeQueue] ✅ Queue & Worker initialized");
} catch (err) {
    console.error("[YouTubeQueue] ⚠️ Could not initialize queue — Redis unavailable:", err.message);
    console.error("[YouTubeQueue] YouTube uploads will NOT be queued until Redis is connected.");
}

// ── Public API ─────────────────────────────────────────────────────────────
async function enqueueYoutubeUpload({ videoId, creatorId }) {
    if (!youtubeUploadQueue) {
        throw new Error("YouTube upload queue is not available — check REDIS_URL in .env");
    }

    await youtubeUploadQueue.add(
        "upload",
        { videoId, creatorId },
        {
            attempts: 3,
            backoff: { type: "exponential", delay: 10000 }, // retry: 10s → 20s → 40s
            removeOnComplete: { count: 100 },
            removeOnFail:     { count: 100 },
        }
    );

    console.log(`[YouTubeQueue] Queued YouTube upload for video ${videoId}`);
}

module.exports = { youtubeUploadQueue, enqueueYoutubeUpload };