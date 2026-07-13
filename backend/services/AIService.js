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
    /**
     * Fetch trending video ideas using TinyFish + Groq
     */
    async fetchTrends(niche) {
        try {
            // 1. Fetch real-time data using TinyFish
            // The tinyfish API key is in process.env.TINYFISH_API_KEY
            // TinyFish fetches Google News or YouTube trending based on the niche
            const searchQuery = `https://news.google.com/search?q=${encodeURIComponent(niche + " youtube trending topics")}`;
            const tinyfishRes = await axios.post(
                "https://agent.tinyfish.ai/fetch",
                { url: searchQuery },
                {
                    headers: {
                        "Authorization": `Bearer ${process.env.TINYFISH_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            // 2. Use Groq to analyze the fetched content
            let fetchedContent = tinyfishRes.data.content || tinyfishRes.data.markdown || "Trending tech and ai news";
            // truncate content to save tokens
            if (fetchedContent.length > 3000) {
                fetchedContent = fetchedContent.substring(0, 3000);
            }

            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: `You are a YouTube viral strategist. Based on the real-time trending data provided, generate exactly 5 viral YouTube video ideas for the niche: "${niche}". 
Return ONLY a valid JSON array of objects. Each object must have:
- "title": (string) Clickable, high-CTR title
- "hook": (string) First 5 seconds script
- "score": (number) Predicted viral score out of 100
- "tags": (array of 3 strings) e.g. ["#trending", "#viral", "#niche"]
Do not include any markdown formatting like \`\`\`json.`
                        },
                        { 
                            role: "user", 
                            content: `Real-time web data for ${niche}:\n${fetchedContent}` 
                        }
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

            let text = response.data.choices[0].message.content;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const trends = JSON.parse(text);
            return trends;
        } catch (error) {
            console.error("TinyFish/Groq Trends Error:", error.message);
            // Fallback mock data if API fails or quota runs out
            return [
                { title: `The TRUTH About ${niche} in 2026`, hook: "Everyone is lying to you about this...", score: 98, tags: ["#exposed", "#truth", "#viral"] },
                { title: `I Tried ${niche} For 30 Days (Shocking Results)`, hook: "I didn't expect this to happen on day 7...", score: 95, tags: ["#challenge", "#results", "#insane"] },
                { title: `Stop Doing ${niche} Like This!`, hook: "If you are doing this, you are losing money...", score: 92, tags: ["#mistakes", "#guide", "#tips"] },
                { title: `The Ultimate ${niche} Masterclass`, hook: "I'm going to teach you everything in 10 minutes.", score: 88, tags: ["#masterclass", "#education", "#pro"] },
                { title: `Why ${niche} is DEAD (And What's Next)`, hook: "It's over. But here is the next big thing...", score: 85, tags: ["#future", "#news", "#update"] }
            ];
        }
    }

    /**
     * Analyze a competitor's YouTube video
     */
    async analyzeCompetitor(youtubeUrl) {
        try {
            // Use TinyFish to fetch the YouTube page
            const tinyfishRes = await axios.post(
                "https://agent.tinyfish.ai/fetch",
                { url: youtubeUrl },
                {
                    headers: {
                        "Authorization": `Bearer ${process.env.TINYFISH_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            let fetchedContent = tinyfishRes.data.content || tinyfishRes.data.markdown || "Video data";
            if (fetchedContent.length > 3000) {
                fetchedContent = fetchedContent.substring(0, 3000);
            }

            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: `You are an aggressive YouTube Strategist. I will provide you with data scraped from a competitor's YouTube video. 
Analyze it and return ONLY a valid JSON object with exactly these fields:
- "title": (string) The video's title
- "weaknesses": (array of 3 strings) Things they did wrong or missed
- "strategy": (string) A concise 2-sentence strategy on how the creator can make a MUCH better video to steal their audience
- "betterTitles": (array of 3 strings) 3 alternative clickbait titles that are better than the original.
Do not include any markdown formatting like \`\`\`json.`
                        },
                        { 
                            role: "user", 
                            content: `Competitor Video Data:\n${fetchedContent}` 
                        }
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

            let text = response.data.choices[0].message.content;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("Competitor Analysis Error:", error.message);
            // Fallback mock
            return {
                title: "How I Made $10,000 in 30 Days",
                weaknesses: ["Too slow pacing in the intro", "Poor audio quality", "Vague actionable steps"],
                strategy: "Start with a high-energy hook showing the final result. Provide a clear step-by-step framework that they completely missed.",
                betterTitles: ["The $10k/Month Strategy Nobody is Talking About", "I Copied The $10,000 Method (And Fixed It)", "Stop Doing This If You Want to Make $10k"]
            };
        }
    }

    /**
     * Generate a full 60-second YouTube shorts script
     */
    async generateScript(title, hook) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: `You are a world-class YouTube Shorts scriptwriter. 
Write a highly engaging, fast-paced 60-second script for the given title and hook. 
Return ONLY a JSON object with:
- "script": (string) The full script text formatted with line breaks for pacing. Include visual cues in brackets like [B-Roll: typing fast].`
                        },
                        { 
                            role: "user", 
                            content: `Title: ${title}\nHook: ${hook}` 
                        }
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

            let text = response.data.choices[0].message.content;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const result = JSON.parse(text);
            return result.script;
        } catch (error) {
            console.error("Script Generation Error:", error.message);
            return `[Visual: Fast zoom in on your face]\n\n${hook}\n\n[Visual: Show evidence/proof on screen]\n\nHere is exactly how you can do it too, step by step.\n\nFirst, you need to understand the psychology behind it...\n\n[Visual: Cinematic b-roll of working late]\n\nMost people give up right here. Don't be like them.\n\nSubscribe for part 2.`;
        }
    }

    /**
     * Generate viral hashtags based on a topic
     */
    async generateHashtags(topic) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: `You are an SEO and Hashtag expert. 
Generate exactly 15 viral hashtags for YouTube/Instagram for the given topic. 
Return ONLY a valid JSON array of strings (e.g. ["#viral", "#trending"]). Do not include markdown.`
                        },
                        { 
                            role: "user", 
                            content: `Topic: ${topic}` 
                        }
                    ],
                    temperature: 0.5,
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
            console.error("Hashtags Error:", error.message);
            return ["#viral", "#trending", "#foryou", "#explore", "#youtube", "#shorts", "#tips", "#guide", "#success", "#growth", "#mindset", "#hustle", "#learning", "#explorepage", "#newvideo"];
        }
    }

    /**
     * Find Sponsors and generate pitch
     */
    async findSponsors(niche) {
        try {
            // Use TinyFish to find recent funding or product launches
            const searchQuery = `https://news.google.com/search?q=${encodeURIComponent("recent " + niche + " startups funding OR new " + niche + " product launch")}`;
            const tinyfishRes = await axios.post(
                "https://agent.tinyfish.ai/fetch",
                { url: searchQuery },
                {
                    headers: {
                        "Authorization": `Bearer ${process.env.TINYFISH_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            let fetchedContent = tinyfishRes.data.content || tinyfishRes.data.markdown || "Startup news";
            if (fetchedContent.length > 3000) {
                fetchedContent = fetchedContent.substring(0, 3000);
            }

            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: `You are a Brand Deal Matchmaker for YouTube Creators. Based on the real-time news provided, find 3 companies that recently raised funding or launched a product in the given niche.
Return ONLY a valid JSON array of objects. Each object must have:
- "companyName": (string)
- "reason": (string) Short explanation of why they have a marketing budget right now (e.g. "Just raised $5M Series A")
- "coldEmail": (string) A short, highly-converting cold email template for the creator to pitch a YouTube sponsorship to this company.
Do not include any markdown formatting like \`\`\`json.`
                        },
                        { 
                            role: "user", 
                            content: `Niche: ${niche}\nNews Data:\n${fetchedContent}` 
                        }
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

            let text = response.data.choices[0].message.content;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("Sponsor Finder Error:", error.message);
            // Fallback mock
            return [
                {
                    companyName: "Acme Tech",
                    reason: "Just launched their new AI tool and need influencers to push it.",
                    coldEmail: "Hey Acme Tech team,\n\nHuge fan of your recent AI tool launch! I run a YouTube channel in this exact space with a highly engaged audience that would love this.\n\nAre you currently looking for sponsorship partners to drive signups?\n\nBest,\n[Your Name]"
                },
                {
                    companyName: "Zenith Fitness",
                    reason: "Recently closed a $10M Series B funding round for expansion.",
                    coldEmail: "Hi Zenith Team,\n\nCongrats on the recent $10M funding! With your expansion plans, I imagine you are scaling marketing.\n\nMy audience is perfectly aligned with your target demographic. Let's chat about a dedicated YouTube integration.\n\nCheers,\n[Your Name]"
                },
                {
                    companyName: "CryptoNova",
                    reason: "Rolling out a massive new feature update this month.",
                    coldEmail: "Hey CryptoNova Marketing,\n\nYour upcoming feature update looks game-changing. I'd love to break down how it works to my audience in an upcoming video.\n\nDo you have budget for creator partnerships right now?\n\nThanks,\n[Your Name]"
                }
            ];
        }
    }
    /**
     * Generate AI Voiceover using ElevenLabs
     */
    async generateVoiceover(text) {
        try {
            // Using Adam voice ID: pNInz6obpgDQGcFmaJgB
            const response = await axios.post(
                "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB",
                {
                    text: text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                },
                {
                    headers: {
                        "Accept": "audio/mpeg",
                        "xi-api-key": process.env.ELEVENLABS_API_KEY,
                        "Content-Type": "application/json"
                    },
                    responseType: "arraybuffer"
                }
            );

            // Convert arraybuffer to base64
            const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
            return `data:audio/mpeg;base64,${base64Audio}`;
        } catch (error) {
            console.error("ElevenLabs Error:", error.message);
            throw new Error("Failed to generate voiceover. Check API key or quota.");
        }
    }
}

module.exports = new AIService();
