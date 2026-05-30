"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, ChevronDown, Loader2, X } from "lucide-react";
import { videoAPI } from "@/lib/api";
import { getUserData } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Comment {
  _id: string;
  text: string;
  author: string;
  authorInitial: string;
  role: "creator" | "editor" | "you";
  createdAt: string;
}

interface VideoCommentThreadProps {
  videoId: string;
  videoTitle: string;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function VideoCommentThread({ videoId, videoTitle }: VideoCommentThreadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userData = getUserData();
  const myName = userData?.name || userData?.email || "You";
  const myInitial = myName[0]?.toUpperCase() || "U";

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await videoAPI.getVideo(videoId);
      const rawComments = res.data?.comments || [];
      const mapped: Comment[] = rawComments.map((c: any) => ({
        _id: c._id,
        text: c.text,
        author: c.author?.name || c.author?.email || "Unknown",
        authorInitial: (c.author?.name || c.author?.email || "U")[0].toUpperCase(),
        role: c.author?._id === userData?.id ? "you" : c.author?.role || "editor",
        createdAt: c.createdAt || new Date().toISOString(),
      }));
      setComments(mapped);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && comments.length === 0) {
      fetchComments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [comments, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment: Comment = {
      _id: `temp-${Date.now()}`,
      text: newComment.trim(),
      author: myName,
      authorInitial: myInitial,
      role: "you",
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, tempComment]);
    const sentText = newComment.trim();
    setNewComment("");
    setIsSending(true);

    try {
      await videoAPI.addComment(videoId, sentText);
      // refresh to get real IDs from backend
      fetchComments();
    } catch (err) {
      toast.error("Failed to send comment");
      setComments((prev) => prev.filter((c) => c._id !== tempComment._id));
      setNewComment(sentText);
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

  return (
    <div className="border-t border-white/6">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/3 transition-all"
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>
            Comments
            {comments.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                {comments.length}
              </span>
            )}
          </span>
        </span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen ? "rotate-180" : "")}
        />
      </button>

      {/* Comment Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3">
              {/* Messages */}
              <div className="max-h-44 overflow-y-auto space-y-2.5 pr-1">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-4 text-white/25 text-xs italic">
                    No comments yet. Be the first to leave feedback!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className={cn("flex gap-2.5", comment.role === "you" ? "flex-row-reverse" : "")}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                          comment.role === "you"
                            ? "bg-primary/20 text-primary"
                            : comment.role === "creator"
                            ? "bg-[#C8A97E]/20 text-[#C8A97E]"
                            : "bg-violet-500/20 text-violet-400"
                        )}
                      >
                        {comment.authorInitial}
                      </div>

                      <div
                        className={cn(
                          "max-w-[78%]",
                          comment.role === "you" ? "items-end" : "items-start",
                          "flex flex-col"
                        )}
                      >
                        <div
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs leading-relaxed",
                            comment.role === "you"
                              ? "bg-primary/15 text-white rounded-tr-sm border border-primary/20"
                              : "bg-white/6 text-white/80 rounded-tl-sm border border-white/8"
                          )}
                        >
                          {comment.text}
                        </div>
                        <span className="text-[10px] text-white/25 mt-0.5 px-1">
                          {comment.role !== "you" && (
                            <span className="font-medium text-white/35">{comment.author} · </span>
                          )}
                          {timeAgo(comment.createdAt)}
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
                  ref={inputRef}
                  rows={1}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Leave feedback... (Enter to send)"
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
