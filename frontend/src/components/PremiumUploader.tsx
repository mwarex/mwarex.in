"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Film, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import axios from "axios";

export function PremiumUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("processing");
      // Send directly to the local Python Bridge on Port 5002
      const res = await axios.post("http://localhost:5002/api/edit-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === "success" && res.data.video_url) {
        setVideoUrl(res.data.video_url);
        setStatus("done");
      } else {
        throw new Error(res.data.error || "Unknown error occurred");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.response?.data?.error || err.message || "Failed to process video");
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-4">
          Top 0.1% Editor
        </h1>
        <p className="text-zinc-400 max-w-lg mx-auto font-light">
          Upload your raw video. The AI will completely edit it, inject cinematic B-roll, and apply aesthetic captions in a single pass.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" || status === "error" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-80 rounded-2xl bg-zinc-950/40 border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-zinc-900/50 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group overflow-hidden"
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">
                  {file ? file.name : "Drag & drop your video here"}
                </h3>
                <p className="text-sm text-zinc-500">
                  {file ? "Click to change file" : "MP4 files up to 500MB"}
                </p>
              </div>

              <input
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            {errorMsg && (
              <div className="mt-4 p-4 rounded-lg bg-red-950/50 border border-red-500/20 text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!file}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all ${
                  file
                    ? "bg-white text-black hover:bg-zinc-200 hover:scale-105"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Start AI Editing
              </button>
            </div>
          </motion.div>
        ) : status === "uploading" || status === "processing" ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-80 rounded-2xl bg-zinc-950/40 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Background scanning effect */}
            <motion.div 
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-full h-[20%] bg-gradient-to-b from-transparent via-primary/10 to-transparent"
            />
            
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
            <h3 className="text-xl font-medium text-white mb-2">
              {status === "uploading" ? "Uploading to AI Engine..." : "Ollama is editing..."}
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs text-center">
              This might take a few minutes. We are running Whisper, Llama, and the FFmpeg Single-Pass Renderer.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="w-full rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-zinc-900/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-white tracking-wide">Ready to Publish</span>
              </div>
              <div className="aspect-video w-full bg-black relative">
                {videoUrl && (
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setFile(null);
                  setVideoUrl(null);
                  setStatus("idle");
                }}
                className="px-6 py-2 rounded-full border border-white/10 text-white text-sm hover:bg-white/5 transition-colors"
              >
                Edit Another Video
              </button>
              {videoUrl && (
                <a
                  href={videoUrl}
                  download="top_0.1_edit.mp4"
                  className="px-6 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                  <Film className="w-4 h-4" />
                  Download Masterpiece
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
