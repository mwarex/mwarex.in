"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Youtube,
  Clock,
  Users,
  Plus,
  Settings,
  LogOut,
  Search,
  RefreshCw,
  Mail,
  Copy,
  Check,
  Video as VideoIcon,
  Menu,
  ChevronRight,
  Loader2,
  LayoutDashboard,
  X,
  Sun,
  Moon,
  Eye,
  Lock,
  DollarSign,
  Wand2,
  MessageSquare,
  Send,
  ChevronDown,
  Briefcase,
  Bot,
  Sparkles,
  Cpu,
  Instagram,
  Linkedin,
  Twitter,
  Link2,
  PanelLeftClose
} from "lucide-react";
import VideoCard from "@/components/VideoCard";
import { videoAPI, inviteAPI, getGoogleAuthUrl, paymentAPI, userAPI, roomAPI } from "@/lib/api";
import { isAuthenticated, getUserData, logout, isDemoUser } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import { MWareXLogo } from "@/components/mwarex-logo";
import { SubscriptionModal } from "@/components/subscription-modal";
import { cn } from "@/lib/utils";
import { DashboardOnboarding } from "@/components/onboarding";
import SettingsModal from "@/components/SettingsModal";
import { SeasonSwitcher } from "@/components/seasonal-background";
import { toast } from "sonner";
import { S3UploadModal } from "@/components/S3UploadModal";
import CreatorProjectsView from "@/components/CreatorProjectsView";
import FutureFeatures from "@/components/FutureFeatures";
import AIPipeline from "@/components/AIPipeline";
import { runFakeGeminiProxy } from "@/lib/fakeGeminiProxy";
import AssignEditorModal from "@/components/AssignEditorModal";
import EditorRosterPanel from "@/components/EditorRosterPanel";
import ClipExtractorModal from "@/components/ClipExtractorModal";
import ClipsGridView from "@/components/ClipsGridView";

interface Video {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected" | "uploaded" | "raw_uploaded" | "raw_rejected" | "editing_in_progress" | "ai_processing";
  youtubeId?: string;
  rejectionReason?: string;
  editorRejectionReason?: string;
  rawFileUrl?: string;
  editorId?: { _id: string; name: string; email: string } | string;
  aiProgress?: { percent: number; message: string };
  goLiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
  isClip?: boolean;
  viralScore?: number;
  aspectRatio?: string;
}

type VideoOverride = {
  status?: Video["status"];
  editedUrl?: string;
  aiProgress?: { percent: number; message: string };
  goLiveAt?: string;
};

const statusPriority: Record<string, number> = {
  raw_uploaded: 1,
  ai_processing: 2,
  editing_in_progress: 3,
  pending: 4,
  processing: 5,
  approved: 6,
  uploaded: 7,
  rejected: 7,
  raw_rejected: 7,
};

export default function CreatorDashboard() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [localOverrides, setLocalOverrides] = useState<Record<string, VideoOverride>>({});
  const geminiInFlight = useRef<Set<string>>(new Set());
  const geminiCancels = useRef<Record<string, () => void>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "raw_uploaded" | "clips">("pending");
  const [activeView, setActiveView] = useState<"dashboard" | "marketplace" | "future" | "pipeline">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [avatarLetter, setAvatarLetter] = useState("U");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; email?: string; isDemo?: boolean } | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Editor Selection State
  const [editors, setEditors] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [selectedEditorId, setSelectedEditorId] = useState("");

  // Room State
  const [rooms, setRooms] = useState<{ _id: string; name: string; inviteToken?: string }[]>([]);
  const [currentRoom, setCurrentRoom] = useState<{ _id: string; name: string; inviteToken?: string } | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; videoId: string | null }>({
    isOpen: false,
    videoId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [aiProgressMap, setAiProgressMap] = useState<Record<string, { percent: number, message: string }>>({});
  const [ytProgressMap, setYtProgressMap] = useState<Record<string, { percent: number, message: string }>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'aiConfig' | 'models' | 'integrations'>('general');
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);

  // Assign Editor Modal
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; videoId: string | null }>({
    isOpen: false,
    videoId: null,
  });

  // Clip Extractor
  const [isClipExtractorOpen, setIsClipExtractorOpen] = useState(false);

  useEffect(() => {
    const data = getUserData();
    if (!isAuthenticated() || !data) {
      router.push("/auth/signin");
      return;
    }
    setUserData(data);
    setIsDemo(data?.isDemo === true);

    // If userData is incomplete (missing name/id), fetch fresh data from backend
    if (!data?.isDemo && (!data?.name || !data?.id)) {
      userAPI.getMe()
        .then(res => {
          const freshData = {
            email: res.data.email || data?.email,
            name: res.data.name || data?.name || "",
            id: res.data._id || data?.id || "",
          };
          setUserData(freshData);
          // Also persist it to localStorage for future page loads
          if (typeof window !== "undefined") {
            localStorage.setItem("userData", JSON.stringify(freshData));
          }
          const letter = freshData.name?.[0] || freshData.email?.[0] || "U";
          setAvatarLetter(letter);
        })
        .catch(err => console.error("Failed to refresh user data", err));
    }

    // Only fetch videos if not a demo user
    if (!data?.isDemo) {
      fetchVideos();
    } else {
      // For demo users, just show empty state immediately
      setIsLoading(false);
    }

    const letter = data?.name?.[0] || data?.email?.[0] || "U";
    setAvatarLetter(letter);

    // Fetch subscription
    if (!data?.isDemo) {
      paymentAPI.getSubscription()
        .then(res => setSubscription(res.data.subscription))
        .catch(console.error);

      // Fetch editors
      userAPI.getEditors()
        .then(res => setEditors(res.data))
        .catch(err => console.error("Failed to load editors", err));

      // Fetch Rooms
      roomAPI.list()
        .then(res => {
          setRooms(res.data);
          if (res.data.length > 0) {
            // Restore previously selected room from sessionStorage (survives refresh)
            const savedRoomId = typeof window !== "undefined" ? sessionStorage.getItem("creatorCurrentRoomId") : null;
            const savedRoom = savedRoomId ? res.data.find((r: any) => r._id === savedRoomId) : null;
            setCurrentRoom(savedRoom || res.data[0]);
          } else {
            // Prompt to create first room
            setIsRoomModalOpen(true);
          }
        })
        .catch(err => console.error("Failed to load rooms", err));
    }

    // Page load animation
    setTimeout(() => setPageLoaded(true), 100);
  }, [router]);

  const fetchVideos = async () => {
    // Don't fetch if demo user
    if (isDemoUser()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Pass roomId if available
      const params = currentRoom ? { roomId: currentRoom._id } : {};
      const response = await videoAPI.getVideos(params);
      setVideos(response.data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  // S3 direct upload modal (primary — supports up to 10 GB)
  const [isS3UploadOpen, setIsS3UploadOpen] = useState(false);

  const handleUploadRaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("video", uploadFile);
    formData.append("title", uploadTitle);
    formData.append("description", uploadDesc);
    // If we have a specific editor assigned, append it here
    if (selectedEditorId) formData.append("editorId", selectedEditorId);

    // For now, let's rely on backend user association if any.
    if (userData?.email) formData.append("creatorEmail", userData.email);

    // Add Room ID
    if (currentRoom) formData.append("roomId", currentRoom._id);

    try {
      const res = await videoAPI.uploadRaw(formData);
      const uploadedVideo = res.data?.video;
      if (uploadedVideo) {
        // startGeminiProxy(uploadedVideo); // Using backend WS instead
      }
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDesc("");
      fetchVideos();
    } catch (error) {
      console.error("Failed to upload raw video:", error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await videoAPI.approve(id);
      setLocalOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: "approved" } }));
      // scheduleGoLive(id); // Using real backend socket progress instead of fake progress
      await fetchVideos();
    } catch (error) {
      console.error("Failed to approve video:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteForMe = async (id: string) => {
    try {
      await videoAPI.deleteForMe(id);
      toast.success("Video deleted for you");
      fetchVideos();
    } catch (error) {
      console.error("Failed to delete video:", error);
      toast.error("Failed to delete video");
    }
  };

  const handleDeleteForEveryone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video for everyone? This action cannot be undone.")) return;
    try {
      await videoAPI.deleteForEveryone(id);
      toast.success("Video deleted for everyone");
      fetchVideos();
    } catch (error) {
      console.error("Failed to delete video for everyone:", error);
      toast.error("Failed to delete video for everyone");
    }
  };

  const handleReject = (id: string) => {
    setRejectModal({ isOpen: true, videoId: id });
    setRejectionReason("");
  };

  const submitReject = async () => {
    if (!rejectModal.videoId) return;

    const id = rejectModal.videoId;
    setActionLoading(id);
    setRejectModal({ isOpen: false, videoId: null });

    try {
      await videoAPI.reject(id, rejectionReason);
      setVideos(
        videos.map((v) =>
          v._id === id ? { ...v, status: "rejected" as const, rejectionReason } : v
        )
      );
    } catch (error) {
      console.error("Failed to reject video:", error);
    } finally {
      setActionLoading(null);
      setRejectionReason("");
    }
  };

  const handleInviteEditor = async () => {
    if (!currentRoom) return;

    // Build invite link with the room token and the invited email
    let link = `${window.location.origin}/join?token=${currentRoom.inviteToken}`;
    if (inviteEmail.trim()) {
      link += `&email=${encodeURIComponent(inviteEmail.trim())}`;
    }
    setInviteLink(link);

    // Also send invite email via backend
    if (inviteEmail.trim()) {
      try {
        const res = await inviteAPI.sendInvite(inviteEmail.trim(), link);
        if (res.data.emailSent) {
          console.log("Invite email sent successfully");
        }
      } catch (err) {
        console.error("Failed to send invite email:", err);
        // Don't block — the link is still available for copy-paste
      }
    }

    setIsInviting(false);
  };

  const handleRemoveEditor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this editor? They will lose access to your dashboard.")) return;
    try {
      await userAPI.removeEditor(id);
      setEditors(editors.filter(e => e._id !== id));
    } catch (err) {
      console.error("Failed to remove editor", err);
    }
  };

  const handleAssignEditor = async (editorId: string, brief: string, deadline: string) => {
    if (!assignModal.videoId) return;
    try {
      // Update local state immediately so the card reflects the assignment
      const assignedEditor = editors.find(e => e._id === editorId);
      if (assignedEditor) {
        setVideos(prev => prev.map(v =>
          v._id === assignModal.videoId
            ? { ...v, editorId: { _id: assignedEditor._id, name: assignedEditor.name, email: assignedEditor.email } }
            : v
        ));
      }
      toast.success(`Assigned to ${assignedEditor?.name || 'editor'}!`);
      setAssignModal({ isOpen: false, videoId: null });
    } catch (err) {
      console.error("Failed to assign editor", err);
      toast.error("Failed to assign editor");
    }
  };

  const handleExtractClips = async (videoId: string) => {
    try {
      setActionLoading(videoId);
      await videoAPI.extractClips({ videoId, roomId: currentRoom?._id });
      toast.success("Clip extraction started", { description: "The AI is analyzing the long video. It will appear in the Clips tab when ready." });
      setLocalOverrides(prev => ({
        ...prev,
        [videoId]: {
          ...(prev[videoId] || {}),
          status: "ai_processing",
          aiProgress: { percent: 0, message: "Initializing AI Clip Extractor..." }
        }
      }));
    } catch (error) {
      toast.error("Failed to start clip extraction");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const applyOverrides = useCallback((video: Video): Video => {
    const override = localOverrides[video._id];
    if (!override) return video;

    const resolvedStatus = override.status
      ? (statusPriority[override.status] >= statusPriority[video.status] ? override.status : video.status)
      : video.status;

    return {
      ...video,
      status: resolvedStatus,
      fileUrl: override.editedUrl || video.fileUrl || video.rawFileUrl || "",
      aiProgress: override.aiProgress || video.aiProgress,
      goLiveAt: override.goLiveAt || video.goLiveAt,
    };
  }, [localOverrides]);

  const displayVideos = useMemo(() => videos.map(applyOverrides), [videos, applyOverrides]);

  const filteredVideos = useMemo(() => {
    return displayVideos.filter((video) => {
      const matchesSearch =
        video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (activeTab === "clips") {
        return matchesSearch && video.isClip === true;
      }
      
      if (video.isClip === true) return false;
      
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "raw_uploaded" && (video.status === "raw_uploaded" || video.status === "editing_in_progress" || video.status === "ai_processing")) ||
        video.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [displayVideos, searchQuery, activeTab]);

  const stats = useMemo(
    () => [
      {
        label: "Pending",
        value: displayVideos.filter((v) => v.status === "pending").length,
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      },
      {
        label: "AI Processing",
        value: displayVideos.filter((v) => v.status === "raw_uploaded" || v.status === "ai_processing" || v.status === "editing_in_progress").length,
        icon: Bot,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      },
      {
        label: "Approved",
        value: displayVideos.filter((v) => v.status === "approved").length,
        icon: CheckCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      },
      {
        label: "Published",
        value: displayVideos.filter((v) => v.status === "uploaded").length,
        icon: Youtube,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      },
      {
        label: "Rejected",
        value: displayVideos.filter((v) => v.status === "rejected").length,
        icon: XCircle,
        color: "text-zinc-400",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/20",
      },
    ],
    [displayVideos]
  );

  const startGeminiProxy = useCallback((video: Video) => {
    if (!video?._id) return;
    if (video.editorId) return; // skip when a human editor is assigned
    if (geminiInFlight.current.has(video._id)) return;

    const sourceUrl = video.rawFileUrl || video.fileUrl || "";
    if (!sourceUrl) return;

    geminiInFlight.current.add(video._id);

    setLocalOverrides(prev => ({
      ...prev,
      [video._id]: {
        ...(prev[video._id] || {}),
        status: "ai_processing",
        editedUrl: sourceUrl,
        aiProgress: { percent: 10, message: "Gemini proxy: starting analysis" },
      }
    }));

    setAiProgressMap(prev => ({
      ...prev,
      [video._id]: { percent: 10, message: "Gemini proxy: starting analysis" }
    }));

    const cancel = runFakeGeminiProxy({
      videoId: video._id,
      sourceUrl,
      onProgress: ({ percent, message }) => {
        setAiProgressMap(prev => ({ ...prev, [video._id]: { percent, message } }));
        setLocalOverrides(prev => ({
          ...prev,
          [video._id]: {
            ...(prev[video._id] || {}),
            status: percent < 100 ? "ai_processing" : "pending",
            editedUrl: sourceUrl,
            aiProgress: percent < 100 ? { percent, message } : undefined,
          }
        }));
      },
      onComplete: (result) => {
        setAiProgressMap(prev => {
          const next = { ...prev };
          delete next[video._id];
          return next;
        });
        setLocalOverrides(prev => ({
          ...prev,
          [video._id]: {
            ...(prev[video._id] || {}),
            status: "pending",
            editedUrl: result.editedUrl || sourceUrl,
            aiProgress: undefined,
          }
        }));
        geminiInFlight.current.delete(video._id);
      }
    });

    geminiCancels.current[video._id] = cancel;
  }, []);

  const scheduleGoLive = useCallback((videoId: string) => {
    let percent = 5;

    setYtProgressMap(prev => ({
      ...prev,
      [videoId]: { percent, message: "Initiating YouTube upload..." }
    }));

    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 25) + 15;

      if (percent >= 100) {
        percent = 100;
        clearInterval(interval);
        
        setYtProgressMap(prev => ({
          ...prev,
          [videoId]: { percent: 100, message: "Published to YouTube! 🎉" }
        }));

        // After a brief moment, finalize status, which drops it fully into published timeline
        setTimeout(() => {
          setLocalOverrides(prev => ({
            ...prev,
            [videoId]: { 
              ...(prev[videoId] || {}), 
              status: "uploaded",
              goLiveAt: new Date().toISOString()
            }
          }));
          
          setYtProgressMap(prev => {
            const next = { ...prev };
            delete next[videoId];
            return next;
          });
          
          toast.success("Video is now live on YouTube!");
        }, 2000);
      } else {
        setYtProgressMap(prev => ({
          ...prev,
          [videoId]: { percent, message: `Uploading... ${percent}%` }
        }));
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geminiCancels.current).forEach((cancel) => cancel?.());
    };
  }, []);

  useEffect(() => {
    // The Gemini proxy logic was conflicting with the backend's clean websocket
    // simulation logic so we'll suspend the frontend dual-running effect to fix the glitch.
    
    // const shouldSimulateGemini = (video: Video) => {
    //   if (!video?._id || video.editorId) return false;
    //   if (geminiInFlight.current.has(video._id)) return false;
    //
    //   const needsAutoEdit =
    //     video.status === "raw_uploaded" ||
    //     video.status === "ai_processing" ||
    //     (video.status === "editing_in_progress" && !video.fileUrl) ||
    //     (!video.fileUrl && !!video.rawFileUrl);
    //
    //   return needsAutoEdit;
    // };
    //
    // displayVideos.forEach((video) => {
    //   if (shouldSimulateGemini(video)) {
    //     startGeminiProxy(video);
    //   }
    // });
  }, [displayVideos, startGeminiProxy]);

  useEffect(() => {
    if (currentRoom) {
      fetchVideos();

      // Join socket room for real-time updates
      const socket = getSocket();
      socket.emit("join_room", currentRoom._id);

      const handleVideoEvent = (data: any) => {
        const action = data?.action || "video_updated";
        const messages: Record<string, string> = {
          video_uploaded: "📹Raw Video Uploaded",
          video_approved: "✅ Video approved!",
          video_rejected: "❌ Video rejected",
          video_accepted: "👍 Editor accepted your raw video!",
          video_updated: "🔄 Video status updated",
          video_deleted: "🗑️ Video deleted",
          youtube_uploaded: "🎉 Video is live on YouTube!",
        };
        toast.info(messages[action] || "Video list updated");
        fetchVideos();
      };

      const events = ["video_uploaded", "video_updated", "video_deleted", "video_approved", "video_rejected", "video_accepted"];
      events.forEach(evt => socket.on(evt, handleVideoEvent));

      const handleVideoProgress = (data: any) => {
        if (data.videoId && data.percent !== undefined) {
          setAiProgressMap(prev => ({
            ...prev,
            [data.videoId]: { percent: data.percent, message: data.message || "Processing..." }
          }));

          setLocalOverrides(prev => ({
            ...prev,
            [data.videoId]: {
              ...(prev[data.videoId] || {}),
              status: data.percent === 100 ? "pending" : "ai_processing",
              aiProgress: data.percent === 100 ? undefined : { percent: data.percent, message: data.message || "Processing..." },
            }
          }));

          // Auto-remove the AI banner 6 seconds after completing
          if (data.percent === 100) {
            setTimeout(() => {
              setAiProgressMap(prev => {
                const newMap = { ...prev };
                delete newMap[data.videoId];
                return newMap;
              });
            }, 6000);
          }
        }
      };
      const handleYoutubeProgress = (data: any) => {
        if (data.videoId && data.percent !== undefined) {
          // Update YouTube progress banner
          setYtProgressMap(prev => ({
            ...prev,
            [data.videoId]: { percent: data.percent, message: data.message || "Publishing..." }
          }));

          // Remove from AI active banner immediately when YouTube upload starts
          setAiProgressMap(prev => {
            if (prev[data.videoId]) {
              const newMap = { ...prev };
              delete newMap[data.videoId];
              return newMap;
            }
            return prev;
          });

          // Auto-remove the YouTube banner 6 seconds after completing
          if (data.percent === 100) {
            const liveAt = new Date().toISOString();
            setLocalOverrides(prev => ({
              ...prev,
              [data.videoId]: { ...(prev[data.videoId] || {}), goLiveAt: prev[data.videoId]?.goLiveAt || liveAt }
            }));

            setTimeout(() => {
              setYtProgressMap(prev => {
                const newMap = { ...prev };
                delete newMap[data.videoId];
                return newMap;
              });
            }, 6000);
          }
        }
      };

      socket.on("video_progress", handleVideoProgress);
      socket.on("youtube_progress", handleYoutubeProgress);

      return () => {
        events.forEach(evt => socket.off(evt, handleVideoEvent));
        socket.off("video_progress", handleVideoProgress);
        socket.off("youtube_progress", handleYoutubeProgress);
      };
    }
  }, [currentRoom]);

  // Persist the currently selected room so refresh restores it
  useEffect(() => {
    if (currentRoom && typeof window !== "undefined") {
      sessionStorage.setItem("creatorCurrentRoomId", currentRoom._id);
    }
  }, [currentRoom]);


  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setIsCreatingRoom(true);
    try {
      const res = await roomAPI.create(newRoomName);
      setRooms([...rooms, res.data]);
      setCurrentRoom(res.data);
      setIsRoomModalOpen(false);
      setNewRoomName("");
    } catch (err) {
      console.error("Failed to create room", err);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const isRevenueLocked = subscription?.plan === "free" && !isDemo;

  // Initial page loader
  if (!pageLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <MWareXLogo showText={false} size="lg" />
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading dashboard...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground flex font-sans transition-colors duration-300">
      {/* <DashboardOnboarding />cd */}

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ width: 256, x: -280 }}
        animate={{ 
          x: isSidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -280),
          width: isSidebarCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024 ? 80 : 256
        }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-out overflow-x-hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div className={cn("px-4 py-3 border-b border-border flex items-center h-[72px]", isSidebarCollapsed ? "justify-center" : "justify-between")}>
          <div className={cn("min-w-max transition-all duration-200 overflow-hidden", isSidebarCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block")}>
            <MWareXLogo showText={true} size="md" />
          </div>
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              } else {
                setIsSidebarOpen(false);
              }
            }}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className={cn("pt-3 pb-1", isSidebarCollapsed ? "px-2" : "px-3")}>
          <div className="relative group">
            <button className={cn("w-full flex items-center rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all", isSidebarCollapsed ? "p-2 justify-center" : "p-2 justify-between")}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {currentRoom?.name?.[0] || "W"}
                </div>
                {!isSidebarCollapsed && <span className="font-medium text-sm truncate">{currentRoom?.name || "Select Workspace"}</span>}
              </div>
              {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>

            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 min-w-[200px] w-full bg-popover border border-border rounded-lg shadow-xl overflow-hidden hidden group-focus-within:block group-hover:block z-50">
              <div className="max-h-48 overflow-y-auto p-1">
                {rooms.map(room => (
                  <button
                    key={room._id}
                    onClick={() => setCurrentRoom(room)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors text-left",
                      currentRoom?._id === room._id ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="truncate flex-1">{room.name}</span>
                    {currentRoom?._id === room._id && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-1 border-t border-border">
                <button
                  onClick={() => setIsRoomModalOpen(true)}
                  className="w-full flex items-center gap-2 p-2 rounded-md text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-3 h-3 shrink-0" />
                  <span className="truncate">Create New Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1 overflow-y-auto", isSidebarCollapsed ? "p-2" : "p-4")}>
          {!isSidebarCollapsed && <p className="text-[10px] font-semibold text-muted-foreground px-3 mb-3 uppercase tracking-widest">Menu</p>}

          <button 
            onClick={() => setActiveView("dashboard")}
            title={isSidebarCollapsed ? "Dashboard" : undefined}
            className={cn("w-full flex items-center py-2.5 rounded-lg font-medium text-sm transition-all overflow-hidden", isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3", activeView === "dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
          >
           <LayoutDashboard className="w-4 h-4 shrink-0" />
           <span className={cn("whitespace-nowrap transition-opacity duration-200", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>Dashboard</span>
          </button>
          
          <button
            onClick={() => {
              setSettingsTab('aiConfig');
              setIsSettingsOpen(true);
            }}
            title={isSidebarCollapsed ? "AI Brain Settings" : undefined}
            className={cn("w-full flex items-center py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all overflow-hidden text-sm", isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3")}
          >
            <Bot className="w-4 h-4 shrink-0" />
            <span className={cn("whitespace-nowrap transition-opacity duration-200", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>AI Brain Settings</span>
          </button>

          <button
            onClick={() => { setIsIntegrationsOpen(true); setIsSidebarOpen(false); }}
            title={isSidebarCollapsed ? "Integrations" : undefined}
            className={cn("w-full flex items-center py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all overflow-hidden text-sm", isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3")}
          >
            <Link2 className="w-4 h-4 shrink-0" />
            <span className={cn("whitespace-nowrap transition-opacity duration-200", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>Integrations</span>
          </button>

          <button
            onClick={() => { setActiveView("pipeline"); setIsSidebarOpen(false); }}
            title={isSidebarCollapsed ? "AI Strategy" : undefined}
            className={cn("w-full flex items-center py-2.5 rounded-lg font-medium text-sm transition-all overflow-hidden", isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3", activeView === "pipeline" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span className={cn("whitespace-nowrap transition-opacity duration-200", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>AI Strategy</span>
          </button>

          <button
            onClick={() => { setActiveView("future"); setIsSidebarOpen(false); }}
            title={isSidebarCollapsed ? "Future Features" : undefined}
            className={cn("w-full flex items-center py-2.5 rounded-lg font-medium text-sm transition-all overflow-hidden", isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3", activeView === "future" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className={cn("whitespace-nowrap transition-opacity duration-200", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>Future Features</span>
          </button>

          <div className="my-4 border-t border-border" />

          <button
            onClick={() => {
              setSettingsTab('general');
              setIsSettingsOpen(true);
            }}
            title={isSidebarCollapsed ? "Settings" : undefined}
            className={cn("w-full flex items-center py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all overflow-hidden text-sm", isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3")}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className={cn("whitespace-nowrap transition-opacity duration-200", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>Settings</span>
          </button>
        </nav>

        {/* Team / Editor Roster Panel */}
        {!isSidebarCollapsed && (
          <EditorRosterPanel
            editors={editors}
            currentRoom={currentRoom}
            onRemoveEditor={handleRemoveEditor}
            onInviteSent={(email, link) => {
              setInviteLink(link);
              setInviteEmail(email);
            }}
            sendInvite={async (email, link) => {
              await inviteAPI.sendInvite(email, link);
            }}
            workspaceName={currentRoom?.name}
            videosByEditorId={videos.reduce((acc, v) => {
              if (v.editorId && typeof v.editorId === 'object') {
                const eid = (v.editorId as any)._id;
                acc[eid] = (acc[eid] || 0) + (v.status === 'editing_in_progress' || v.status === 'raw_uploaded' ? 1 : 0);
              }
              return acc;
            }, {} as Record<string, number>)}
          />
        )}

        {/* User Profile */}
        <div className={cn("border-t border-border flex items-center", isSidebarCollapsed ? "p-2 justify-center" : "p-4")}>
          <div className={cn("flex items-center rounded-lg bg-secondary/50", isSidebarCollapsed ? "p-0 bg-transparent justify-center" : "gap-3 p-2 w-full")}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0 cursor-pointer" onClick={isSidebarCollapsed ? handleLogout : undefined} title={isSidebarCollapsed ? "Logout" : undefined}>
              {avatarLetter}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userData?.name || "Creator"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userData?.email}</p>
                </div>
                <button onClick={handleLogout} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors shrink-0" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main
        style={{ willChange: "scroll-position, transform", transform: "translateZ(0)" }}
        className="flex-1 min-h-screen overflow-y-auto bg-transparent scroll-smooth"
      >
        {/* Top Navbar */}
        <header
          style={{ willChange: "transform", transform: "translateZ(0)" }}
          className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors flex lg:hidden items-center justify-center cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Welcome back, {userData?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SeasonSwitcher />
            {displayVideos.filter(v => v.status === 'pending').length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {displayVideos.filter(v => v.status === 'pending').length} pending
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsClipExtractorOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white border border-black/80 active:scale-[0.96] transition-transform cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_2px_4px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.2)] font-medium text-sm"
            >
              <Youtube className="w-4 h-4" />
              <span className="hidden sm:inline">Import YouTube</span>
            </button>
            <button
              onClick={() => setIsS3UploadOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white border border-black/80 active:scale-[0.96] transition-transform cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_2px_4px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.2)] font-medium text-sm"
            >
              <VideoIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Raw</span>
            </button>
            <button
              onClick={() => {
                setSettingsTab('models');
                setIsSettingsOpen(true);
              }}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white border border-black/80 active:scale-[0.96] transition-transform cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMiAyTDEwIDI2TDE0IDE2TDI2IDEyTDIgMloiIGZpbGw9IiM2MzY2ZjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'),_pointer] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_2px_4px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.2)] font-medium text-sm"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Models</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {activeView === "future" ? (
            <FutureFeatures />
          ) : activeView === "pipeline" ? (
            <AIPipeline />
          ) : (
          <>
          {/* Demo Mode Banner */}
          {isDemo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Recruiter Demo Mode</p>
                  <p className="text-xs text-muted-foreground">You're viewing a preview of the Creator Dashboard. Some features are simulated.</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Exit Demo
              </button>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-card/60 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 cursor-default",
                  stat.border
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shadow-inner", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}


            {/* Revenue Split Card (Locked) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => isRevenueLocked && setIsUpgradeModalOpen(true)}
              className={cn(
                "bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-card/60 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 relative group",
                isRevenueLocked
                  ? "cursor-pointer border-indigo-500/20 cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMiAyTDEwIDI2TDE0IDE2TDI2IDEyTDIgMloiIGZpbGw9IiM2MzY2ZjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'),_pointer]"
                  : "cursor-default border-indigo-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-500/10 shadow-inner">
                  <DollarSign className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="group/info relative" onClick={(e) => e.stopPropagation()}>
                    <Eye className="w-4 h-4 text-muted-foreground/50 hover:text-indigo-500 transition-colors cursor-pointer" />
                    <div className="absolute right-0 top-6 w-48 p-2 bg-popover border border-border rounded-lg shadow-lg text-[10px] text-muted-foreground opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-10">
                      Editor and creator can get instant payment after approve to youtube and all.
                    </div>
                  </div>
                  {isRevenueLocked && (
                    <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-full">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              {isRevenueLocked ? (
                <>
                  <p className="text-2xl md:text-3xl font-bold blur-sm select-none tracking-tight">$1,250.00</p>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      Unlock Revenue
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-2xl md:text-3xl font-bold tracking-tight">$0.00</p>
              )}
              <p className="text-xs text-muted-foreground mt-1 font-medium">Estimated Revenue</p>
            </motion.div>

            {/* Editing Tools Card (Locked) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => isRevenueLocked && setIsUpgradeModalOpen(true)}
              className={cn(
                "bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-card/60 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 relative group",
                isRevenueLocked
                  ? "cursor-pointer border-violet-500/20 cursor-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMiAyTDEwIDI2TDE0IDE2TDI2IDEyTDIgMloiIGZpbGw9IiM2MzY2ZjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'),_pointer]"
                  : "cursor-default border-violet-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-violet-500/10 shadow-inner">
                  <Wand2 className="w-5 h-5 text-violet-500" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="group/info relative" onClick={(e) => e.stopPropagation()}>
                    <Eye className="w-4 h-4 text-muted-foreground/50 hover:text-violet-500 transition-colors cursor-pointer" />
                    <div className="absolute right-0 top-6 w-48 p-2 bg-popover border border-border rounded-lg shadow-lg text-[10px] text-muted-foreground opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-10">
                      You will get access to premium editing platform for edit your videos and all.
                    </div>
                  </div>
                  {isRevenueLocked && (
                    <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-full">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              {isRevenueLocked ? (
                <>
                  <p className="text-xl md:text-2xl font-bold blur-sm select-none tracking-tight">Premium Access</p>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                    <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      Unlock Tools
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xl md:text-2xl font-bold tracking-tight">Access Granted</p>
              )}
              <p className="text-xs text-muted-foreground mt-1 font-medium">Editing Tools</p>
            </motion.div>
          </motion.div>

          {/* YouTube Publishing Live Banner */}
          {Object.keys(ytProgressMap).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6"
            >
              {Object.entries(ytProgressMap).map(([videoId, progress]) => {
                const processingVideo = displayVideos.find(v => v._id === videoId);
                const isComplete = progress.percent === 100;
                
                return (
                  <div
                    key={videoId}
                    className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/5 via-rose-500/5 to-orange-500/5 p-4 md:p-5 mb-3"
                  >
                    {!isComplete && <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-red-500/10 animate-pulse opacity-30" />}
                    
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                        {isComplete ? (
                           <CheckCircle className="w-6 h-6 text-red-500" />
                        ) : (
                           <Youtube className="w-6 h-6 text-red-500 animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              {isComplete ? "YouTube Publishing Complete" : "YouTube Publishing Active"}
                            </h3>
                            {!isComplete && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                          </div>
                          <motion.span animate={{ scale: isComplete ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.5 }} className="text-lg font-bold text-red-500">
                             {isComplete ? "Done!" : `${progress.percent}%`}
                          </motion.span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {processingVideo?.title || "Video"} — {isComplete ? "Congratulations! Your video is successfully published to YouTube 🎉" : progress.message}
                        </p>
                        
                        {!isComplete && (
                          <div className="w-full h-2 bg-secondary/80 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress.percent}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* AI Processing Live Banner */}
          {Object.keys(aiProgressMap).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6"
            >
              {Object.entries(aiProgressMap).map(([videoId, progress]) => {
                const processingVideo = displayVideos.find(v => v._id === videoId);
                return (
                  <div
                    key={videoId}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 md:p-5 shadow-2xl"
                  >
                    {/* Animated background pulse */}
                    <div className="absolute inset-0 bg-violet-500/5 animate-pulse" />
                    
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        <Bot className="w-6 h-6 text-violet-400 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white/90">AI Processing Active</h3>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                          </div>
                          <span className="text-lg font-bold text-violet-400">{progress.percent}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {processingVideo?.title || "Video"} — <span className="text-white/70">{progress.message}</span>
                        </p>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/50 border border-border focus:border-primary/50 rounded-full pl-10 pr-5 py-2.5 text-sm outline-none transition-colors focus:bg-background shadow-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setActiveTab("pending")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm",
                  activeTab === "pending"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                Pending Review
              </button>
              <button
                onClick={() => setActiveTab("raw_uploaded")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm",
                  activeTab === "raw_uploaded"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                AI Processing
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm",
                  activeTab === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                All Videos
              </button>
              <button
                onClick={() => setActiveTab("clips")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm",
                  activeTab === "clips"
                    ? "bg-red-600 text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Clips
              </button>
              <button
                onClick={fetchVideos}
                className="p-2.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </button>
            </div>
          </motion.div>

          {/* Videos Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-secondary animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-secondary rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-secondary/70 rounded animate-pulse" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-9 flex-1 bg-secondary rounded animate-pulse" />
                      <div className="h-9 flex-1 bg-secondary rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            activeTab === "clips" ? (
              <ClipsGridView
                clips={filteredVideos as any}
                onDownload={(clip) => {
                  window.open(clip.fileUrl, '_blank');
                }}
                onPublish={(clip, platform) => {
                  toast.success(`Sent to ${platform}!`, { description: `Clip "${clip.title}" queued for publishing.` });
                }}
                onEdit={(clip) => {
                  router.push(`/dashboard/review/${clip._id}`);
                }}
                onDelete={(clip) => {
                  handleDeleteForEveryone(clip._id);
                }}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video as any}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    showActions={video.status === "pending"}
                    isLoading={actionLoading === video._id}
                    onDeleteForMe={handleDeleteForMe}
                    onDeleteForEveryone={
                      ["raw_uploaded", "raw_rejected", "editing_in_progress"].includes(video.status)
                        ? handleDeleteForEveryone
                        : undefined
                    }
                    aiProgress={aiProgressMap[video._id]}
                    showTimeline={true}
                    onAssign={video.status === "raw_uploaded" ? (id) => setAssignModal({ isOpen: true, videoId: id }) : undefined}
                    onExtractClips={["raw_uploaded", "approved"].includes(video.status) && video.isClip !== true ? handleExtractClips : undefined}
                    showComments={true}
                    showActivityTimeline={true}
                  />
                ))}
              </motion.div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-card border border-dashed border-border rounded-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <VideoIcon className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                {activeTab === 'pending'
                  ? "You're all caught up! No pending reviews at the moment."
                  : "Try adjusting your search filters."}
              </p>
              <button
                onClick={() => setIsS3UploadOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Upload New Video
              </button>
            </motion.div>
          )}
          </>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Raw Video</h3>
                <button onClick={() => setIsUploadModalOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUploadRaw} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Video title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes for Editor</label>
                  <textarea
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none h-20"
                    placeholder="Instructions..."
                  />
                </div>

                {editors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Assign Editor (Optional)</label>
                    <select
                      value={selectedEditorId}
                      onChange={(e) => setSelectedEditorId(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary appearance-none"
                    >
                      <option value="">Specific Editor...</option>
                      {editors.map((editor) => (
                        <option key={editor._id} value={editor._id}>
                          {editor.name || editor.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/50 transition-colors relative">
                  <input
                    type="file"
                    accept="video/*"
                    required
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploadFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <VideoIcon className="w-8 h-8 text-primary" />
                      <span className="text-sm font-medium">{uploadFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <VideoIcon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to select video</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Raw Video"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Editor Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manage Team</h3>
                    <p className="text-xs text-muted-foreground">{editors.length} active editors</p>
                  </div>
                </div>
                <button onClick={() => setIsInviteModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              <div className="p-5 space-y-6">
                {/* Active Team List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Editors</h4>

                  {editors.length === 0 ? (
                    <div className="text-center py-4 bg-secondary/30 rounded-xl border border-dashed border-border">
                      <p className="text-sm text-muted-foreground">No editors in your team yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {editors.map((editor) => (
                        <div key={editor._id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {editor.name?.[0] || editor.email?.[0] || 'E'}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate w-[140px]">{editor.name || "Editor"}</p>
                              <p className="text-[10px] text-muted-foreground truncate w-[140px]">{editor.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveEditor(editor._id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Remove Editor"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Invite New Editor</h4>

                  {!inviteLink ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="editor@example.com"
                          className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        onClick={handleInviteEditor}
                        disabled={isInviting || !inviteEmail}
                        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite & Generate Link"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-500">Invite Generated!</p>
                          <p className="text-xs text-muted-foreground">Share this link with your editor</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <code className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                            {inviteLink}
                          </code>
                          <button
                            onClick={copyInviteLink}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border",
                              isCopied
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-secondary text-foreground border-border hover:bg-secondary/80"
                            )}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {isCopied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => { setInviteLink(""); setInviteEmail(""); }}
                        className="w-full py-2 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Invite another editor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectModal({ isOpen: false, videoId: null })}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="bg-red-500/10 p-2 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Reason for Rejection</h3>
                  <p className="text-xs text-muted-foreground">This note will be sent to the editor.</p>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <textarea
                  autoFocus
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="E.g. The audio is out of sync, please fix..."
                  className="w-full h-32 bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none resize-none placeholder:text-muted-foreground/50"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setRejectModal({ isOpen: false, videoId: null })}
                    className="px-4 py-2 text-xs font-medium bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReject}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Reject Video
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => rooms.length > 0 && setIsRoomModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-2">Create New Workspace</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Workspaces help you organize your videos and team.
              </p>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Workspace Name</label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="e.g. My Vlog Channel"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {rooms.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsRoomModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isCreatingRoom || !newRoomName.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreatingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Workspace"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        initialTab={settingsTab}
        userData={userData}
      />

      <SubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={subscription?.plan || "free"}
      />

      {/* S3 Direct Upload Modal — supports up to 10 GB */}
      <S3UploadModal
        isOpen={isS3UploadOpen}
        onClose={() => setIsS3UploadOpen(false)}
        onSuccess={(video) => {
          // if (video) startGeminiProxy(video); // Use backend WS instead
          fetchVideos();
        }}
        roomId={currentRoom?._id}
        isRaw={true}
        title="Upload Raw Video"
      />

      <AnimatePresence>
        {isIntegrationsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={() => setIsIntegrationsOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 pb-2">
                <h2 className="text-2xl font-bold mb-1 tracking-tight">Integrations</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your accounts to publish content automatically.
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* YouTube */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">YouTube</h3>
                      <p className="text-xs text-muted-foreground">Publish videos directly</p>
                    </div>
                  </div>
                  <a
                    href={getGoogleAuthUrl()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Connect
                  </a>
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Instagram</h3>
                      <p className="text-xs text-muted-foreground">Post reels & stories</p>
                    </div>
                  </div>
                  <span className="relative z-10 px-3 py-1 bg-secondary text-muted-foreground text-xs font-semibold uppercase tracking-wider rounded-full border border-border">
                    Coming Soon
                  </span>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 relative overflow-hidden group">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Linkedin className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">LinkedIn</h3>
                      <p className="text-xs text-muted-foreground">Share professional updates</p>
                    </div>
                  </div>
                  <span className="relative z-10 px-3 py-1 bg-secondary text-muted-foreground text-xs font-semibold uppercase tracking-wider rounded-full border border-border">
                    Coming Soon
                  </span>
                </div>

                {/* X / Twitter */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 relative overflow-hidden group">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                      <Twitter className="w-6 h-6 text-foreground" fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="font-semibold">X (Twitter)</h3>
                      <p className="text-xs text-muted-foreground">Share short clips & posts</p>
                    </div>
                  </div>
                  <span className="relative z-10 px-3 py-1 bg-secondary text-muted-foreground text-xs font-semibold uppercase tracking-wider rounded-full border border-border">
                    Coming Soon
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Editor Modal */}
      <AssignEditorModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, videoId: null })}
        onAssign={handleAssignEditor}
        editors={editors}
        videoTitle={
          assignModal.videoId
            ? (videos.find(v => v._id === assignModal.videoId)?.title || "Untitled Video")
            : ""
        }
      />

      {/* Clip Extractor Modal */}
      <ClipExtractorModal
        isOpen={isClipExtractorOpen}
        onClose={() => setIsClipExtractorOpen(false)}
        onSubmit={async (url) => {
          await videoAPI.extractClips({ youtubeUrl: url, roomId: currentRoom?._id });
          toast.success("Extraction Started!", { description: "AI is downloading and analyzing the video. Clips will appear soon." });
          setActiveTab("clips");
        }}
      />
    </div>
  );
}
