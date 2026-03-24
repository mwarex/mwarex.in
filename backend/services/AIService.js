const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
    }

    getModel(modelName = "gemini-1.5-flash") {
        return this.genAI.getGenerativeModel({ model: modelName });
    }

    async generateTitles(keywords) {
        try {
            const model = this.getModel();
            const prompt = `Generate 5 catchy, viral YouTube video titles for a video about: "${keywords}". 
    Return ONLY a JSON array of strings. Example: ["Title 1", "Title 2"]. Do not add markdown formatting.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return { titles: JSON.parse(text) };
        } catch (error) {
            console.error("AI Title Gen Error:", error.message);
            return {
                titles: [
                    `The Ultimate Guide to ${keywords}`,
                    `Why Everyone is Talking About ${keywords}`,
                    `I Tried ${keywords} and You Won't Believe This`,
                    `Stop Doing ${keywords} Wrong!`,
                    `10 Secrets About ${keywords}`,
                ],
                isFallback: true,
            };
        }
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
        const prompts = await this.generateThumbnailPrompts(topic);

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

    async chat(messages) {
        const systemPrompt = `You are the MWareX Autonomous AI, the central intelligence behind the MWareX content platform.
MWareX is a revolutionary platform where Creators upload raw videos and the AI autonomously edits them — removing silences, mistakes, and stutters while preserving cinematic B-roll and aesthetic shots.

Key Features you can explain:
- Autonomous AI Video Editing (powered by Gemini multimodal analysis)
- YouTube Auto-Publish (one-click publish to YouTube after approval)
- Real-time AI Processing progress tracking
- AI Chat Assistant (that's you!) for content guidance
- Multi-room workspace for organizing content
- Creator-Editor collaboration workflow

Be helpful, concise, slightly enthusiastic. Use markdown when making lists. Keep responses under 150 words unless asked for detail.`;

        try {
            // Map our custom roles to OpenAI/Groq compatible roles
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
