"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Youtube, Link2, Sparkles, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClipExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
}

export default function ClipExtractorModal({ isOpen, onClose, onSubmit }: ClipExtractorModalProps) {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(url);
      setUrl("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start extraction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 to-[#C8A97E]" />

            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                  <Youtube className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-white">Import from YouTube</h2>
                  <p className="text-[11px] text-white/40">Smart Clip Extractor</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  YouTube URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); }}
                  className="w-full bg-white/4 border border-white/10 focus:border-red-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all"
                />
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
              </div>

              <div className="bg-white/3 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-white/90">AI Analysis</p>
                    <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                      Our Gemini model will analyze the video's transcript and structure to find the most engaging 30-90s clips.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Play className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-white/90">Auto-Formatting</p>
                    <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                      Clips will be automatically cut and added to your dashboard, ready to be published to Shorts, Reels, and TikTok.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!url || isSubmitting}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                  url
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                    : "bg-white/5 text-white/25 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Clips...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract Clips
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
