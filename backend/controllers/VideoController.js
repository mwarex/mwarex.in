const BaseController = require("./BaseController");
const VideoService = require("../services/VideoService");
const { enqueueYoutubeUpload } = require("../services/YouTubeQueue");
const { getOAuth2Client } = require("../tools/googleClient");
const videoModel = require("../models/video");
const AIService = require("../services/AIService");

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
                
                // ── REAL AI PROCESSING ──
                if (!editorId) {
                    video.status = "ai_processing";
                    await video.save();
                    
                    // Trigger real AI in background
                    AIService.analyzeVideo(
                        video.rawFileUrl || video.fileUrl,
                        video.title,
                        video.description,
                        video._id,
                        global.io
                    ).catch(err => console.error("[VideoController] AI Trigger failed:", err.message));
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
            const video = await videoModel.findById(req.params.id);
            
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
            const { status, editedFileUrl, portraitFileUrl, captionFileUrl, transcript, clips, message } = req.body;
            // Get raw context access from mongoose Model
            const video = await videoModel.findById(req.params.id);
            
            if (!video) return this.notFound(res, "Video not found");
            
            if (status === "failed") {
                video.status = "raw_rejected";
                video.rejectionReason = "AI Analysis Failed: " + message;
            } else {
                video.status = "pending";
                if (editedFileUrl) {
                    video.fileUrl = editedFileUrl;
                }
                if (portraitFileUrl) {
                    video.portraitFileUrl = portraitFileUrl;
                }
                if (captionFileUrl) {
                    video.captionFileUrl = captionFileUrl;
                }
                if (transcript) {
                    video.transcript = transcript;
                }
                if (clips && clips.length > 0) {
                    video.clips = clips;
                }
            }
            
            await video.save();
            this.emitVideoUpdate(req, video, "video_updated");
            
            return this.success(res, { message: "AI processing successfully applied to video." });
        } catch (err) {
            return this.handleError(res, err);
        }
    }

    async clipsCallback(req, res) {
        try {
            const { status, clips, transcript, message } = req.body;
            // Note: req.params.id might be the parent video ID, or a dummy if it was a direct YouTube URL
            // If parent video exists, we update its progress
            let parentVideo = null;
            if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') {
                parentVideo = await videoModel.findById(req.params.id);
            }
            
            if (status === "failed") {
                if (parentVideo) {
                    parentVideo.status = "raw_rejected";
                    parentVideo.rejectionReason = "Clip Extraction Failed: " + message;
                    await parentVideo.save();
                    this.emitVideoUpdate(req, parentVideo, "video_updated");
                }
                return this.success(res, { message: "Handled failure." });
            }
            
            // Create new video entries for each clip
            if (clips && clips.length > 0) {
                const creatorId = parentVideo ? parentVideo.creatorId : req.body.creatorId;
                const roomId = parentVideo ? parentVideo.roomId : req.body.roomId;

                if (parentVideo) {
                    // Delete placeholder clips to replace them with the real ones
                    const placeholders = await videoModel.find({ parentVideoId: parentVideo._id, status: "ai_processing", isClip: true });
                    for (const p of placeholders) {
                        await videoModel.findByIdAndDelete(p._id);
                        this.emitVideoUpdate({ io: req.io, body: { roomId } }, { _id: p._id, roomId }, "video_deleted");
                    }
                }
                
                const clipDocs = [];
                for (const clip of clips) {
                    const newClip = new videoModel({
                        title: clip.title || "Extracted Clip",
                        fileUrl: clip.fileUrl,
                        portraitFileUrl: clip.portraitFileUrl || "",
                        status: "pending",
                        creatorId,
                        roomId,
                        isClip: true,
                        parentVideoId: parentVideo ? parentVideo._id : null,
                        viralScore: clip.viralScore || 0,
                        aspectRatio: clip.aspectRatio || "16:9"
                    });
                    await newClip.save();
                    clipDocs.push(newClip);
                    this.emitVideoUpdate({ io: req.io, body: { roomId } }, newClip, "video_uploaded");
                }
                
                if (parentVideo) {
                    parentVideo.status = "approved";
                    parentVideo.aiProgress = { percent: 100, message: "Clips extracted successfully." };
                    if (transcript) {
                        parentVideo.transcript = transcript;
                    }
                    // Store structured clip info on the parent
                    parentVideo.clips = clips.map((c, i) => ({
                        id: `clip-${i + 1}`,
                        title: c.title || `Clip ${i + 1}`,
                        score: `${c.viralScore || 70}/100`,
                        duration: c.duration || "00:00",
                        hashtags: c.hashtags || "#MWareX",
                        startTime: c.startTime || "00:00",
                        endTime: c.endTime || "00:00",
                        fileUrl: c.fileUrl || "",
                        portraitFileUrl: c.portraitFileUrl || "",
                        aspectRatio: c.aspectRatio || "16:9"
                    }));
                    await parentVideo.save();
                    this.emitVideoUpdate(req, parentVideo, "video_updated");
                }
            }
            
            return this.success(res, { message: "Clips registered successfully." });
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

    // ── CLIP EXTRACTOR ──
    async extractClips(req, res) {
        try {
            const { youtubeUrl, videoId, roomId } = req.body;
            let fileUrl = req.body.fileUrl;
            
            let targetVideoId = videoId;
            if (!youtubeUrl && videoId) {
                const video = await videoModel.findById(videoId);
                if (video) fileUrl = video.rawFileUrl || video.fileUrl;
            } else if (youtubeUrl && !videoId) {
                const newParent = new videoModel({
                    title: "YouTube Import",
                    description: youtubeUrl,
                    status: "ai_processing",
                    creatorId: req.userId,
                    roomId,
                    fileUrl: youtubeUrl
                });
                await newParent.save();
                targetVideoId = newParent._id.toString();
                // Tell frontend a new video was added
                this.emitVideoUpdate({ io: req.io, body: { roomId } }, newParent, "video_uploaded");

                // Generate placeholder clips to match the old UX
                const placeholderScores = [85, 75, 80, 90];
                for (let i = 0; i < 4; i++) {
                    const placeholderClip = new videoModel({
                        title: `Extracting Clip ${i + 1}...`,
                        status: "ai_processing",
                        creatorId: req.userId,
                        roomId,
                        isClip: true,
                        parentVideoId: targetVideoId,
                        viralScore: placeholderScores[i]
                    });
                    await placeholderClip.save();
                    this.emitVideoUpdate({ io: req.io, body: { roomId } }, placeholderClip, "video_uploaded");
                }
            }

            const pythonUrl = process.env.PYTHON_API_URL || "http://localhost:5001";
            
            // Just trigger the python agent and return success immediately
            if (global.fetch) {
                global.fetch(`${pythonUrl}/extract_clips`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        youtubeUrl,
                        videoId: targetVideoId,
                        roomId,
                        fileUrl,
                        creatorId: req.userId
                    })
                }).catch(err => console.error("AI Engine clip extraction network err:", err.message));
            }
            
            return this.success(res, { message: "Clip extraction started in background." });
        } catch (err) {
            return this.handleError(res, err);
        }
    }
}

module.exports = new VideoController(VideoService);
