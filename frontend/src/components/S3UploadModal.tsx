"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileVideo,
  CloudUpload,
  Zap,
  Wifi,
  Clock,
  Sparkles,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { s3API, videoAPI, aiAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface S3UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomId?: string;
  editorId?: string;
  isRaw?: boolean;
  title?: string;
}

type UploadPhase = "idle" | "presigning" | "uploading" | "registering" | "done" | "error";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "calculating...";
  if (seconds < 60) return `${Math.round(seconds)}s left`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m left`;
  return `${Math.round(seconds / 3600)}h left`;
}

function formatSpeed(bytesPerSecond: number): string {
  if (!isFinite(bytesPerSecond) || bytesPerSecond <= 0) return "";
  return `${formatBytes(bytesPerSecond)}/s`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function S3UploadModal({
  isOpen,
  onClose,
  onSuccess,
  roomId,
  editorId,
  isRaw = false,
  title = "Upload Video",
}: S3UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);          // 0–100
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [speedBps, setSpeedBps] = useState(0);          // bytes per second
  const [eta, setEta] = useState(0);                    // seconds remaining
  const [errorMsg, setErrorMsg] = useState("");
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const startTimeRef = useRef<number>(0);

  // ── Thumbnail state ───────────────────────────────────────────────────────
  const [thumbnailPrompt, setThumbnailPrompt] = useState("");
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState("");
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  // ── Reset state ────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setFile(null);
    setVideoTitle("");
    setDescription("");
    setPhase("idle");
    setProgress(0);
    setUploadedBytes(0);
    setSpeedBps(0);
    setEta(0);
    setErrorMsg("");
    setThumbnailPrompt("");
    setGeneratedThumbnails([]);
    setSelectedThumbnail("");
    setThumbnailFile(null);
    setThumbnailPreview("");
  }, []);

  // ── Reset state when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    if (phase === "uploading" && xhrRef.current) {
      xhrRef.current.abort();
    }
    onClose();
  };

  // ── Handle local thumbnail file selection ─────────────────────────────────
  const handleThumbnailFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith("image/")) {
      setThumbnailFile(selected);
      setThumbnailPreview(URL.createObjectURL(selected));
      setSelectedThumbnail(""); // clear AI selection
      setGeneratedThumbnails([]);
    }
  };

  // ── Upload thumbnail to S3 and return the URL ─────────────────────────────
  const uploadThumbnailToS3 = async (): Promise<string> => {
    let fileToUpload = thumbnailFile;

    // If an AI-generated thumbnail URL was selected, download it to upload to S3
    if (selectedThumbnail) {
      try {
        const response = await fetch(selectedThumbnail);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        fileToUpload = new File([blob], `thumbnail-${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
      } catch (err) {
        console.error("Failed to fetch AI thumbnail for S3 upload. Falling back to raw URL:", err);
        return selectedThumbnail; 
      }
    }

    // Upload the file to S3
    if (fileToUpload) {
      const presignRes = await s3API.getPresignedUrl({
        filename: fileToUpload.name,
        contentType: fileToUpload.type || "image/jpeg",
        folder: "thumbnails",
      });

      const { url, fields, fileUrl } = presignRes.data;

      const formData = new FormData();
      Object.entries(fields as Record<string, string>).forEach(([k, v]) => {
        formData.append(k, v);
      });
      formData.append("file", fileToUpload);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 thumbnail error: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Thumbnail upload failed"));
        xhr.open("POST", url);
        xhr.send(formData);
      });

      return fileUrl;
    }

    return "";
  };

  // ── AI Thumbnail generation ───────────────────────────────────────────────
  const handleGenerateThumbnails = async () => {
    if (!thumbnailPrompt) return;
    setIsGeneratingThumbnail(true);
    try {
      const res = await aiAPI.generateThumbnails({ topic: thumbnailPrompt });
      setGeneratedThumbnails(res.data.thumbnails.map((t: any) => t.url));
    } catch (err) {
      console.error("Thumbnail generation failed:", err);
      toast.error("Failed to generate thumbnails");
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const clearThumbnail = () => {
    setSelectedThumbnail("");
    setThumbnailFile(null);
    setThumbnailPreview("");
    setGeneratedThumbnails([]);
    setThumbnailPrompt("");
  };

  // ── Main upload handler ────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !videoTitle.trim()) return;

    setErrorMsg("");
    setProgress(0);
    setUploadedBytes(0);

    try {
      // ── Step 0: Upload thumbnail if provided ───────────────────────────────
      let thumbnailUrl = "";
      if (selectedThumbnail || thumbnailFile) {
        try {
          thumbnailUrl = await uploadThumbnailToS3();
        } catch (err) {
          console.error("Thumbnail upload failed:", err);
          // Don't block video upload if thumbnail fails
        }
      }

      // ── Step 1: Get presigned URL from backend ─────────────────────────────
      setPhase("presigning");
      const presignRes = await s3API.getPresignedUrl({
        filename: file.name,
        contentType: file.type || "video/mp4",
        folder: isRaw ? "raw-videos" : "edited-videos",
      });

      const { url, fields, key, fileUrl } = presignRes.data;

      // ── Step 2: Upload directly to S3 with XHR progress tracking ───────────
      // S3 presigned POST = browser sends file DIRECTLY to Amazon
      // Your backend server is NOT involved — no size limits!
      setPhase("uploading");
      startTimeRef.current = Date.now();

      await new Promise<void>((resolve, reject) => {
        const formData = new FormData();

        // S3 requires fields in exact order, then the file last
        Object.entries(fields as Record<string, string>).forEach(([k, v]) => {
          formData.append(k, v);
        });
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener("progress", (evt) => {
          if (!evt.lengthComputable) return;

          const pct = Math.round((evt.loaded / evt.total) * 100);
          const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds
          const speed = elapsed > 0 ? evt.loaded / elapsed : 0;
          const remaining = speed > 0 ? (evt.total - evt.loaded) / speed : 0;

          setProgress(pct);
          setUploadedBytes(evt.loaded);
          setSpeedBps(speed);
          setEta(remaining);
        });

        xhr.onload = () => {
          // S3 returns 204 No Content on success
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 error: ${xhr.status} — ${xhr.responseText}`));
          }
        };

        xhr.onerror  = () => reject(new Error("Network error during upload. Check your connection."));
        xhr.onabort  = () => reject(new Error("CANCELLED"));
        xhr.ontimeout = () => reject(new Error("Upload timed out. Check your connection."));

        xhr.open("POST", url);
        xhr.timeout = 0; // no timeout for large files
        xhr.send(formData);
      });

      setProgress(100);

      // ── Step 3: Register video in MongoDB ──────────────────────────────────
      setPhase("registering");
      await videoAPI.registerFromS3({
        fileUrl,
        s3Key: key,
        title: videoTitle.trim(),
        description: description.trim(),
        roomId,
        editorId,
        isRaw,
        thumbnailUrl,
      });

      setPhase("done");
      toast.success(isRaw ? "Raw video uploaded! Editor can now see it." : "Edited video submitted!");
      onSuccess();
      handleClose();
    } catch (err: any) {
      if (err.message === "CANCELLED") {
        reset();
        return;
      }
      console.error("[S3Upload]", err);
      setErrorMsg(err.response?.data?.message || err.message || "Upload failed. Please try again.");
      setPhase("error");
    }
  };

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("video/")) {
      setFile(dropped);
    }
  };

  const isUploading = phase === "uploading" || phase === "presigning" || phase === "registering";
  const hasThumbnail = !!selectedThumbnail || !!thumbnailFile;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isUploading ? handleClose : undefined}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-violet-500/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center border border-primary/20">
                  <CloudUpload className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Zap className="w-2.5 h-2.5 text-amber-500" />
                    Direct to AWS S3 — up to 10 GB — no server limit
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {/* Title & Description */}
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Video Title *"
                  disabled={isUploading}
                  className="w-full bg-secondary/30 border border-border focus:border-primary/50 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:bg-background placeholder:text-muted-foreground/60 disabled:opacity-50"
                />
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="AI Prompt (e.g., 'Cut silences, make it cinematic, remove off-topic parts')"
                  disabled={isUploading}
                  className="w-full bg-secondary/30 border border-border focus:border-primary/50 rounded-lg px-3 py-2.5 text-sm outline-none transition-all resize-none focus:bg-background placeholder:text-muted-foreground/60 disabled:opacity-50"
                />
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-6 text-center transition-all",
                  file ? "border-emerald-500/40 bg-emerald-500/5" : "border-border hover:border-primary/40 hover:bg-secondary/10",
                  isUploading && "pointer-events-none opacity-60"
                )}
              >
                <input
                  type="file"
                  accept="video/*"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  disabled={isUploading}
                />
                {file ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <FileVideo className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Click or drag video here</p>
                    <p className="text-xs text-muted-foreground">MP4, MOV, MKV, AVI — up to <strong>10 GB</strong></p>
                  </div>
                )}
              </div>

              {/* ── Thumbnail Section ──────────────────────────────────────── */}
              {(
                <div className="border border-border rounded-xl p-3.5 bg-secondary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Thumbnail
                    </label>
                    {hasThumbnail && (
                      <button
                        type="button"
                        onClick={clearThumbnail}
                        className="text-[10px] text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Show selected thumbnail preview */}
                  {hasThumbnail ? (
                    <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-border mx-auto group">
                      <img
                        src={selectedThumbnail || thumbnailPreview}
                        className="h-full w-full object-cover"
                        alt="Thumbnail preview"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* AI Generation */}
                      <div className="flex gap-2">
                        <input
                          value={thumbnailPrompt}
                          onChange={(e) => setThumbnailPrompt(e.target.value)}
                          placeholder="AI prompt for thumbnail..."
                          disabled={isUploading}
                          className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary/50 placeholder:text-muted-foreground/50 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          disabled={isGeneratingThumbnail || !thumbnailPrompt || isUploading}
                          onClick={handleGenerateThumbnails}
                          className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isGeneratingThumbnail ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          Generate
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* Upload from Device */}
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border hover:border-primary/30 hover:bg-secondary/20 transition-all text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        Upload from device
                      </button>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* AI Generated Thumbnails Grid */}
                  {generatedThumbnails.length > 0 && !selectedThumbnail && !thumbnailFile && (
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {generatedThumbnails.slice(0, 4).map((url, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedThumbnail(url)}
                          className="aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                        >
                          <img src={url} className="w-full h-full object-cover" alt={`Thumbnail option ${i + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Upload Progress (while uploading) ────────────────────── */}
              <AnimatePresence>
                {(phase === "presigning" || phase === "uploading" || phase === "registering" || phase === "done") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4"
                  >
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          {phase === "presigning" && <><Loader2 className="w-3 h-3 animate-spin" /> Preparing...</>}
                          {phase === "uploading" && <><CloudUpload className="w-3 h-3 text-primary animate-pulse" /> Uploading to AWS S3</>}
                          {phase === "registering" && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
                          {phase === "done" && <><CheckCircle className="w-3 h-3 text-emerald-500" /> Complete!</>}
                        </span>
                        <span className={cn(
                          "font-bold tabular-nums",
                          phase === "done" ? "text-emerald-500" : "text-primary"
                        )}>
                          {phase === "presigning" ? "—" : `${progress}%`}
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            phase === "done"
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-primary via-violet-500 to-blue-500 bg-[length:200%] animate-[gradientShift_2s_linear_infinite]"
                          )}
                          initial={{ width: "0%" }}
                          animate={{
                            width: phase === "presigning" ? "5%"
                              : phase === "uploading" ? `${progress}%`
                              : phase === "registering" ? "97%"
                              : "100%",
                          }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>

                    {/* Stats Row */}
                    {phase === "uploading" && file && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {/* Uploaded */}
                        <div className="rounded-lg bg-background/50 p-2 border border-border/50">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Uploaded</p>
                          <p className="text-xs font-bold tabular-nums">
                            {formatBytes(uploadedBytes)}
                            <span className="text-[10px] font-normal text-muted-foreground"> / {formatBytes(file.size)}</span>
                          </p>
                        </div>

                        {/* Speed */}
                        <div className="rounded-lg bg-background/50 p-2 border border-border/50">
                          <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
                            <Wifi className="w-2.5 h-2.5" /> Speed
                          </p>
                          <p className="text-xs font-bold text-primary tabular-nums">
                            {formatSpeed(speedBps) || "—"}
                          </p>
                        </div>

                        {/* ETA */}
                        <div className="rounded-lg bg-background/50 p-2 border border-border/50">
                          <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> ETA
                          </p>
                          <p className="text-xs font-bold tabular-nums">
                            {progress > 2 ? formatTime(eta) : "—"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tip while uploading */}
                    {phase === "uploading" && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        💡 You can minimize this — upload runs in the background
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {phase === "error" && errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isUploading || phase === "done"}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                  "bg-gradient-to-r from-primary to-violet-600 text-white shadow-lg shadow-primary/20",
                  "hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:opacity-60"
                )}
              >
                {phase === "idle" || phase === "error" ? (
                  <><CloudUpload className="w-4 h-4" /> Upload to S3</>
                ) : phase === "done" ? (
                  <><CheckCircle className="w-4 h-4" /> Done!</>
                ) : (
                  <><Loader2 className="w-4 h-4 animate-spin" />
                    {phase === "presigning" ? "Preparing..." : phase === "registering" ? "Saving..." : `Uploading... ${progress}%`}
                  </>
                )}
              </button>

              {/* Cancel while uploading */}
              {phase === "uploading" && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Cancel Upload
                </button>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
