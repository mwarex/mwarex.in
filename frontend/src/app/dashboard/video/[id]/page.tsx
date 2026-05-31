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
    Download,
    Edit3,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    CheckCircle2
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
                // Generate context-aware fallback clips based on video title for MWareX startup demo
                const baseTitle = video.title || "Video";
                setClips([
                    {
                        id: "clip-1",
                        score: "9.8/10",
                        duration: "00:45",
                        title: `Best moment from: ${baseTitle}`,
                        hashtags: "#MWareX #AIContent #Viral",
                        startTime: "00:00",
                        endTime: "00:45"
                    },
                    {
                        id: "clip-2",
                        score: "8.5/10",
                        duration: "00:30",
                        title: `Highlight: Automating video workflows with MWareX`,
                        hashtags: "#VideoEditing #CreatorEconomy #SaaS",
                        startTime: "01:15",
                        endTime: "01:45"
                    },
                    {
                        id: "clip-3",
                        score: "7.9/10",
                        duration: "00:55",
                        title: `Key takeaway from ${baseTitle}`,
                        hashtags: "#Insights #Startup #Growth",
                        startTime: "02:30",
                        endTime: "03:25"
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

    const handleEditClip = (clipId: string) => {
        router.push(`/dashboard/video/${id}/clip/${clipId}`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4 text-sm font-medium">
                    <button onClick={() => router.push('/dashboard/creator')} className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push('/dashboard/creator')}>Home</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">Project</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-foreground font-semibold">{video?.title || "Loading..."}</span>
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

                {/* Workspace Content */}
                <div className="flex-1 flex bg-background p-4 lg:p-6 gap-4 lg:gap-6 overflow-hidden">
                    
                    {/* Column 1: Clips List */}
                    <div className="w-[320px] flex flex-col bg-card/40 border border-border rounded-2xl overflow-hidden shrink-0 shadow-sm">
                        <div className="p-4 border-b border-border space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                    type="text" 
                                    placeholder="Search keyword or #"
                                    className="w-full bg-secondary/30 border border-border focus:border-primary/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
                                />
                                <button className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
                                    <Search className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-background border border-border hover:bg-secondary transition-colors text-foreground">Merged Clips</button>
                                <button className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-background border border-border hover:bg-secondary transition-colors text-foreground">All Ratings ▼</button>
                                <button className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-background border border-border hover:bg-secondary transition-colors text-foreground">Lifetime</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {clips.map((clip, idx) => (
                                <motion.div 
                                    key={clip.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => setActiveClipIndex(idx)}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all cursor-pointer relative group",
                                        activeClipIndex === idx 
                                            ? "border-primary bg-primary/5 shadow-md" 
                                            : "border-border bg-card hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center">
                                                {activeClipIndex === idx && <div className="w-2 h-2 rounded-[2px] bg-primary" />}
                                            </div>
                                            <span className="font-bold text-sm">Clip :{idx + 1}</span>
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                                parseFloat(clip.score) > 8 ? "bg-emerald-500/10 text-emerald-500" :
                                                parseFloat(clip.score) > 5 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {clip.score}
                                            </span>
                                        </div>
                                        <div className="px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded-md">
                                            {clip.duration}
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{clip.title}</h3>
                                    
                                    <p className="text-[10px] text-muted-foreground mb-1 font-medium">Hashtags: <span className="text-primary/80">{clip.hashtags}</span></p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Start Time: {clip.startTime} — End Time: {clip.endTime}</p>

                                    <div className="flex gap-2 mt-4">
                                        {activeClipIndex === idx ? (
                                            <button className="flex-1 py-2 rounded-lg bg-foreground text-background font-bold text-xs hover:opacity-90 transition-opacity">
                                                Publish
                                            </button>
                                        ) : (
                                            <button className="flex-1 py-2 rounded-lg bg-background border border-border text-foreground font-bold text-xs hover:bg-secondary transition-colors">
                                                Export Clip
                                            </button>
                                        )}
                                        <button className="p-2 rounded-lg bg-background border border-border text-foreground hover:bg-secondary transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleEditClip(clip.id); }} className="p-2 rounded-lg bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors group-hover:border-primary/50">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* Pagination mockup */}
                            <div className="flex items-center justify-center gap-4 pt-4 text-sm font-medium text-muted-foreground">
                                <ChevronLeft className="w-4 h-4 opacity-50" />
                                <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold">1</span>
                                <span className="cursor-pointer hover:text-foreground">2</span>
                                <ChevronRight className="w-4 h-4 cursor-pointer hover:text-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Player & Timeline */}
                    <div className="flex-1 flex flex-col bg-card/40 border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex-1 p-4 lg:p-6 flex items-center justify-center bg-black/95 relative border-b border-border">
                            {signedVideoSrc ? (
                                <video
                                    src={signedVideoSrc}
                                    className="w-full h-full max-h-[500px] object-contain rounded-lg"
                                    controls
                                    playsInline
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                    <Play className="w-12 h-12 opacity-20" />
                                    <p className="text-sm">Video Player Placeholder</p>
                                </div>
                            )}
                        </div>

                        {/* Timeline Editor */}
                        <div className="h-[200px] bg-card p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button className="px-4 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground text-xs font-semibold cursor-not-allowed">Save Changes</button>
                                    <button className="px-4 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground text-xs font-semibold cursor-not-allowed">Merge</button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><SkipBack className="w-4 h-4" /></button>
                                    <button className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity pl-1">
                                        <Play className="w-5 h-5 fill-current" />
                                    </button>
                                    <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><SkipForward className="w-4 h-4" /></button>
                                    <span className="font-mono text-sm ml-2 font-semibold">0:15 / {clips[activeClipIndex]?.duration || "00:00"}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg bg-background border border-border hover:bg-secondary transition-colors"><ZoomOut className="w-4 h-4" /></button>
                                    <button className="p-2 rounded-lg bg-background border border-border hover:bg-secondary transition-colors"><ZoomIn className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="flex-1 bg-background rounded-xl border border-border relative overflow-hidden flex flex-col p-2">
                                {/* Time markers */}
                                <div className="flex justify-between text-[10px] text-muted-foreground px-2 font-mono pb-2 border-b border-border/50">
                                    <span>0:00</span>
                                    <span>02:18</span>
                                    <span>04:00</span>
                                    <span>06:00</span>
                                </div>
                                {/* Track */}
                                <div className="flex-1 relative mt-3 px-2 flex items-center">
                                    <div className="w-[15%] h-12 bg-foreground rounded-lg border-2 border-foreground/50 shrink-0 flex items-center justify-center text-background font-bold text-xs relative">
                                        1
                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-background/20 cursor-col-resize hover:bg-background/40" />
                                    </div>
                                    <div className="w-[30%] h-10 bg-secondary rounded-lg border border-border ml-2 flex items-center justify-center text-muted-foreground font-bold text-xs">2</div>
                                    <div className="w-[20%] h-10 bg-secondary rounded-lg border border-border ml-2 flex items-center justify-center text-muted-foreground font-bold text-xs">3</div>
                                    
                                    {/* Playhead */}
                                    <div className="absolute top-0 bottom-0 left-[18%] w-[2px] bg-primary z-10 shadow-[0_0_8px_rgba(var(--primary),0.8)]">
                                        <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Clip Details */}
                    <div className="w-[280px] flex flex-col bg-card/40 border border-border rounded-2xl overflow-hidden shrink-0 shadow-sm p-5 space-y-4 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h2 className="font-bold text-sm">Clip Details (1 of 18)</h2>
                            <button className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors">
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">Video Title <Edit3 className="w-3 h-3" /></p>
                                <p className="text-xs font-medium leading-snug">{clips[activeClipIndex]?.title || "Loading..."}</p>
                            </div>

                            <div className="p-3 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors">
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">Description <Edit3 className="w-3 h-3" /></p>
                                <p className="text-xs text-muted-foreground leading-relaxed">A concise, high-impact clip prepared for publishing across social channels.</p>
                            </div>

                            <div className="p-3 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors">
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">Hashtags <Edit3 className="w-3 h-3" /></p>
                                <p className="text-xs font-medium text-primary/80">{clips[activeClipIndex]?.hashtags || "#MWareX"}</p>
                            </div>

                            <div className="p-3 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors">
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">Text Template <Edit3 className="w-3 h-3" /></p>
                                <p className="text-xs text-muted-foreground leading-relaxed">No templates available. Create one in the Template section.</p>
                            </div>

                            <div className="p-3 bg-background rounded-xl border border-border">
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mb-2 uppercase tracking-wider">Thumbnail <Edit3 className="w-3 h-3" /></p>
                                <div className="flex gap-2">
                                    <div className="w-20 h-28 rounded-lg bg-secondary/50 border border-border" />
                                    <div className="w-20 h-28 rounded-lg bg-secondary/30 border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors text-muted-foreground">
                                        +
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
