"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Home,
    Video,
    Scissors,
    Folder,
    Puzzle,
    CreditCard,
    Settings,
    LogOut,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    Crop,
    Type,
    MessageSquare,
    Image as ImageIcon,
    LayoutTemplate,
    Maximize,
    Minimize,
    LayoutGrid,
    Wand2,
    ChevronDown
} from "lucide-react";
import { videoAPI, s3API } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getUserData } from "@/lib/auth";

export default function ClipEditorWorkspace() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const clipId = params.clipId as string;

    const [video, setVideo] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [signedVideoSrc, setSignedVideoSrc] = useState<string>("");
    const [activeTool, setActiveTool] = useState("reframe");

    useEffect(() => {
        const data = getUserData();
        setUserData(data);
        fetchVideo();
    }, [id]);

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

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans h-screen overflow-hidden">
            {/* Top Navigation */}
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-4 text-sm font-medium">
                    <button onClick={() => router.push('/dashboard/creator')} className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
                        <Home className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push('/dashboard/creator')}>Home</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push(`/dashboard/video/${id}`)}>Project</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground truncate max-w-[150px]">{video?.title || "Video"}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium">
                        <span className="text-primary">⚡</span>
                        <span>2,450 <span className="text-muted-foreground font-normal">credits</span></span>
                    </div>
                    <button className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors border border-border">
                        <Search className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors border border-border">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm cursor-pointer ml-2">
                        {userData?.name?.[0]?.toUpperCase() || "Y"}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Global Left Sidebar */}
                <aside className="w-16 border-r border-border bg-card/30 flex flex-col items-center py-6 gap-6 z-10 shrink-0">
                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                        <Home className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-all">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                        <Scissors className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                        <Folder className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                        <Puzzle className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                        <CreditCard className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1" />

                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button onClick={() => router.push('/dashboard/creator')} className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                </aside>

                {/* Main Editor Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Toolbar / Breadcrumbs */}
                    <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-border/50">
                        <div className="flex items-center gap-3 text-sm font-semibold">
                            <button onClick={() => router.push(`/dashboard/video/${id}`)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <span className="text-muted-foreground">Project {id.slice(-8)}</span>
                            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                            <span className="text-foreground">Clip No 1 : CEO reveals groundbreaking AI infrastructure</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-secondary transition-colors text-sm font-bold">
                                Save <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="px-6 py-2 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-bold">
                                Publish
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Center Canvases & Bottom Timeline */}
                        <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                            
                            {/* Dual Canvas Area */}
                            <div className="flex-1 flex gap-6 overflow-hidden min-h-[300px]">
                                {/* Canvas 1: Editor */}
                                <div className="flex-1 bg-card/40 border border-border rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-sm group">
                                    <div className="absolute top-4 left-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs font-semibold border border-white/10 hover:bg-black/80">
                                            <Maximize className="w-3.5 h-3.5" /> 16:9
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs font-semibold border border-white/10 hover:bg-black/80">
                                            <Minimize className="w-3.5 h-3.5" /> Fit Height
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs font-semibold border border-white/10 hover:bg-black/80">
                                            <LayoutGrid className="w-3.5 h-3.5" /> Layout
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/20 text-primary text-xs font-bold border border-primary/30 hover:bg-primary/30 backdrop-blur">
                                            <Wand2 className="w-3.5 h-3.5" /> AI Reframe
                                        </button>
                                    </div>

                                    {/* Video Container Mockup */}
                                    <div className="relative w-full max-w-[600px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
                                        {signedVideoSrc ? (
                                            <video src={signedVideoSrc} className="w-full h-full object-cover opacity-70 blur-[1px]" />
                                        ) : (
                                            <div className="text-muted-foreground text-sm font-medium">Video Source</div>
                                        )}
                                        {/* Crop Box Overlay */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[90%] aspect-[9/16] border-2 border-primary border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                                            {/* Handles */}
                                            <div className="absolute top-0 left-0 w-2 h-2 bg-primary -translate-x-1/2 -translate-y-1/2 rounded-full" />
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-primary translate-x-1/2 -translate-y-1/2 rounded-full" />
                                            <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary -translate-x-1/2 translate-y-1/2 rounded-full" />
                                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary translate-x-1/2 translate-y-1/2 rounded-full" />
                                            
                                            <div className="text-white font-black text-4xl drop-shadow-lg opacity-90 text-center leading-tight">
                                                <span className="text-yellow-400">9</span><br/>सेकंड में<br/>न्यूज़
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Canvas 2: Live Preview */}
                                <div className="flex-1 bg-card/40 border border-border rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm relative">
                                    <div className="absolute bottom-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Clip Preview</div>
                                    <div className="relative h-full max-h-[500px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border border-white/5">
                                        {signedVideoSrc ? (
                                            <video src={signedVideoSrc} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                                                <div className="text-white font-black text-5xl drop-shadow-lg text-center leading-tight">
                                                    <span className="text-yellow-400">9</span><br/>सेकंड में<br/>न्यूज़
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Timeline */}
                            <div className="h-[220px] bg-card/40 border border-border rounded-2xl flex flex-col p-4 shadow-sm shrink-0">
                                {/* Toolbar */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-3 w-[200px]">
                                        <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><ZoomOut className="w-4 h-4" /></button>
                                        <input type="range" className="flex-1 accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer" />
                                        <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><ZoomIn className="w-4 h-4" /></button>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <span className="font-mono text-xs font-semibold w-24 text-right">00:11 / 04:12</span>
                                        <div className="flex items-center gap-3">
                                            <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><SkipBack className="w-4 h-4" /></button>
                                            <button className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity pl-1 shadow-lg">
                                                <Play className="w-5 h-5 fill-current" />
                                            </button>
                                            <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><SkipForward className="w-4 h-4" /></button>
                                        </div>
                                        <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Volume2 className="w-4 h-4" /></button>
                                    </div>

                                    <div className="flex items-center gap-3 w-[200px] justify-end">
                                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Undo2 className="w-4 h-4" /></button>
                                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Redo2 className="w-4 h-4" /></button>
                                        <div className="px-2 py-1 rounded border border-border text-xs font-bold text-muted-foreground bg-secondary/30">1x</div>
                                        <button className="px-5 py-2 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity shadow-md">Apply</button>
                                    </div>
                                </div>

                                {/* Tracks Container */}
                                <div className="flex-1 bg-background rounded-xl border border-border relative overflow-hidden flex flex-col">
                                    <div className="flex justify-between text-[10px] text-muted-foreground px-4 py-2 border-b border-border font-mono">
                                        <span>00:00</span>
                                        <span>01:00</span>
                                        <span>02:00</span>
                                        <span>03:00</span>
                                        <span>04:00</span>
                                        <span>04:12</span>
                                    </div>
                                    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative px-4 flex items-center min-w-max pb-2">
                                        {/* Scenes */}
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="h-12 w-20 border-r border-border shrink-0 flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer first:rounded-l-lg last:rounded-r-lg border-y border-l first:border-l border-border">
                                                <span className="text-[10px] text-muted-foreground font-semibold">Scene</span>
                                                <span className="text-xs font-bold text-foreground">- {i + 1}</span>
                                            </div>
                                        ))}
                                        
                                        {/* Playhead */}
                                        <div className="absolute top-0 bottom-0 left-[200px] w-px bg-primary z-10 shadow-[0_0_10px_rgba(var(--primary),1)]">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary/20 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Tools Sidebar */}
                        <div className="w-24 border-l border-border bg-card/30 flex flex-col items-center py-6 gap-2 overflow-y-auto custom-scrollbar shrink-0">
                            <button 
                                onClick={() => setActiveTool('reframe')}
                                className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all", activeTool === 'reframe' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                            >
                                <Crop className="w-5 h-5" />
                                <span className="text-[9px] font-bold">Reframe</span>
                            </button>
                            <button 
                                onClick={() => setActiveTool('text')}
                                className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all", activeTool === 'text' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                            >
                                <Type className="w-5 h-5" />
                                <span className="text-[9px] font-bold text-center leading-tight">Text<br/>Editor</span>
                            </button>
                            <button 
                                onClick={() => setActiveTool('caption')}
                                className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all", activeTool === 'caption' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-[9px] font-bold">Caption</span>
                            </button>
                            <button 
                                onClick={() => setActiveTool('thumbnail')}
                                className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all", activeTool === 'thumbnail' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                            >
                                <ImageIcon className="w-5 h-5" />
                                <span className="text-[9px] font-bold">Thumbnail</span>
                            </button>
                            <button 
                                onClick={() => setActiveTool('template')}
                                className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all", activeTool === 'template' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                            >
                                <LayoutTemplate className="w-5 h-5" />
                                <span className="text-[9px] font-bold">Template</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
