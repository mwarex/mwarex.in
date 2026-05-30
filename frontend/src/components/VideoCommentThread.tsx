"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, ChevronDown, Loader2 } from "lucide-react";
import { videoAPI } from "@/lib/api";
import { getUserData } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Comment {
  _id: string;
  text: string;
  author: string;
  authorInitial: string;
  isOwn: boolean;
  isAI?: boolean;
  createdAt: string;
}

interface VideoCommentThreadProps {
  videoId: string;
  videoTitle?: string;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function mapRawComment(c: any, myId: string): Comment {
  const authorId = c.author?._id || c.author;
  const isAI = c.isAI === true;
  const authorName = isAI ? "AI Editor" : (c.author?.name || c.author?.email || "Unknown");
  return {
    _id: c._id || String(Math.random()),
    text: c.text,
    author: authorName,
    authorInitial: isAI ? "🤖" : (authorName[0]?.toUpperCase() || "?"),
    isOwn: !isAI && String(authorId) === String(myId),
    isAI,
    createdAt: c.createdAt || new Date().toISOString(),
  };
}

export default function VideoCommentThread({ videoId, videoTitle }: VideoCommentThreadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const userData = getUserData();
  const myId = (userData as any)?.id || "";
  const myName = (userData as any)?.name || (userData as any)?.email || "You";
  const myInitial = myName[0]?.toUpperCase() || "U";

  const scrollToBottom = () => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const fetchComments = useCallback(async () => {
    try {
      const res = await videoAPI.getVideo(videoId);
      const raw = res.data?.comments || [];
      setComments(raw.map((c: any) => mapRawComment(c, myId)));
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [videoId, myId]);

  // ── Socket: join the video room and listen for new_comment ──
  useEffect(() => {
    const socket = getSocket();
    // Join the per-video socket channel
    socket.emit("join_video", videoId);

    const handleNewComment = (raw: any) => {
      // raw can be either { comment } or the comment itself
      const commentData = raw?.comment || raw;
      const mapped = mapRawComment(commentData, myId);

      setComments((prev) => {
        // avoid duplicate optimistic entries
        if (prev.some((c) => c._id === mapped._id)) return prev;
        return [...prev, mapped];
      });
      scrollToBottom();
    };

    socket.on("new_comment", handleNewComment);

    return () => {
      socket.off("new_comment", handleNewComment);
    };
  }, [videoId, myId]);

  // ── Fetch on first open ──
  useEffect(() => {
    if (isOpen && !fetchedRef.current) {
      fetchedRef.current = true;
      setIsLoading(true);
      fetchComments();
    }
    if (isOpen) scrollToBottom();
  }, [isOpen, fetchComments]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;

    // Optimistic insert
    const optimistic: Comment = {
      _id: `opt-${Date.now()}`,
      text,
      author: myName,
      authorInitial: myInitial,
      isOwn: true,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    setNewComment("");
    setIsSending(true);
    scrollToBottom();

    try {
      await videoAPI.addComment(videoId, text);
      // Backend will emit new_comment via socket — refetch to get real IDs
      await fetchComments();
    } catch {
      toast.error("Failed to send comment");
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
      setNewComment(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  const unreadCount = comments.length;

  return (
    <div className="border-t border-white/6">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/3 transition-all"
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comments</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen ? "rotate-180" : "")}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3">
              {/* Message list */}
              <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 scroll-smooth">
                {isLoading ? (
                  <div className="flex justify-center py-5">
                    <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-5 text-white/25 text-xs italic">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c._id}
                      className={cn("flex gap-2.5", c.isOwn ? "flex-row-reverse" : "")}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                          c.isAI
                            ? "bg-violet-500/20 text-violet-300 text-xs"
                            : c.isOwn
                            ? "bg-primary/20 text-primary"
                            : "bg-[#C8A97E]/20 text-[#C8A97E]"
                        )}
                      >
                        {c.isAI ? "🤖" : c.authorInitial}
                      </div>

                      <div
                        className={cn(
                          "max-w-[78%] flex flex-col",
                          c.isOwn ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs leading-relaxed",
                            c.isAI
                              ? "bg-violet-500/10 text-violet-200 border border-violet-500/20 rounded-tl-sm"
                              : c.isOwn
                              ? "bg-primary/15 text-white border border-primary/20 rounded-tr-sm"
                              : "bg-white/6 text-white/80 border border-white/8 rounded-tl-sm"
                          )}
                        >
                          {c.text}
                        </div>
                        <span className="text-[10px] text-white/25 mt-0.5 px-1">
                          {!c.isOwn && (
                            <span className="font-medium text-white/35">{c.author} · </span>
                          )}
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <textarea
                  rows={1}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message creator / editor… (Enter to send)"
                  className="flex-1 resize-none bg-white/5 border border-white/10 focus:border-primary/40 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 outline-none transition-all max-h-20"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSending}
                  className="w-8 h-8 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary flex items-center justify-center shrink-0 disabled:opacity-30 transition-all active:scale-95"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
