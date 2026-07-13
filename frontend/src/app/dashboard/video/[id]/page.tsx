"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home, Video, Scissors, Folder, Settings, Search, Play, Pause, SkipBack, SkipForward,
    ZoomIn, ZoomOut, ChevronDown, Sparkles, Type, AudioLines, SlidersHorizontal, Image as ImageIcon,
    Share2, Monitor, Smartphone, Music, Layers, Undo2, Redo2, Trash2, X, Plus, 
    Copy, Moon, Sun, Save, MousePointer2, Move, LayoutTemplate, Eye, RefreshCw, BoxSelect,
    MessageSquare, Upload, Maximize, Loader2, Crop, Filter, Activity, Lock, Volume2, Mic, LockKeyhole,
    Cloud, ChevronRight, SplitSquareHorizontal, Wand2
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

    // Layout & UI State
    const [activeMediaTab, setActiveMediaTab] = useState<"all" | "videos" | "images" | "audio">("all");
    const [activeInspectorTab, setActiveInspectorTab] = useState<"video" | "audio" | "effects" | "adjust">("video");
    const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
    const [zoomLevel, setZoomLevel] = useState(1);

    // Unsplash State (Integrated into Images tab)
    const [unsplashQuery, setUnsplashQuery] = useState("");
    const [unsplashImages, setUnsplashImages] = useState<any[]>([]);
    const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false);

    // NLE State
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeClipIndex, setActiveClipIndex] = useState<number | null>(0);
    const [clips, setClips] = useState<any[]>([]);
    
    // Sliders state for Right Inspector
    const [scale, setScale] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [saturation, setSaturation] = useState(0);

    // History for Undo/Redo
    const [history, setHistory] = useState<any[][]>([]);
    const [future, setFuture] = useState<any[][]>([]);

    // AI Assistant & Comments State
    const [showComments, setShowComments] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [comments, setComments] = useState<any[]>([]);

    // Autosave & Export State
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState("");
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const data = getUserData();
        setUserData(data);
        fetchVideo();
        fetchUnsplash("cinematic b-roll");
        
        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [id]);

    // API Fetches
    const fetchVideo = async () => {
        try {
            const res = await videoAPI.getVideo(id);
            const vData = res.data;
            setVideo(vData);

            // Restore NLE State
            if (vData.editSettings?.nleState?.clips && vData.editSettings.nleState.clips.length > 0) {
                setClips(vData.editSettings.nleState.clips);
            } else {
                // Fallback mock data if brand new project
                setClips([
                    { id: "c1", title: "Video_01.mp4", startTime: "00:00", endTime: "00:15", track: 1 },
                    { id: "c2", title: "Video_02.mp4", startTime: "00:15", endTime: "00:25", track: 1 },
                    { id: "c3", title: "Video_03.mp4", startTime: "00:25", endTime: "00:40", track: 1 }
                ]);
            }

            if (vData.comments) setComments(vData.comments);

            if (vData.editSettings?.brightness) setBrightness(vData.editSettings.brightness);
            if (vData.editSettings?.contrast) setContrast(vData.editSettings.contrast);
            if (vData.editSettings?.saturation) setSaturation(vData.editSettings.saturation);

            setLastSaved("Autosaved 2m ago");

            const isRaw = (vData.status === "raw_uploaded" || vData.status === "editing_in_progress") && !!vData.rawFileUrl;
            const targetUrl = isRaw ? vData.rawFileUrl : vData.fileUrl;
            if (targetUrl && targetUrl.includes("amazonaws.com")) {
                const s3Res = await s3API.getDownloadUrl(id, isRaw);
                setSignedVideoSrc(s3Res.data.signedUrl);
            } else {
                setSignedVideoSrc(getVideoUrl(targetUrl || ""));
            }
        } catch (error) { console.error(error); }
    };

    const getVideoUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http") || path.startsWith("blob")) return path;
        const cleanPath = path.replace(/\\/g, "/");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        return `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
    };

    const fetchUnsplash = async (query: string) => {
        if (!query.trim()) return;
        setIsSearchingUnsplash(true);
        const apiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
        if (!apiKey) {
            setTimeout(() => {
                setUnsplashImages([
                    { id: 1, urls: { small: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400" }, user: { name: "Gradient" } },
                    { id: 2, urls: { small: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400" }, user: { name: "Abstract" } }
                ]);
                setIsSearchingUnsplash(false);
            }, 1000);
            return;
        }
        try {
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`, { headers: { Authorization: `Client-ID ${apiKey}` } });
            const data = await res.json();
            setUnsplashImages(data.results || []);
        } catch (error) { console.error(error); } finally { setIsSearchingUnsplash(false); }
    };

    // State & Autosave Logic
    const autoSave = (currentClips: any[]) => {
        if (!video) return; // Wait until initial load is done
        setIsSaving(true);
        setLastSaved("Saving...");
        
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            try {
                await videoAPI.updateSettings(id, {
                    brightness, contrast, saturation,
                    nleState: { clips: currentClips, activeInspectorTab }
                });
                setLastSaved("Autosaved just now");
            } catch (err) {
                setLastSaved("Save failed");
            } finally {
                setIsSaving(false);
            }
        }, 1500); // 1.5s debounce
    };

    const saveState = (currentClips: any[]) => { 
        setHistory((prev) => [...prev, currentClips]); 
        setFuture([]); 
        autoSave(currentClips);
    };

    // Trigger autosave when properties change
    useEffect(() => {
        if (video) autoSave(clips);
    }, [brightness, contrast, saturation, activeInspectorTab]);

    const handleSplit = () => { if (activeClipIndex !== null) toast.success("Clip split!"); };
    const handleDelete = () => { if (activeClipIndex !== null) toast.success("Clip deleted!"); };
    const handleUndo = () => { if (history.length > 0) toast.info("Undo successful"); };
    const handleRedo = () => { if (future.length > 0) toast.info("Redo successful"); };

    // Export Logic
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await videoAPI.approve(id);
            toast.success("Project approved and sent to YouTube Upload Queue!");
        } catch (error) {
            toast.error("Failed to export video.");
        } finally {
            setIsExporting(false);
        }
    };

    // Chat Logic
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        try {
            const res = await videoAPI.addComment(id, chatMessage);
            setComments(res.data);
            setChatMessage("");
        } catch (error) { toast.error("Failed to send message"); }
    };

    // Player Logic
    const togglePlay = () => { if (videoRef.current) { isPlaying ? videoRef.current.pause() : videoRef.current.play(); } };
    const handleTimeUpdate = () => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); };
    const handleLoadedMetadata = () => { if (videoRef.current) setDuration(videoRef.current.duration || 300); };
    const parseTimeToSeconds = (timeStr: string) => { const parts = timeStr.split(":"); return parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 0; };
    const formatTime = (seconds: number) => { const m = Math.floor((seconds || 0) / 60); const s = Math.floor((seconds || 0) % 60); return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; };
    const timelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (timelineRef.current && videoRef.current && duration > 0) {
            const rect = timelineRef.current.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = percentage * duration;
        }
    };

    return (
        <div className="h-screen bg-[#0A0A0A] text-zinc-300 flex flex-col font-sans overflow-hidden selection:bg-[#8B5CF6]/30">
            
            {/* 1. TOP BAR */}
            <header className="h-[60px] shrink-0 border-b border-white/5 bg-[#111111] flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4">
                    <img src="/mwarexlogo.png" alt="Logo" className="h-6 mr-2" />
                    <span className="text-xs text-zinc-500 font-medium">Project</span>
                    <button className="text-sm font-semibold text-white flex items-center gap-1 hover:bg-white/5 px-2 py-1 rounded">{video?.title || 'Morning Vibes'} <ChevronDown className="w-4 h-4 text-zinc-500" /></button>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 ml-4">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                        <span>{lastSaved}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleUndo} className="p-2 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors"><Undo2 className="w-4 h-4" /></button>
                    <button onClick={handleRedo} className="p-2 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors"><Redo2 className="w-4 h-4" /></button>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowComments(!showComments)} className="h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-all"><Sparkles className="w-4 h-4" /> AI Assistant</button>
                    <button onClick={() => setShowComments(!showComments)} className="h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-all"><MessageSquare className="w-4 h-4" /> Comments</button>
                    
                    <div className="flex -space-x-2 mr-2 ml-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[#111111] bg-gradient-to-br from-blue-500 to-cyan-400" />
                        <div className="w-8 h-8 rounded-full border-2 border-[#111111] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">+3</div>
                    </div>
                    
                    <button onClick={handleExport} disabled={isExporting} className="h-9 px-6 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] disabled:opacity-50">
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Export
                    </button>
                    <div className="w-8 h-8 rounded-full ml-2 overflow-hidden border border-white/10"><img src="https://ui-avatars.com/api/?name=User&background=3f3f46&color=fff" alt="User" /></div>
                </div>
            </header>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* 2. PRIMARY SIDEBAR (Far Left) */}
                <aside className="w-14 lg:w-[72px] bg-[#111111] border-r border-white/5 flex flex-col items-center py-6 shrink-0 z-10 gap-2">
                    <GlobalTool icon={<Folder />} label="Media" active />
                    <GlobalTool icon={<Music />} label="Audio" />
                    <GlobalTool icon={<Type />} label="Text" />
                    <GlobalTool icon={<Layers />} label="Elements" />
                    <GlobalTool icon={<Sparkles />} label="Effects" />
                    <GlobalTool icon={<SplitSquareHorizontal />} label="Transitions" />
                    <GlobalTool icon={<BoxSelect />} label="Brand" />
                    <GlobalTool icon={<Wand2 />} label="AI Tools" />
                    <div className="flex-1" />
                    <GlobalTool icon={<Settings />} label="Settings" />
                </aside>

                {/* 3. SECONDARY MEDIA PANEL */}
                <aside className="hidden md:flex w-[280px] lg:w-[320px] bg-[#161616] border-r border-white/5 flex-col shrink-0">
                    <div className="p-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Media</h2>
                        <button className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="px-5 mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input type="text" placeholder="Search media..." className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#8B5CF6]/50 placeholder:text-zinc-600 transition-colors" />
                        </div>
                        <button className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center hover:bg-[#8B5CF6]/20 transition-colors"><Filter className="w-4 h-4" /></button>
                        <button className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center hover:bg-[#7C3AED] shadow-lg shadow-[#8B5CF6]/20 transition-all"><Plus className="w-5 h-5" /></button>
                    </div>

                    {/* Media Tabs */}
                    <div className="px-5 mb-6 flex items-center justify-between border-b border-white/5 pb-2">
                        <MediaTab label="All" active={activeMediaTab === 'all'} onClick={() => setActiveMediaTab('all')} />
                        <MediaTab label="AI Clips" active={activeMediaTab === 'videos'} onClick={() => setActiveMediaTab('videos')} />
                        <MediaTab label="Images" active={activeMediaTab === 'images'} onClick={() => setActiveMediaTab('images')} />
                        <MediaTab label="Audio" active={activeMediaTab === 'audio'} onClick={() => setActiveMediaTab('audio')} />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5 space-y-6">
                        
                        {/* Folders Section */}
                        {activeMediaTab === 'all' && (
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Folders</p>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                                    <div className="flex items-center gap-3"><Folder className="w-4 h-4 text-white fill-white/20" /><span className="text-xs font-semibold text-white">Imported</span></div>
                                    <span className="text-xs text-zinc-500">128</span>
                                </div>
                            </div>
                        )}

                        {/* AI Clips Section with Publish Workflow */}
                        {activeMediaTab === 'videos' && (
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Generated AI Clips</p>
                                <div className="space-y-4">
                                    {clips.map((clip, i) => (
                                        <div key={i} className="group rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all flex flex-col relative">
                                            <div className="aspect-video bg-zinc-900 relative">
                                                <img src={`https://source.unsplash.com/random/400x225?nature&sig=${i+10}`} className="w-full h-full object-cover opacity-80" alt="" />
                                                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white backdrop-blur-sm">{clip.duration || "00:15"}</div>
                                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[#8B5CF6]/90 text-[9px] font-bold text-white backdrop-blur-sm">Score: 95/100</div>
                                            </div>
                                            <div className="p-3">
                                                <p className="text-[11px] font-semibold text-zinc-300 mb-1 truncate">{clip.title || `Viral Clip ${i+1}`}</p>
                                                
                                                {/* Publish Dropdown Logic inside the clip */}
                                                <div className="mt-3 relative group/publish">
                                                    <button className="w-full py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all">
                                                        <Share2 className="w-3 h-3" /> Publish
                                                    </button>
                                                    
                                                    {/* Dropdown Menu */}
                                                    <div className="absolute bottom-full left-0 w-full mb-1 bg-[#111111] border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover/publish:opacity-100 group-hover/publish:visible transition-all flex flex-col overflow-hidden z-20">
                                                        <button onClick={() => { toast.success(`Publishing ${clip.title} to YouTube...`); handleExport(); }} className="px-3 py-2 text-[10px] font-semibold text-white hover:bg-red-500/20 hover:text-red-400 text-left flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> YouTube</button>
                                                        <button onClick={() => { toast.success(`Publishing ${clip.title} to LinkedIn...`); handleExport(); }} className="px-3 py-2 text-[10px] font-semibold text-white hover:bg-blue-500/20 hover:text-blue-400 text-left flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> LinkedIn</button>
                                                        <button onClick={() => { toast.success(`Publishing ${clip.title} to Instagram...`); handleExport(); }} className="px-3 py-2 text-[10px] font-semibold text-white hover:bg-pink-500/20 hover:text-pink-400 text-left flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /> Instagram</button>
                                                        <button onClick={() => { toast.success(`Publishing ${clip.title} to X.com...`); handleExport(); }} className="px-3 py-2 text-[10px] font-semibold text-white hover:bg-zinc-500/20 hover:text-zinc-300 text-left flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-400" /> X.com</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unsplash Integration (Images Tab) */}
                        {activeMediaTab === 'images' && (
                            <div>
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                    <input type="text" value={unsplashQuery} onChange={(e) => setUnsplashQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUnsplash(unsplashQuery)} placeholder="Search Unsplash API..." className="w-full bg-[#0A0A0A] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#8B5CF6]/50 placeholder:text-zinc-600" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {isSearchingUnsplash ? (
                                        <div className="col-span-2 py-10 flex flex-col items-center justify-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mb-2" /><span className="text-[10px]">Fetching...</span></div>
                                    ) : unsplashImages.map((img) => (
                                        <div key={img.id} className="group cursor-pointer rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-[#8B5CF6]/50 transition-all relative aspect-video">
                                            <img src={img.urls.small} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="" />
                                            <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent"><span className="text-[8px] text-zinc-300 truncate block">{img.user.name}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* 4. MAIN PLAYER CANVAS & AI TOOLBAR */}
                <div className="flex-1 flex flex-col bg-[#0A0A0A] relative overflow-hidden">
                    
                    {/* Top Canvas Header (Aspect Ratio / Fit) */}
                    <div className="h-16 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold text-white transition-colors">16:9 <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /></button>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold text-white transition-colors">Fit <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /></button>
                            <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 transition-colors"><Maximize className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* The Player Area */}
                    <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
                        <div className="w-full max-w-5xl aspect-video bg-[#050505] rounded-2xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                            
                            {/* Real Video Element */}
                            {signedVideoSrc ? (
                                <video 
                                    ref={videoRef} 
                                    src={signedVideoSrc} 
                                    className="w-full h-full object-contain" 
                                    onTimeUpdate={handleTimeUpdate} 
                                    onLoadedMetadata={handleLoadedMetadata} 
                                    onClick={togglePlay}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-[#0A0A0A]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#8B5CF6]" />
                                    <span className="text-xs font-semibold text-zinc-400">Loading Original Video...</span>
                                </div>
                            )}
                            
                            {/* Overlay Controls */}
                            <div className={cn(
                                "absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end px-6 pb-4 transition-opacity duration-300",
                                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                            )}>
                                <div className="flex items-center justify-between w-full text-white">
                                    <span className="text-xs font-mono font-medium tracking-wide">{formatTime(currentTime)} <span className="text-zinc-500">/ {formatTime(duration)}</span></span>
                                    <div className="flex items-center gap-6">
                                        <button className="text-zinc-300 hover:text-white"><SkipBack className="w-5 h-5 fill-current" /></button>
                                        <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                        </button>
                                        <button className="text-zinc-300 hover:text-white"><SkipForward className="w-5 h-5 fill-current" /></button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-xs font-semibold px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1">1.0x <ChevronDown className="w-3 h-3" /></button>
                                        <button className="text-zinc-300 hover:text-white"><Volume2 className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Toolbar (Directly beneath player) */}
                        <div className="mt-8 flex items-center gap-3">
                            <AIToolbarBtn icon={<Scissors />} label="AI Auto Cut" />
                            <AIToolbarBtn icon={<Mic />} label="Remove Silence" />
                            <AIToolbarBtn icon={<Type />} label="Generate Captions" />
                            <AIToolbarBtn icon={<ImageIcon />} label="AI B-Roll" />
                            <AIToolbarBtn icon={<Sparkles />} label="Color Enhance" />
                            <AIToolbarBtn icon={<ZoomIn />} label="Smart Zoom" hasChevron />
                        </div>
                    </div>
                </div>

                {/* 5. RIGHT INSPECTOR PANEL */}
                <aside className="hidden xl:flex w-[340px] bg-[#111111] border-l border-white/5 flex-col shrink-0">
                    {/* Inspector Tabs */}
                    <div className="flex items-center px-4 pt-4 border-b border-white/5 gap-6">
                        <InspectorTab label="Video" active={activeInspectorTab === 'video'} onClick={() => setActiveInspectorTab('video')} />
                        <InspectorTab label="Audio" active={activeInspectorTab === 'audio'} onClick={() => setActiveInspectorTab('audio')} />
                        <InspectorTab label="Effects" active={activeInspectorTab === 'effects'} onClick={() => setActiveInspectorTab('effects')} />
                        <InspectorTab label="Adjust" active={activeInspectorTab === 'adjust'} onClick={() => setActiveInspectorTab('adjust')} />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        {activeInspectorTab === 'video' && (
                            <>
                                {/* Transform Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-6 cursor-pointer">
                                        <h3 className="text-sm font-bold text-white">Transform</h3>
                                        <ChevronDown className="w-4 h-4 text-zinc-500 rotate-180" />
                                    </div>
                                    <div className="space-y-6">
                                        {/* Scale */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between"><span className="text-xs text-zinc-400">Scale</span><div className="flex items-center gap-1"><span className="text-xs font-mono text-white bg-[#0A0A0A] border border-white/5 px-2 py-1 rounded w-14 text-center">{scale}</span><span className="text-xs text-zinc-500">%</span></div></div>
                                            <div className="h-1 w-full bg-[#161616] rounded-full relative"><div className="absolute left-0 h-full bg-zinc-600 rounded-full w-1/2" /><div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer" /></div>
                                        </div>
                                        
                                        {/* Position */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">Position</span>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/5 px-3 py-1.5 rounded"><span className="text-[10px] text-zinc-500 font-medium uppercase">X</span><span className="text-xs font-mono text-white">0</span></div>
                                                <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/5 px-3 py-1.5 rounded"><span className="text-[10px] text-zinc-500 font-medium uppercase">Y</span><span className="text-xs font-mono text-white">0</span></div>
                                            </div>
                                        </div>

                                        {/* Rotate */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">Rotate</span>
                                            <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/5 px-3 py-1.5 rounded w-20 justify-between cursor-pointer"><span className="text-xs font-mono text-white">0°</span><ChevronDown className="w-3 h-3 text-zinc-500" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* Crop Section */}
                                <div className="flex items-center justify-between cursor-pointer group">
                                    <h3 className="text-sm font-bold text-white group-hover:text-zinc-300">Crop</h3>
                                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* Speed Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-6 cursor-pointer">
                                        <h3 className="text-sm font-bold text-white">Speed</h3>
                                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between"><span className="text-xs text-zinc-400">1.0x</span><div className="bg-[#0A0A0A] border border-white/5 px-3 py-1.5 rounded w-16 text-center"><span className="text-xs font-mono text-white">1.0 x</span></div></div>
                                        <div className="h-1 w-full bg-[#161616] rounded-full relative"><div className="absolute left-0 h-full bg-zinc-600 rounded-full w-1/4" /><div className="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer" /></div>
                                    </div>
                                </div>

                                {/* Opacity Section */}
                                <div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between"><span className="text-xs text-zinc-400">Opacity</span><div className="flex items-center gap-1"><span className="text-xs font-mono text-white bg-[#0A0A0A] border border-white/5 px-2 py-1 rounded w-14 text-center">100</span><span className="text-xs text-zinc-500">%</span></div></div>
                                        <div className="h-1 w-full bg-[#161616] rounded-full relative"><div className="absolute left-0 h-full bg-zinc-600 rounded-full w-full" /><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer" /></div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* Color Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 cursor-pointer">
                                        <h3 className="text-sm font-bold text-white">Color</h3>
                                        <ChevronDown className="w-4 h-4 text-zinc-500 rotate-180" />
                                    </div>
                                    <button className="flex items-center justify-between w-24 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/5 text-xs font-semibold text-white mb-6">Basic <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /></button>
                                    
                                    <div className="space-y-6">
                                        <SliderControl label="Brightness" value={brightness} setValue={setBrightness} />
                                        <SliderControl label="Contrast" value={contrast} setValue={setContrast} />
                                        <SliderControl label="Saturation" value={saturation} setValue={setSaturation} />
                                    </div>
                                </div>

                                <button className="w-full py-3 mt-4 rounded-xl border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Apply to all</button>
                            </>
                        )}
                    </div>
                </aside>

            </div>

            {/* 6. ADVANCED BOTTOM TIMELINE */}
            <div className="h-[280px] shrink-0 bg-[#0A0A0A] border-t border-white/5 flex flex-col z-20">
                
                {/* Timeline Tools Header */}
                <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#111111]">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <button className="hover:text-white"><Undo2 className="w-4 h-4" /></button>
                        <button className="hover:text-white"><Redo2 className="w-4 h-4" /></button>
                        <button className="hover:text-white"><Trash2 className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button className="hover:text-white"><Scissors className="w-4 h-4" /></button>
                        <button className="hover:text-white"><Crop className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                        <div className="w-24 h-1 bg-[#161616] rounded-full relative flex items-center">
                            <div className="absolute left-3/4 w-2.5 h-2.5 bg-white rounded-full shadow" />
                        </div>
                        <ZoomIn className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    
                    {/* Track Headers (Left Side) */}
                    <div className="hidden md:flex w-[160px] lg:w-[200px] bg-[#111111] border-r border-white/5 flex-col z-10 shrink-0">
                        <div className="h-8 border-b border-white/5 bg-[#0A0A0A]" /> {/* Ruler Spacer */}
                        
                        <div className="flex-1 flex flex-col pt-2 space-y-1 px-2">
                            {/* Video Track Header */}
                            <div className="h-14 rounded-lg bg-white/5 flex items-center px-3 gap-3 group">
                                <Video className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-semibold text-zinc-300 flex-1">Video Track</span>
                                <div className="flex gap-2 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <LockKeyhole className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                    <Eye className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                    <Volume2 className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                </div>
                            </div>
                            
                            {/* Audio Track Header */}
                            <div className="h-10 rounded-lg bg-transparent flex items-center px-3 gap-3 group">
                                <Music className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-500 flex-1">Audio Track</span>
                                <div className="flex gap-2 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <LockKeyhole className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                    <Eye className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                    <Volume2 className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                </div>
                            </div>

                            {/* Text Track Header */}
                            <div className="h-10 rounded-lg bg-transparent flex items-center px-3 gap-3 group">
                                <Type className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-500 flex-1">Text Track</span>
                                <div className="flex gap-2 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <LockKeyhole className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                </div>
                            </div>

                            {/* Effects Track Header */}
                            <div className="h-10 rounded-lg bg-transparent flex items-center px-3 gap-3 group">
                                <Sparkles className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-500 flex-1">Effects Track</span>
                                <div className="flex gap-2 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <LockKeyhole className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                    <Eye className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Grid & Tracks */}
                    <div className="flex-1 bg-[#0A0A0A] relative overflow-hidden flex flex-col">
                        
                        {/* Ruler */}
                        <div className="h-8 border-b border-white/5 relative">
                            <div className="absolute inset-0 flex justify-between text-[10px] text-zinc-600 font-mono items-end pb-1 px-4 select-none">
                                <span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span><span>00:25</span><span>00:30</span><span>00:35</span><span>00:40</span>
                            </div>
                        </div>

                        {/* Tracks Area (Scrollable) */}
                        <div className="flex-1 relative pt-2">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
                                {[...Array(9)].map((_, i) => <div key={i} className="w-px h-full bg-white/[0.02]" />)}
                            </div>

                            {/* Video Track Lane */}
                            <div className="h-14 relative px-4 flex items-center">
                                {/* Simulated Continuous Video Clip with thumbnails inside */}
                                <div className="absolute left-4 right-[20%] h-12 rounded-lg border-2 border-[#8B5CF6] overflow-hidden flex bg-zinc-900 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                                    {[...Array(6)].map((_, i) => (
                                        <img key={i} src={`https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=200&h=100&auto=format&fit=crop&sig=${i}`} className="h-full flex-1 object-cover border-r border-black/50" alt="" />
                                    ))}
                                </div>
                            </div>

                            {/* Audio Track Lane */}
                            <div className="h-10 relative px-4 flex items-center mt-1">
                                <div className="absolute left-4 right-[10%] h-8 rounded-lg bg-emerald-900/40 border border-emerald-500/20 overflow-hidden flex items-center px-2">
                                    <span className="text-[10px] font-semibold text-emerald-400 absolute z-10 bg-emerald-900/80 px-1 rounded">Chill Background Music.mp3</span>
                                    {/* Mock Waveform */}
                                    <div className="w-full h-full flex items-center justify-between opacity-50 px-20">
                                        {[...Array(100)].map((_, i) => <div key={i} className="w-0.5 bg-emerald-500 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }} />)}
                                    </div>
                                </div>
                            </div>

                            {/* Text Track Lane */}
                            <div className="h-10 relative px-4 flex items-center mt-1">
                                <div className="absolute left-10 w-48 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center px-3 gap-2">
                                    <Type className="w-3.5 h-3.5 text-[#8B5CF6]" />
                                    <span className="text-[10px] font-semibold text-white">Exploring the world</span>
                                </div>
                                <div className="absolute left-[35%] w-40 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center px-3 gap-2">
                                    <Type className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-semibold text-white">Live in the moment</span>
                                </div>
                            </div>

                            {/* Effects Track Lane */}
                            <div className="h-10 relative px-4 flex items-center mt-1">
                                <div className="absolute left-10 w-[60%] h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center px-3 gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[10px] font-semibold text-blue-400">Glow Effect</span>
                                </div>
                            </div>

                            {/* THE PLAYHEAD */}
                            <div className="absolute top-0 bottom-0 w-px bg-white z-30 pointer-events-none" style={{ left: '42%' }}>
                                <div className="absolute -top-3 -translate-x-1/2 w-4 h-5 bg-white rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                    <Scissors className="w-2.5 h-2.5 text-black" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Slide-out AI Assistant / Comments Panel */}
            <AnimatePresence>
                {showComments && (
                    <motion.div 
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="absolute right-0 top-[60px] bottom-0 w-[380px] bg-[#111111] border-l border-white/5 z-40 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#8B5CF6]" /> Project Chat & AI</h2>
                            <button onClick={() => setShowComments(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {comments.length === 0 ? (
                                <div className="text-center text-zinc-500 text-xs mt-10">No comments yet. Say hi!</div>
                            ) : comments.map((c, i) => (
                                <div key={i} className={cn("flex flex-col max-w-[85%]", c.isAI ? "items-start" : "items-end ml-auto")}>
                                    <span className="text-[10px] text-zinc-500 mb-1">{c.isAI ? "AI Editor" : "You"}</span>
                                    <div className={cn("px-3 py-2 rounded-xl text-sm", c.isAI ? "bg-white/10 text-white rounded-tl-none" : "bg-[#8B5CF6] text-white rounded-tr-none")}>
                                        {c.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#0A0A0A]">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="Tell AI to edit, or leave a comment..." 
                                    className="w-full bg-[#161616] border border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/50 placeholder:text-zinc-600" 
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center hover:bg-[#7C3AED] transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Custom Sub-components for 1:1 match
function GlobalTool({ icon, label, active }: any) {
    return (
        <button className={cn("w-14 flex flex-col items-center gap-1.5 py-3 transition-colors relative", active ? "text-[#8B5CF6]" : "text-zinc-500 hover:text-zinc-300")}>
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#8B5CF6] rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
            <div className={cn("p-2 rounded-xl transition-colors", active ? "bg-[#8B5CF6]/10" : "")}>
                {React.cloneElement(icon, { className: "w-5 h-5" })}
            </div>
            <span className="text-[9px] font-medium tracking-wide">{label}</span>
        </button>
    );
}

function MediaTab({ label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={cn("px-1 py-2 text-xs font-semibold relative transition-colors", active ? "text-white" : "text-zinc-500 hover:text-zinc-300")}>
            {label}
            {active && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8B5CF6] rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />}
        </button>
    );
}

function AIToolbarBtn({ icon, label, hasChevron }: any) {
    return (
        <button className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-2 text-zinc-300 text-xs font-semibold">
            {React.cloneElement(icon, { className: "w-3.5 h-3.5" })}
            {label}
            {hasChevron && <ChevronRight className="w-3.5 h-3.5 text-zinc-500 ml-1" />}
        </button>
    );
}

function InspectorTab({ label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={cn("pb-3 text-xs font-bold relative transition-colors", active ? "text-white" : "text-zinc-500 hover:text-zinc-300")}>
            {label}
            {active && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8B5CF6] rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />}
        </button>
    );
}

function SliderControl({ label, value, setValue }: any) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between"><span className="text-xs text-zinc-400">{label}</span><div className="bg-[#0A0A0A] border border-white/5 px-3 py-1.5 rounded w-14 text-center"><span className="text-xs font-mono text-white">{value}</span></div></div>
            <div className="h-1 w-full bg-[#161616] rounded-full relative"><div className="absolute left-1/2 h-full bg-zinc-600 rounded-full" style={{ width: `${Math.abs(value)}%`, right: value < 0 ? '50%' : 'auto', left: value < 0 ? 'auto' : '50%' }} /><div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer" style={{ left: `${50 + (value / 2)}%` }} /></div>
        </div>
    );
}
