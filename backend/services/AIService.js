const axios = require("axios");

class AIService {
    constructor() {
        this.useMock = true; 
    }

    getModel(modelName = "gemini-1.5-flash") {
        return null;
    }

    mockAnalyzeVideo(videoUrl, title, description) {
        const mockResults = {
            status: "analyzed",
            analysis: {
                suggestedCuts: Math.floor(Math.random() * 10) + 5,
                detectedSilence: Math.floor(Math.random() * 30) + 10,
                contentScore: Math.floor(Math.random() * 20) + 80,
                bestMoments: [
                    { timestamp: 15, reason: "High engagement moment" },
                    { timestamp: 45, reason: "Interesting visual" },
                    { timestamp: 120, reason: "Good audio quality" }
                ],
                suggestedEdits: [
                    "Cut silence at 0:15-0:22",
                    "Remove filler words at 1:05",
                    "Add transition at 2:30"
                ],
                estimatedDuration: Math.floor(Math.random() * 300) + 180,
                thumbnailSuggestion: `https://image.pollinations.ai/prompt/${encodeURIComponent(title || 'video thumbnail')}`
            },
            processingTime: "45 seconds",
            editedFileUrl: videoUrl,
            isMockAnalysis: true
        };
        return mockResults;
    }

    async generateTitles(keywords) {
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

    async generateThumbnailPrompts(topic) {
        try {
            const model = this.getModel();
            const prompt = `Generate 4 distinct, highly detailed visual descriptions for a YouTube thumbnail about: "${topic}". 
    The descriptions should be optimized for an AI image generator (like Midjourney/Stable Diffusion).
    Return ONLY a JSON array of strings. Example: ["Close up of...", "Wide shot of..."]. Do not add markdown.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        } catch (error) {
            console.warn("Gemini Error:", error.message);
            return [
                `Youtube thumbnail of ${topic}, high quality, 4k, vibrant colors`,
                `Cinematic shot of ${topic}, dramatic lighting, hyperrealistic`,
                `Minimalist design of ${topic}, vector art style, clean background`,
                `Close-up excessive detail of ${topic}, professional photography`,
            ];
        }
    }

    async generateThumbnails(topic) {
        const prompts = [
            `Youtube thumbnail of ${topic}, high quality, 4k, vibrant colors`,
            `Cinematic shot of ${topic}, dramatic lighting, hyperrealistic`,
            `Minimalist design of ${topic}, vector art style, clean background`,
            `Close-up excessive detail of ${topic}, professional photography`,
        ];

        return prompts.map((p) => {
            const seed = Math.floor(Math.random() * 1000000);
            return {
                prompt: p,
                url: `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`,
            };
        });
    }

    analyzeScore(title, description) {
        let score = 70;
        if (title && title.length > 20 && title.length < 60) score += 10;
        if (description && description.length > 100) score += 10;
        return Math.min(score, 100);
    }

    async analyzeVideo(videoUrl, title, description, videoId, io) {
        const roomId = videoId ? videoId.toString().slice(-8) : "default";
        
        for (let i = 0; i <= 100; i += 10) {
            if (io && roomId) {
                io.to(`room_${roomId}`).emit("video_progress", {
                    videoId: videoId || "unknown",
                    percent: i,
                    message: i < 30 ? "Analyzing video content..." : 
                             i < 60 ? "Detecting scenes and audio..." :
                             i < 90 ? "Generating edit suggestions..." : "Finalizing analysis..."
                });
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return this.mockAnalyzeVideo(videoUrl, title, description);
    }

    async chat(messages) {
        const systemPrompt = `You are the MWareX Autonomous AI, the central intelligence behind the MWareX content platform.
MWareX is a revolutionary platform where Creators upload raw videos and the AI autonomously edits them — removing silences, mistakes, and stutters while preserving cinematic B-roll and aesthetic shots.

Key Features you can explain:
- Autonomous AI Video Editing (powered by Gemini multimodal analysis)
- YouTube Auto-Publish (one-click publish to YouTube after approval)
- AI Video Editor (that's you!) for content guidance
- AI Thumbnail Generator (that's you!) for content guidance
- AI Title Generator (that's you!) for content guidance
- AI Script Generator (that's you!) for content guidance
- AI Description Generator (that's you!) for content guidance
- Real-time AI Processing progress tracking
- AI Chat Assistant (that's you!) for content guidance
- Multi-room workspace for organizing content
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
