const axios = require("axios");

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:5001";

class AIService {
    constructor() {
        this.useMock = false; // REAL AI — no more mocks!
    }

    /**
     * Analyze a video using the real Python AI Engine.
     * Triggers the full pipeline: Whisper transcription → LLM analysis → FFmpeg editing → captions → 9:16 crop
     */
    async analyzeVideo(videoUrl, title, description, videoId, io) {
        const roomId = videoId ? videoId.toString().slice(-8) : "default";
        
        // Emit initial progress
        if (io && roomId) {
            io.to(`room_${roomId}`).emit("video_progress", {
                videoId: videoId || "unknown",
                percent: 5,
                message: "Sending video to AI Engine..."
            });
        }

        try {
            // Trigger the real Python AI pipeline
            const response = await axios.post(`${PYTHON_API_URL}/process_video`, {
                videoId: videoId,
                fileUrl: videoUrl,
                aiPrompt: description || "Edit this video professionally — remove silences, fillers, and mistakes. Keep all meaningful content."
            }, { timeout: 10000 });

            return {
                status: "processing",
                message: "AI Engine processing video in background. Real-time progress will appear.",
                isMockAnalysis: false
            };
        } catch (error) {
            console.error("[AIService] Failed to reach Python AI Engine:", error.message);
            
            // Return meaningful error instead of fake data
            return {
                status: "error",
                message: `AI Engine not reachable: ${error.message}. Make sure the Python server is running on ${PYTHON_API_URL}`,
                isMockAnalysis: false
            };
        }
    }

    /**
     * Generate title suggestions using Groq Llama
     */
    async generateTitles(keywords) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a YouTube title expert. Generate 5 click-worthy, SEO-optimized video titles. Return ONLY a JSON array of strings." },
                        { role: "user", content: `Generate 5 viral YouTube titles about: ${keywords}` }
                    ],
                    temperature: 0.8,
                    max_tokens: 512,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            let text = response.data.choices[0].message.content;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const titles = JSON.parse(text);
            return { titles, isMock: false };
        } catch (error) {
            console.error("Groq Title Generation Error:", error.message);
            return {
                titles: [
                    `The Ultimate Guide to ${keywords}`,
                    `Why Everyone is Talking About ${keywords}`,
                    `I Tried ${keywords} and You Won't Believe This`,
                    `Stop Doing ${keywords} Wrong!`,
                    `10 Secrets About ${keywords}`,
                ],
                isMock: true,
            };
        }
    }

    /**
     * Generate thumbnail prompts using Groq Llama
     */
    async generateThumbnailPrompts(topic) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a thumbnail design expert. Generate 4 detailed visual descriptions for AI image generation. Return ONLY a JSON array of strings." },
                        { role: "user", content: `Generate 4 YouTube thumbnail descriptions for: "${topic}"` }
                    ],
                    temperature: 0.8,
                    max_tokens: 512,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            let text = response.data.choices[0].message.content;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        } catch (error) {
            console.warn("Groq Thumbnail Prompt Error:", error.message);
            return [
                `Youtube thumbnail of ${topic}, high quality, 4k, vibrant colors`,
                `Cinematic shot of ${topic}, dramatic lighting, hyperrealistic`,
                `Minimalist design of ${topic}, vector art style, clean background`,
                `Close-up excessive detail of ${topic}, professional photography`,
            ];
        }
    }

    /**
     * Generate thumbnails using Pollinations.ai
     */
    async generateThumbnails(topic) {
        const prompts = await this.generateThumbnailPrompts(topic);

        return prompts.map((p) => {
            const seed = Math.floor(Math.random() * 1000000);
            return {
                prompt: p,
                url: `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`,
            };
        });
    }

    /**
     * Analyze video SEO score using Groq Llama
     */
    async analyzeScore(title, description) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a YouTube SEO expert. Analyze the given title and description. Return ONLY a JSON object: {\"score\": number (0-100), \"tips\": [\"tip1\", \"tip2\"]}" },
                        { role: "user", content: `Analyze this YouTube video:\nTitle: ${title}\nDescription: ${description}` }
                    ],
                    temperature: 0.3,
                    max_tokens: 256,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            let text = response.data.choices[0].message.content;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const result = JSON.parse(text);
            return result.score || 70;
        } catch (error) {
            // Fallback: basic heuristic
            let score = 70;
            if (title && title.length > 20 && title.length < 60) score += 10;
            if (description && description.length > 100) score += 10;
            return Math.min(score, 100);
        }
    }

    /**
     * AI Chat Assistant powered by Groq Llama 3.3 70B
     */
    async chat(messages) {
        const systemPrompt = `You are the MWareX Autonomous AI, the central intelligence behind the MWareX content platform.
MWareX is a revolutionary platform where Creators upload raw videos and the AI autonomously edits them — removing silences, mistakes, and stutters while preserving cinematic B-roll and aesthetic shots.

Key Features you can explain:
- Autonomous AI Video Editing (powered by Groq Whisper + Llama 3.3 + FFmpeg)
- Real speech-to-text transcription with word-level timestamps
- Intelligent silence and filler word removal
- Auto-generated captions (TikTok/Reels style)
- 9:16 auto-crop for Instagram Reels / YouTube Shorts
- B-roll stock footage insertion from Pexels
- YouTube Auto-Publish (one-click publish after approval)
- AI Clip Extractor (long video → 3-5 viral short clips)
- Multi-platform export (YouTube, Instagram, LinkedIn, Twitter/X)
- Real-time AI Processing progress tracking
- AI Chat Assistant (that's you!) for content guidance
- Creator-Editor collaboration workflow

Be helpful, concise, slightly enthusiastic. Use markdown when making lists. Keep responses under 150 words unless asked for detail.`;

        try {
            const formattedMessages = messages.map(m => ({
                role: m.role === 'model' ? "assistant" : "user",
                content: m.text
            }));

            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...formattedMessages
                    ],
                    temperature: 0.7,
                    max_tokens: 1024,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error("Groq AI Chat Error:", error.response?.data || error.message);
            return "I'm experiencing high demand right now. Please try again in a moment! 🔄";
        }
    }
}

module.exports = new AIService();
