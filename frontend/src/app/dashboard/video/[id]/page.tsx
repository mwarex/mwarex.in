"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home, Video, Scissors, Folder, Puzzle, CreditCard, Settings, LogOut,
    Search, Bell, Download, Edit3, Play, Pause, SkipBack, SkipForward,
    ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Sparkles, CheckCircle2
} from "lucide-react";
import { videoAPI, s3API } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getUserData } from "@/lib/auth";

export default function ProjectWorkspace() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [video, setVideo] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [signedVideoSrc, setSignedVideoSrc] = useState<string>("");

    // NLE State
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const [activeClipIndex, setActiveClipIndex] = useState(0);
    const [clips, setClips] = useState<any[]>([]);

    useEffect(() => {
        const data = getUserData();
        setUserData(data);
        fetchVideo();
    }, [id]);

    useEffect(() => {
        if (video) {
            if (video.clips && video.clips.length > 0) {
                setClips(video.clips);
            } else {
                const baseTitle = video.title || "Video";
                setClips([
                    {
                        id: "clip-1", score: "9.8/10", duration: "00:45",
                        title: `Best moment from: ${baseTitle}`,
                        hashtags: "#MWareX #AIContent #Viral",
                        startTime: "00:00", endTime: "00:45"
                    },
                    {
                        id: "clip-2", score: "8.5/10", duration: "00:30",
                        title: `Highlight: Automating video workflows with MWareX`,
                        hashtags: "#VideoEditing #CreatorEconomy #SaaS",
                        startTime: "01:15", endTime: "01:45"
                    },
                    {
                        id: "clip-3", score: "7.9/10", duration: "00:55",
                        title: `Key takeaway from ${baseTitle}`,
                        hashtags: "#Insights #Startup #Growth",
                        startTime: "02:30", endTime: "03:25"
                    }
                ]);
            }
        }
    }, [video]);

    const fetchVideo = async () => {
        try {
            const res = await videoAPI.getVideo(id);
            setVideo(res.data);
            const isRaw = (res.data.status === "raw_uploaded" || res.data.status === "editing_in_progress") && !!res.data.rawFileUrl;
            const targetUrl = isRaw ? res.data.rawFileUrl : res.data.fileUrl;
            if (targetUrl && targetUrl.includes("amazonaws.com")) {
                const s3Res = await s3API.getDownloadUrl(id, isRaw);
                setSignedVideoSrc(s3Res.data.signedUrl);
            } else {
                setSignedVideoSrc(getVideoUrl(targetUrl || ""));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getVideoUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http") || path.startsWith("blob")) return path;
        const cleanPath = path.replace(/\\/g, "/");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const safeBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const safePath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
        return `${safeBase}${safePath}`;
    };

    // NLE Player Logic
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    };

    const parseTimeToSeconds = (timeStr: string) => {
        const parts = timeStr.split(":");
        if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        return 0;
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const skipTime = (amount: number) => {
        if (videoRef.current) videoRef.current.currentTime += amount;
    };

    const seekToClip = (idx: number) => {
        setActiveClipIndex(idx);
        if (videoRef.current && clips[idx]) {
            const startSec = parseTimeToSeconds(clips[idx].startTime);
            videoRef.current.currentTime = startSec;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-primary/30">
            {/* Top Navigation */}
            <header className="h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4 text-sm font-medium">
                    <button onClick={() => router.push('/dashboard/creator')} className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <span className="text-zinc-500 cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => router.push('/dashboard/creator')}>Home</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-zinc-500">Project</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-zinc-500">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-zinc-100 font-semibold tracking-tight">{video?.title || "Loading..."}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-primary tracking-tight">2,450 <span className="opacity-70 font-normal">credits</span></span>
                    </div>
                    <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
                        <Search className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
                        <Bell className="w-4 h-4 text-zinc-400" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm cursor-pointer ml-2 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                        {userData?.name?.[0]?.toUpperCase() || "S"}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Global Left Sidebar */}
                <aside className="w-16 border-r border-white/5 bg-zinc-950/50 flex flex-col items-center py-6 gap-6 z-10 shrink-0">
                    <button className="p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-all">
                        <Home className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-all">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-all">
                        <Scissors className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-all">
                        <Folder className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-all">
                        <Puzzle className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1" />

                    <button className="p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button onClick={() => router.push('/dashboard/creator')} className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                </aside>

                {/* Workspace Content */}
                <div className="flex-1 flex bg-[#0a0a0a] p-4 lg:p-6 gap-4 lg:gap-6 overflow-hidden">
                    
                    {/* Column 1: Clips List */}
                    <div className="w-[320px] flex flex-col bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
                        <div className="p-4 border-b border-white/5 space-y-4 bg-zinc-950/40">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search keyword or #"
                                    className="w-full bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-600"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="flex-1 py-1.5 text-xs font-semibold tracking-wide rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-300">Merged</button>
                                <button className="flex-1 py-1.5 text-xs font-semibold tracking-wide rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-300">Ratings ▼</button>
                                <button className="flex-1 py-1.5 text-xs font-semibold tracking-wide rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-300">Lifetime</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <AnimatePresence>
                                {clips.map((clip, idx) => (
                                    <motion.div 
                                        key={clip.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => seekToClip(idx)}
                                        className={cn(
                                            "p-4 rounded-xl border transition-all cursor-pointer relative group",
                                            activeClipIndex === idx 
                                                ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.05)]" 
                                                : "border-white/5 bg-black/20 hover:border-white/20 hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded border border-primary/50 flex items-center justify-center bg-black/50">
                                                    {activeClipIndex === idx && <div className="w-2 h-2 rounded-[2px] bg-primary shadow-[0_0_5px_rgba(var(--primary),0.8)]" />}
                                                </div>
                                                <span className="font-bold text-sm tracking-tight text-zinc-200">Clip :{idx + 1}</span>
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider",
                                                    parseFloat(clip.score) > 8 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                    parseFloat(clip.score) > 5 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                )}>
                                                    {clip.score}
                                                </span>
                                            </div>
                                            <div className="px-2 py-1 bg-white/10 text-zinc-300 text-[10px] font-bold tracking-wider rounded-md border border-white/5">
                                                {clip.duration}
                                            </div>
                                        </div>

                                        <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2 text-zinc-100">{clip.title}</h3>
                                        
                                        <p className="text-[10px] text-zinc-500 mb-1 font-medium tracking-wide">Hashtags: <span className="text-primary/80">{clip.hashtags}</span></p>
                                        <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Start: {clip.startTime} — End: {clip.endTime}</p>

                                        <div className="flex gap-2 mt-4">
                                            {activeClipIndex === idx ? (
                                                <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs tracking-wide hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                                                    Publish
                                                </button>
                                            ) : (
                                                <button className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs tracking-wide hover:bg-white/10 transition-colors">
                                                    Export
                                                </button>
                                            )}
                                            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Column 2: Player & Timeline */}
                    <div className="flex-1 flex flex-col bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex-1 p-2 lg:p-4 flex items-center justify-center bg-black/80 relative">
                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none rounded-full scale-75 opacity-50" />
                            
                            {signedVideoSrc ? (
                                <video
                                    ref={videoRef}
                                    src={signedVideoSrc}
                                    className="w-full h-full max-h-[500px] object-contain rounded-xl z-10"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onClick={togglePlay}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-600 z-10">
                                    <Play className="w-12 h-12 opacity-20" />
                                    <p className="text-sm font-medium tracking-wide">Video Player Placeholder</p>
                                </div>
                            )}
                        </div>

                        {/* NLE Timeline Editor */}
                        <div className="h-[220px] bg-zinc-950 p-4 flex flex-col gap-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-500 text-xs font-semibold tracking-wide cursor-not-allowed">Save Changes</button>
                                    <button className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-500 text-xs font-semibold tracking-wide cursor-not-allowed">Merge</button>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <button onClick={() => skipTime(-5)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
                                    <button 
                                        onClick={togglePlay}
                                        className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center hover:scale-105 hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                    </button>
                                    <button onClick={() => skipTime(5)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
                                    
                                    <div className="w-px h-6 bg-white/10 mx-2" />
                                    <span className="font-mono text-sm tracking-widest text-zinc-300 font-medium">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 transition-colors"><ZoomOut className="w-4 h-4" /></button>
                                    <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 transition-colors"><ZoomIn className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Actual Timeline Track */}
                            <div className="flex-1 bg-black/50 rounded-xl border border-white/5 relative overflow-hidden flex flex-col p-2">
                                {/* Time markers */}
                                <div className="flex justify-between text-[10px] text-zinc-600 px-2 font-mono pb-2 border-b border-white/5">
                                    <span>0:00</span>
                                    <span>{formatTime(duration * 0.33)}</span>
                                    <span>{formatTime(duration * 0.66)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                                
                                {/* Track container */}
                                <div className="flex-1 relative mt-3 px-2 flex items-center group cursor-text">
                                    
                                    {/* Clip Blocks - Simulating NLE tracks based on our clips */}
                                    {clips.map((clip, idx) => {
                                        const startPct = (parseTimeToSeconds(clip.startTime) / (duration || 100)) * 100;
                                        const widthPct = ((parseTimeToSeconds(clip.endTime) - parseTimeToSeconds(clip.startTime)) / (duration || 100)) * 100;
                                        
                                        return (
                                            <div 
                                                key={idx}
                                                className={cn(
                                                    "absolute h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all shadow-lg",
                                                    activeClipIndex === idx 
                                                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] z-10" 
                                                        : "bg-white/10 border-white/20 text-zinc-400 hover:bg-white/20"
                                                )}
                                                style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                                                onClick={() => seekToClip(idx)}
                                            >
                                                {idx + 1}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* The moving Playhead */}
                                    <div 
                                        className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.8)] pointer-events-none transition-all duration-100 ease-linear"
                                        style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                                    >
                                        <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rotate-45 bg-red-500 rounded-[1px]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Clip Details Panel */}
                    <div className="w-[280px] flex flex-col bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shrink-0 shadow-2xl p-5 space-y-4 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="font-bold text-sm tracking-tight text-zinc-100">Clip Inspector</h2>
                            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-zinc-300 flex items-center justify-center hover:bg-white/10 transition-all">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="group">
                                <p className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-widest group-hover:text-primary transition-colors">Video Title <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                                <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-primary/30 transition-all">
                                    <p className="text-xs font-medium leading-snug text-zinc-200">{clips[activeClipIndex]?.title || "Loading..."}</p>
                                </div>
                            </div>

                            <div className="group">
                                <p className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-widest group-hover:text-primary transition-colors">Description <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                                <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-primary/30 transition-all">
                                    <p className="text-xs text-zinc-400 leading-relaxed">A concise, high-impact clip prepared for publishing across social channels.</p>
                                </div>
                            </div>

                            <div className="group">
                                <p className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-widest group-hover:text-primary transition-colors">Hashtags <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                                <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-primary/30 transition-all">
                                    <p className="text-xs font-medium text-primary/80">{clips[activeClipIndex]?.hashtags || "#MWareX"}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-widest">Thumbnail</p>
                                <div className="flex gap-3">
                                    <div className="w-24 h-36 rounded-xl bg-black/60 border border-white/10 shadow-inner overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-white font-medium">Auto-generated</span>
                                        </div>
                                    </div>
                                    <div className="w-24 h-36 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all text-zinc-500 hover:text-primary group">
                                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <span className="text-lg font-light">+</span>
                                        </div>
                                        <span className="text-[10px] font-medium tracking-wide">Custom</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
