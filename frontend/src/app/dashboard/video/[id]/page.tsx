"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Loader2,
    Save,
    MessageSquare,
    Play,
    Settings2,
    CheckCircle,
    XCircle,
    Send,
    User,
    Sliders,
    Scissors
} from "lucide-react";
import { videoAPI, userAPI, s3API } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getUserData } from "@/lib/auth";

export default function VideoStudioPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [video, setVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [signedVideoSrc, setSignedVideoSrc] = useState<string>("");

    // Edit State
    const [editSettings, setEditSettings] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        sepia: 0,
        trimStart: 0,
        trimEnd: 0
    });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"edit" | "chat">("edit");

    // Chat State
    const [comments, setComments] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const data = getUserData();
        setUserData(data);
        fetchVideo();

        // Socket Connection
        const socket = getSocket();
        socket.emit("join_video", id);

        const handleNewComment = (comment: any) => {
            setComments((prev) => [...prev, comment]);
            if (activeTab === "chat") {
                setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            } else {
                toast.info("New message received");
            }
        };

        socket.on("new_comment", handleNewComment);

        return () => {
            socket.off("new_comment", handleNewComment);
        };
    }, [id, activeTab]);

    useEffect(() => {
        if (activeTab === "chat") {
            chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTab, comments]);

    const fetchVideo = async () => {
        try {
            const res = await videoAPI.getVideo(id);
            const vData = res.data;
            setVideo(vData);
            if (vData.editSettings) {
                setEditSettings(prev => ({ ...prev, ...vData.editSettings }));
            }
            if (vData.comments) {
                setComments(vData.comments);
            }

            // Resolve playable video source
            const isRaw = (vData.status === "raw_uploaded" || vData.status === "editing_in_progress") && !!vData.rawFileUrl;
            const targetUrl = isRaw ? vData.rawFileUrl : vData.fileUrl;
            if (targetUrl && targetUrl.includes("amazonaws.com")) {
                const s3Res = await s3API.getDownloadUrl(id, isRaw);
                setSignedVideoSrc(s3Res.data.signedUrl);
            } else {
                setSignedVideoSrc(getVideoUrl(targetUrl || ""));
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load video");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await videoAPI.updateSettings(id, editSettings);
            toast.success("Edit settings saved");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSendingMessage(true);
        try {
            const res = await videoAPI.addComment(id, newMessage);
            setComments(res.data); // Backend returns updated array
            setNewMessage("");
            setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleApprove = async () => {
        try {
            await videoAPI.approve(id);
            toast.success("Video approved and uploading to YouTube");
            fetchVideo();
        } catch (error) {
            toast.error("Failed to approve video");
        }
    };

    const handleReject = async () => {
        try {
            await videoAPI.reject(id);
            toast.success("Video rejected");
            fetchVideo();
        } catch (error) {
            toast.error("Failed to reject video");
        }
    };

    const isCreator = userData?.role === "creator" || (video?.creatorId && userData?.id === video.creatorId?._id);

    const getVideoUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http") || path.startsWith("blob")) return path;
        const cleanPath = path.replace(/\\/g, "/");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const safeBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const safePath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
        return `${safeBase}${safePath}`;
    };

    const currentVideoPath = (video?.status === "raw_uploaded" || video?.status === "editing_in_progress") && video?.rawFileUrl
        ? video.rawFileUrl
        : video?.fileUrl || "";

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const bgStyle = {
        filter: `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) saturate(${editSettings.saturation}%) grayscale(${editSettings.grayscale}%) sepia(${editSettings.sepia}%)`
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-10 shrink-0">
                <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 lg:p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="font-semibold text-base lg:text-lg truncate">{video.title}</h1>
                        <div className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs text-muted-foreground">
                            <span className={cn("capitalize px-1.5 py-0.5 rounded border text-[9px] lg:text-[10px]",
                                video.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    video.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            )}>
                                {video.status}
                            </span>
                            <span>•</span>
                            <span className="truncate">Updated {new Date(video.updatedAt || video.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                    {activeTab === 'edit' && (
                        <button
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-primary text-primary-foreground rounded-lg text-xs lg:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 lg:w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5 lg:w-4 h-4" />}
                            <span className="hidden xs:inline">Save Changes</span>
                            <span className="xs:hidden">Save</span>
                        </button>
                    )}

                    {isCreator && video.status === 'pending' && (
                        <>
                            <button
                                onClick={handleReject}
                                className="p-1.5 lg:p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                                title="Reject"
                            >
                                <XCircle className="w-4 h-4 lg:w-5 h-5" />
                            </button>
                            <button
                                onClick={handleApprove}
                                className="p-1.5 lg:p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                                title="Approve"
                            >
                                <CheckCircle className="w-4 h-4 lg:w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Video Player Area */}
                <div className="flex-[0.45] lg:flex-1 bg-black/95 relative flex items-center justify-center p-4 lg:p-8 shrink-0">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-white/10">
                        {signedVideoSrc ? (
                            <video
                                src={signedVideoSrc}
                                className="w-full h-full object-contain"
                                controls
                                style={bgStyle}
                                playsInline
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Active Filters Overlay info */}
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                        {editSettings.brightness !== 100 && <span className="text-[9px] lg:text-[10px] bg-black/50 text-white px-2 py-1 rounded backdrop-blur border border-white/10 uppercase tracking-tighter">Bright: {editSettings.brightness}%</span>}
                        {editSettings.contrast !== 100 && <span className="text-[9px] lg:text-[10px] bg-black/50 text-white px-2 py-1 rounded backdrop-blur border border-white/10 uppercase tracking-tighter">Cont: {editSettings.contrast}%</span>}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex-[0.55] lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col shrink-0 lg:shrink-0 overflow-hidden min-h-[350px] lg:min-h-0">
                    {/* Tabs */}
                    <div className="flex border-b border-border shrink-0">
                        <button
                            onClick={() => setActiveTab("edit")}
                            className={cn(
                                "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative",
                                activeTab === "edit" ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            <Sliders className="w-4 h-4" />
                            Edit
                            {activeTab === "edit" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={cn(
                                "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative",
                                activeTab === "chat" ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Discussion
                            {activeTab === "chat" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {activeTab === "edit" ? (
                            <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                                        <Settings2 className="w-4 h-4" />
                                        Color Correction
                                    </div>

                                    <div className="space-y-4 lg:space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Brightness</span>
                                                <span className="font-mono text-primary">{editSettings.brightness}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="200"
                                                value={editSettings.brightness}
                                                onChange={(e) => setEditSettings({ ...editSettings, brightness: Number(e.target.value) })}
                                                className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Contrast</span>
                                                <span className="font-mono text-primary">{editSettings.contrast}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="200"
                                                value={editSettings.contrast}
                                                onChange={(e) => setEditSettings({ ...editSettings, contrast: Number(e.target.value) })}
                                                className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Saturation</span>
                                                <span className="font-mono text-primary">{editSettings.saturation}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="200"
                                                value={editSettings.saturation}
                                                onChange={(e) => setEditSettings({ ...editSettings, saturation: Number(e.target.value) })}
                                                className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Grayscale</span>
                                                <span className="font-mono text-primary">{editSettings.grayscale}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100"
                                                value={editSettings.grayscale}
                                                onChange={(e) => setEditSettings({ ...editSettings, grayscale: Number(e.target.value) })}
                                                className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                                        <Scissors className="w-4 h-4" />
                                        Trim (Visual Only)
                                    </div>
                                    <div className="p-4 bg-secondary/20 rounded-lg text-[10px] lg:text-xs text-muted-foreground text-center border border-dashed border-border">
                                        Use these markers to indicate start/end points for final cut.
                                    </div>
                                    {/* Placeholder for Trim UI - Complexity reduced for this Iteration */}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                                    {comments.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground text-sm">
                                            <MessageSquare className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                            No messages yet. Start the discussion!
                                        </div>
                                    ) : (
                                        comments.map((msg, i) => {
                                            const isMe = msg.senderId?._id === userData?.id || msg.senderId === userData?.id;
                                            const isAI = msg.isAI;
                                            
                                            return (
                                                <div key={i} className={cn("flex flex-col gap-1 max-w-[85%]", isMe ? "ml-auto items-end" : "items-start")}>
                                                    <div className={cn(
                                                        "px-3 lg:px-4 py-2 lg:py-2.5 rounded-2xl text-[13px] lg:text-sm",
                                                        isMe
                                                            ? "bg-primary text-primary-foreground rounded-br-none shadow-sm"
                                                            : (isAI 
                                                                ? "bg-indigo-500/10 text-indigo-300 rounded-bl-none border border-indigo-500/20 shadow-inner" 
                                                                : "bg-secondary text-foreground rounded-bl-none border border-border")
                                                    )}>
                                                        {msg.text}
                                                    </div>
                                                    <span className="text-[9px] lg:text-[10px] text-muted-foreground px-1 flex items-center gap-1">
                                                        {isAI ? <><Settings2 className="w-2.5 h-2.5 text-indigo-400"/> AI Editor</> : (msg.senderId?.name || "User")} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatBottomRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card shrink-0">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full bg-secondary/50 border border-border focus:border-primary/50 rounded-xl pl-4 pr-12 py-2.5 lg:py-3 text-[13px] lg:text-sm outline-none transition-all focus:bg-background"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sendingMessage || !newMessage.trim()}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 lg:p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {sendingMessage ? <Loader2 className="w-3.5 h-3.5 lg:w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 lg:w-4 h-4" />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
