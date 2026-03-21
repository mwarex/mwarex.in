const VideoRepository = require("../repositories/VideoRepository");
const RoomRepository = require("../repositories/RoomRepository");
const UserRepository = require("../repositories/UserRepository");

class VideoService {
    constructor(videoRepository, roomRepository, userRepository) {
        this.videoRepository = videoRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    async resolveCreatorId(bodyCreatorId, userId, roomId) {
        let creatorId = bodyCreatorId || userId;

        if (roomId) {
            try {
                const room = await this.roomRepository.findById(roomId);
                if (room) {
                    creatorId = room.ownerId;
                }
            } catch (e) {
                console.error("Room lookup error:", e.message);
            }
        }

        return creatorId;
    }

    async uploadVideo({ file, title, description, creatorId, editorId, roomId, role, userId }) {
        const resolvedCreatorId = await this.resolveCreatorId(creatorId, userId, roomId);
        const isEditor = role === "editor";

        const resolvedEditorId = isEditor ? userId : (editorId && editorId.trim() !== "" ? editorId : undefined);

        const videoData = {
            fileUrl: file.path,
            title,
            description,
            creatorId: resolvedCreatorId,
            roomId,
            status: isEditor ? "pending" : "raw_uploaded",
        };

        if (resolvedEditorId) {
            videoData.editorId = resolvedEditorId;
        }

        const video = await this.videoRepository.create(videoData);

        return video;
    }

    async uploadRawVideo({ file, title, description, creatorId, editorId, roomId, thumbnailUrl, role, userId }) {
        const resolvedCreatorId = await this.resolveCreatorId(creatorId, userId, roomId);
        const isEditor = role === "editor";

        const resolvedEditorId = isEditor ? userId : (editorId && editorId.trim() !== "" ? editorId : undefined);

        const videoData = {
            rawFileUrl: file.path,
            fileUrl: file.path,
            title,
            description,
            creatorId: resolvedCreatorId,
            roomId,
            thumbnailUrl: thumbnailUrl || "",
            hasRawVideo: true,
            status: isEditor ? "editing_in_progress" : "raw_uploaded",
            editorReviewStatus: isEditor ? "accepted" : "pending",
        };

        if (resolvedEditorId) {
            videoData.editorId = resolvedEditorId;
        }

        const video = await this.videoRepository.create(videoData);

        return video;
    }

    async getVideos(userId, role, roomId) {
        let filter = { deletedFor: { $ne: userId } };

        if (roomId) {
            filter.roomId = roomId;
        }

        if (role === "creator") {
            let isRoomOwner = false;
            if (roomId) {
                try {
                    const room = await this.roomRepository.findById(roomId);
                    if (room && room.ownerId.toString() === userId) {
                        isRoomOwner = true;
                    }
                } catch (e) {
                    console.error("Room check error:", e.message);
                }
            }

            if (!isRoomOwner) {
                filter.creatorId = userId;
            }
        } else if (role === "editor") {
            if (roomId) {
                filter.roomId = roomId;
                filter.$or = [
                    { editorId: userId },
                    { editorId: { $exists: false } },
                    { editorId: null },
                ];
            } else {
                const user = await this.userRepository.findById(userId);
                if (user && user.creatorId) {
                    filter.creatorId = user.creatorId;
                    filter.$or = [
                        { editorId: userId },
                        { editorId: { $exists: false } },
                        { editorId: null },
                    ];
                } else {
                    return [];
                }
            }
        }

        return this.videoRepository.findWithFilter(filter);
    }

    async getPendingVideos(userId, role) {
        let filter = { status: "pending", deletedFor: { $ne: userId } };

        if (role === "creator") {
            filter.creatorId = userId;
        } else if (role === "editor") {
            const user = await this.userRepository.findById(userId);
            if (!user || !user.creatorId) {
                return [];
            }
            filter.creatorId = user.creatorId;
            filter.editorId = userId;
        }

        return this.videoRepository.findWithFilter(filter);
    }

    async approveVideo(videoId, userId) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) {
            throw { status: 404, message: "Video Not Found" };
        }

        const creatorId = video.creatorId || userId;
        const creator = await this.userRepository.findById(creatorId);

        if (!creator || !creator.youtubeTokens || !creator.youtubeTokens.refreshToken) {
            throw {
                status: 400,
                message: "YouTube account not connected. Please go to Settings and connect your channel.",
            };
        }

        video.status = "processing";
        await video.save();

        return { video, creatorId };
    }

    async rejectVideo(videoId, reason) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) {
            throw { status: 404, message: "Video not found" };
        }

        video.status = "rejected";
        if (reason) {
            video.rejectionReason = reason;
        }
        await video.save();

        return video;
    }

    async reviewRawVideo(videoId, userId, action, reason) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) {
            throw { status: 404, message: "Video not found" };
        }

        if (action === "accept") {
            video.editorReviewStatus = "accepted";
            video.status = "editing_in_progress";
            if (!video.editorId) {
                video.editorId = userId;
            }
        } else if (action === "reject") {
            video.editorReviewStatus = "rejected";
            video.status = "raw_rejected";
            video.editorRejectionReason = reason;
        }

        await video.save();
        return video;
    }

    async uploadEditedVideo(videoId, file, title, description, thumbnailUrl) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) {
            throw { status: 404, message: "Video not found" };
        }

        video.fileUrl = file.path;
        if (title) video.title = title;
        if (description) video.description = description;
        if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;

        video.status = "pending";
        video.rejectionReason = "";
        video.editorRejectionReason = "";
        video.editorReviewStatus = "accepted";

        await video.save();
        return video;
    }

    async getVideoById(videoId) {
        const video = await this.videoRepository.findByIdPopulated(videoId);
        if (!video) {
            throw { status: 404, message: "Video not found" };
        }
        return video;
    }

    async updateThumbnail(videoId, thumbnailUrl) {
        return this.videoRepository.updateThumbnail(videoId, thumbnailUrl);
    }

    async updateEditSettings(videoId, editSettings) {
        return this.videoRepository.updateEditSettings(videoId, editSettings);
    }

    async addComment(videoId, senderId, text, io) {
        let updatedVideo = await this.videoRepository.addComment(videoId, senderId, text);
        if (!updatedVideo) {
            throw { status: 404, message: "Video not found" };
        }

        const newComment = updatedVideo.comments[updatedVideo.comments.length - 1];

        if (io) {
            io.to(`video_${videoId}`).emit("new_comment", newComment);
        }

        // --- AI EDITOR CHAT INTEGRATION ---
        // If there is no human editor assigned, the AI Agent acts as the Editor
        if (!updatedVideo.editorId) {
            setTimeout(async () => {
                try {
                    const { GoogleGenerativeAI } = require("@google/generative-ai");
                    if (!process.env.GEMINI_API_KEY) return;
                    
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const chatHistory = updatedVideo.comments.map(c => `${c.isAI ? 'AI Editor' : 'Creator'}: ${c.text}`).join('\n');
                    const prompt = `You are an expert AI Video Editor assisting a Creator on the MwareX platform.
The creator is currently reviewing your recent edit of their video.
Here is the chat history:
${chatHistory}

Respond to exactly what the creator just asked in a helpful, concise, professional and enthusiastic tone. 
Acknowledge edits they want you to make differently (if any), and assure them you'll remember these details when they hit the "Reject & Re-edit" button. Reply cleanly without markdown codes.`;

                    const result = await model.generateContent(prompt);
                    const aiReply = result.response.text();

                    const freshVideo = await this.videoRepository.addComment(videoId, null, aiReply, true);
                    const aiComment = freshVideo.comments[freshVideo.comments.length - 1];

                    if (io) {
                        io.to(`video_${videoId}`).emit("new_comment", aiComment);
                    }
                } catch (aiError) {
                    console.error("AI Chat Reply Error:", aiError);
                }
            }, 500); // Slight delay for realism
        }

        return updatedVideo.comments;
    }

    async getYoutubeStatus(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        return {
            connected: !!(user.youtubeTokens && user.youtubeTokens.refreshToken),
            updatedAt: user.youtubeTokens?.updatedAt || null,
        };
    }

    async storeYoutubeTokens(userId, accessToken, refreshToken) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        user.youtubeTokens = {
            accessToken,
            refreshToken,
            updatedAt: new Date(),
        };
        await user.save();

        return { message: "YouTube tokens stored successfully" };
    }

    async deleteForEveryone(videoId, userId) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) throw { status: 404, message: "Video not found" };

        if (!video.creatorId || video.creatorId.toString() !== userId.toString()) {
            throw { status: 403, message: "Only the creator can delete this video for everyone" };
        }

        await this.videoRepository.deleteById(videoId);
        return { message: "Video deleted for everyone" };
    }

    async deleteForMe(videoId, userId) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) throw { status: 404, message: "Video not found" };

        if (!video.deletedFor) {
            video.deletedFor = [];
        }

        if (!video.deletedFor.includes(userId)) {
            video.deletedFor.push(userId);
            await video.save();
        }

        return { message: "Video deleted for me" };
    }
}

module.exports = new VideoService(VideoRepository, RoomRepository, UserRepository);
