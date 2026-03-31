const BaseController = require("./BaseController");
const VideoService = require("../services/VideoService");
const { enqueueYoutubeUpload } = require("../services/YouTubeQueue");
const { getOAuth2Client } = require("../tools/googleClient");

class VideoController extends BaseController {
    constructor(videoService) {
        super();
        this.videoService = videoService;
    }

    emitVideoUpdate(req, video, eventType = "video_updated") {
        if (!req.io) return;
        const roomId = video.roomId || req.body.roomId;
        if (roomId) {
            req.io.to(`room_${roomId}`).emit(eventType, {
                video,
                action: eventType,
                updatedAt: new Date().toISOString(),
            });
        }
    }

    async upload(req, res) {
        try {
            const video = await this.videoService.uploadVideo({
                file: req.file,
                title: req.body.title,
                description: req.body.description,
                creatorId: req.body.creatorId,
                editorId: req.body.editorId,
                roomId: req.body.roomId,
                role: req.role,
                userId: req.userId,
            });

            this.emitVideoUpdate(req, video, "video_uploaded");

            return this.success(res, { message: "uploaded", video });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async uploadRaw(req, res) {
        try {
            const video = await this.videoService.uploadRawVideo({
                file: req.file,
                title: req.body.title,
                description: req.body.description,
                creatorId: req.body.creatorId,
                editorId: req.body.editorId,
                roomId: req.body.roomId,
                thumbnailUrl: req.body.thumbnailUrl,
                role: req.role,
                userId: req.userId,
            });

            this.emitVideoUpdate(req, video, "video_uploaded");

            return this.success(res, { message: "raw video uploaded", video });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getAll(req, res) {
        try {
            const videos = await this.videoService.getVideos(
                req.userId,
                req.role,
                req.query.roomId
            );
            return this.success(res, videos);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getPending(req, res) {
        try {
            const videos = await this.videoService.getPendingVideos(req.userId, req.role);
            return this.success(res, videos);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async approve(req, res) {
        try {
            const { video, creatorId } = await this.videoService.approveVideo(
                req.params.id,
                req.userId
            );

            try {
                const testClient = await getOAuth2Client(creatorId);
                await testClient.getAccessToken();
            } catch (tokenErr) {
                console.error("Token pre-flight failed:", tokenErr.message);
            }

            this.emitVideoUpdate(req, video, "video_approved");

            // Push to BullMQ — retryable, tracked, non-blocking
            await enqueueYoutubeUpload({ videoId: video._id.toString(), creatorId: creatorId.toString() });

            return this.success(res, { message: "Video approved. YouTube upload queued in background!" });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    /**
     * POST /api/v1/videos/register-s3
     * Called by the frontend AFTER a successful direct S3 upload.
     * Body: { s3Key, fileUrl, title, description, roomId, editorId, isRaw }
     */
    async registerFromS3(req, res) {
        try {
            const { s3Key, fileUrl, title, description, roomId, editorId, isRaw, thumbnailUrl } = req.body;

            if (!fileUrl) {
                return this.badRequest(res, "fileUrl is required");
            }

            const fakeFile = { path: fileUrl, originalname: s3Key || "video" };

            let video;
            if (isRaw) {
                video = await this.videoService.uploadRawVideo({
                    file: fakeFile,
                    title: title || "Untitled",
                    description: description || "",
                    creatorId: req.body.creatorId,
                    editorId,
                    roomId,
                    thumbnailUrl: thumbnailUrl || "",
                    role: req.role,
                    userId: req.userId,
                });
                
                // ── MOCK AI PROCESSING (No real AI, just simulate) ──
                if (!editorId) {
                    const VideoModel = require("../models/video");
                    
                    // Run mock processing in background
                    (async () => {
                        try {
                            video.status = "ai_processing";
                            video.aiProgress = { percent: 0, message: "Starting AI analysis..." };
                            await video.save();
                            
                            if (global.io && roomId) {
                                global.io.to(`room_${roomId.toString()}`).emit("video_progress", {
                                    videoId: video._id.toString(),
                                    percent: 10,
                                    message: "Analyzing video content..."
                                });
                            }

                            // Simulate AI processing steps
                            for (let i = 20; i <= 80; i += 20) {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                video.aiProgress = { 
                                    percent: i, 
                                    message: i < 50 ? "Detecting scenes and audio..." : "Generating edit suggestions..." 
                                };
                                await video.save();
                                
                                if (global.io && roomId) {
                                    global.io.to(`room_${roomId.toString()}`).emit("video_progress", {
                                        videoId: video._id.toString(),
                                        percent: i,
                                        message: video.aiProgress.message
                                    });
                                }
                            }

                            // Complete mock processing - use the original file as "edited"
                            video.status = "pending";
                            video.fileUrl = video.rawFileUrl;
                            video.aiProgress = { percent: 100, message: "AI Processing Complete!" };
                            await video.save();

                            if (global.io && roomId) {
                                global.io.to(`room_${roomId.toString()}`).emit("video_progress", {
                                    videoId: video._id.toString(),
                                    percent: 100,
                                    message: "AI Processing Complete!"
                                });
                                global.io.to(`room_${roomId.toString()}`).emit("video_updated", {
                                    videoId: video._id,
                                    status: "pending"
                                });
                            }
                        } catch (err) {
                            console.error("Mock AI processing error:", err.message);
                        }
                    })();
                }
                
            } else {
                video = await this.videoService.uploadVideo({
                    file: fakeFile,
                    title: title || "Untitled",
                    description: description || "",
                    creatorId: req.body.creatorId,
                    editorId,
                    roomId,
                    role: req.role,
                    userId: req.userId,
                });
            }

            this.emitVideoUpdate(req, video, "video_uploaded");
            return this.success(res, { message: "Video registered from S3", video });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async aiProgress(req, res) {
        try {
            const { percent, message } = req.body;
            const VideoModel = require("../models/video");
            const video = await VideoModel.findById(req.params.id);
            
            if (!video) return this.notFound(res, "Video not found");
            
            // Persist the progress state in DB
            video.aiProgress = { percent, message };
            await video.save();
            
            const roomId = video.roomId || req.body.roomId;
            if (req.io && roomId) {
                req.io.to(`room_${roomId}`).emit("video_progress", { videoId: video._id, percent, message });
            }
            
            return this.success(res, { message: "Progress updated" });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async aiCallback(req, res) {
        try {
            const { status, editedFileUrl, message } = req.body;
            // Get raw context access from mongoose Model
            const VideoModel = require("../models/video");
            const video = await VideoModel.findById(req.params.id);
            
            if (!video) return this.notFound(res, "Video not found");
            
            if (status === "failed") {
                video.status = "raw_rejected";
                video.rejectionReason = "AI Analysis Failed: " + message;
            } else {
                video.status = "pending";
                if (editedFileUrl) {
                    video.fileUrl = editedFileUrl;
                }
            }
            
            await video.save();
            this.emitVideoUpdate(req, video, "video_updated");
            
            return this.success(res, { message: "AI processing successfully applied to video." });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async reject(req, res) {
        try {
            const video = await this.videoService.rejectVideo(req.params.id, req.body.reason);

            this.emitVideoUpdate(req, video, "video_rejected");

            // --- AI RE-EDIT TRIGGER ---
            if (!video.editorId) {
                const pythonUrl = process.env.PYTHON_API_URL || "http://localhost:5001";
                
                try {
                    const populatedVideo = await this.videoService.getVideoById(video._id);
                    const chatHistory = populatedVideo.comments.map(c => `${c.isAI ? 'AI Editor' : 'Creator'}: ${c.text}`).join('\n');
                    const rejectionReason = req.body.reason || "Re-edit requested";
                    
                    const newAIPrompt = `Original Instructions: ${video.description}\nChat History over this video:\n${chatHistory}\nCreator's final rejection reason: ${rejectionReason}. \nCRITICAL: Adjust the cuts or fix mistakes based strictly on their new feedback.`;
                    
                    if (global.fetch) {
                        global.fetch(`${pythonUrl}/process_video`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                videoId: video._id,
                                fileUrl: video.rawFileUrl || video.fileUrl,
                                aiPrompt: newAIPrompt
                            })
                        }).catch(err => console.error("AI Engine network err:", err.message));
                    }
                    
                    video.status = "ai_processing";
                    await video.save();
                    this.emitVideoUpdate(req, video, "video_updated");
                } catch(aiError) {
                    console.error("Failed to trigger iterative AI Agent", aiError);
                }
            }

            return this.success(res, { message: "Video Rejected" });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async rawReview(req, res) {
        try {
            const video = await this.videoService.reviewRawVideo(
                req.params.id,
                req.userId,
                req.body.action,
                req.body.reason
            );

            const eventType = req.body.action === "accept" ? "video_accepted" : "video_rejected";
            this.emitVideoUpdate(req, video, eventType);

            return this.success(res, { message: "Review submitted", video });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async uploadEdit(req, res) {
        try {
            const video = await this.videoService.uploadEditedVideo(
                req.params.id,
                req.file,
                req.body.title,
                req.body.description,
                req.body.thumbnailUrl
            );

            this.emitVideoUpdate(req, video, "video_uploaded");

            return this.success(res, { message: "Edited video uploaded", video });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async getById(req, res) {
        try {
            const video = await this.videoService.getVideoById(req.params.id);
            return this.success(res, video);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async updateThumbnail(req, res) {
        try {
            const video = await this.videoService.updateThumbnail(
                req.params.id,
                req.body.thumbnailUrl
            );
            return this.success(res, video);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async addComment(req, res) {
        try {
            const comments = await this.videoService.addComment(
                req.params.id,
                req.userId,
                req.body.text,
                req.io
            );
            return this.success(res, comments);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async updateEditSettings(req, res) {
        try {
            const video = await this.videoService.updateEditSettings(
                req.params.id,
                req.body.editSettings
            );
            return this.success(res, video);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async youtubeStatus(req, res) {
        try {
            const status = await this.videoService.getYoutubeStatus(req.userId);
            return this.success(res, status);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async storeYoutubeTokens(req, res) {
        try {
            const result = await this.videoService.storeYoutubeTokens(
                req.userId,
                req.body.accessToken,
                req.body.refreshToken
            );
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async deleteForEveryone(req, res) {
        try {
            const result = await this.videoService.deleteForEveryone(req.params.id, req.userId);
            if (req.io) {
                req.io.emit("video_deleted_everyone", { videoId: req.params.id });
            }
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async deleteForMe(req, res) {
        try {
            const result = await this.videoService.deleteForMe(req.params.id, req.userId);
            return this.success(res, result);
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new VideoController(VideoService);
