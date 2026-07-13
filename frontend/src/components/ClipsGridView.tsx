"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Download, Youtube, Instagram, Linkedin, Twitter, Sparkles, TrendingUp, Trash2, Edit2, Maximize2, Volume2, VolumeX, X } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface Clip {
  _id: string;
  title: string;
  fileUrl: string;
  viralScore?: number;
  aspectRatio?: string;
  parentVideoId?: string;
  createdAt?: string;
}

interface ClipsGridViewProps {
  clips: Clip[];
  onDownload: (clip: Clip) => void;
  onPublish: (clip: Clip, platform: string) => void;
  onEdit?: (clip: Clip) => void;
  onDelete?: (clip: Clip) => void;
}

export default function ClipsGridView({ clips, onDownload, onPublish, onEdit, onDelete }: ClipsGridViewProps) {
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  if (clips.length === 0) {
    return (
      <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C8A97E]/10 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-[#C8A97E]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No clips extracted yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Import a YouTube video or use the Smart Extractor on your raw uploads to generate viral clips.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {clips.map((clip) => (
          <ClipCard
            key={clip._id}
            clip={clip}
            onDownload={() => onDownload(clip)}
            onPublish={(platform) => onPublish(clip, platform)}
            onEdit={onEdit ? () => onEdit(clip) : undefined}
            onDelete={onDelete ? () => onDelete(clip) : undefined}
            onZoom={() => setSelectedClip(clip)}
          />
        ))}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {selectedClip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
            onClick={() => setSelectedClip(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative h-[90vh] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedClip(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-primary transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
              
              <video
                controls
                autoPlay
                className="w-full h-full object-contain"
                src={selectedClip.fileUrl}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ClipCard({ clip, onDownload, onPublish, onEdit, onDelete, onZoom }: { clip: Clip; onDownload: () => void; onPublish: (platform: string) => void; onEdit?: () => void; onDelete?: () => void; onZoom: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden flex flex-col group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview (Vertical 9:16 aspect ratio look) */}
      <div className="relative aspect-[9/16] bg-black overflow-hidden flex-shrink-0 cursor-pointer">
        
        {/* Action Buttons (Edit / Delete) */}
        <div className="absolute top-3 left-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-violet-600 hover:border-violet-400 transition-colors shadow-xl"
              title="Edit Clip"
            >
              <Edit2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-red-600 hover:border-red-400 transition-colors shadow-xl"
              title="Delete Clip"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
        <video
          ref={videoRef}
          src={clip.fileUrl}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          loop
          muted={isMuted}
          playsInline
        />
        
        {/* Play overlay when not hovered and not playing */}
        <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none", isHovered || isPlaying ? "opacity-0" : "opacity-100")}>
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-white ml-1" />
          </div>
        </div>

        {/* Video Controls Overlay */}
        <div className={cn("absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 pointer-events-none", isHovered || isPlaying ? "opacity-100" : "opacity-0")}>
          <div className="flex justify-center items-center gap-3 pointer-events-auto">
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 transition-all shadow-xl"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>
            <button 
              onClick={toggleMute}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 transition-all shadow-xl"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onZoom(); }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 transition-all shadow-xl text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viral Score Badge */}
        {clip.viralScore !== undefined && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-xl">
            <TrendingUp className={cn("w-3 h-3", clip.viralScore >= 90 ? "text-red-500" : clip.viralScore >= 80 ? "text-[#C8A97E]" : "text-emerald-400")} />
            <span className="text-[10px] font-bold text-white">{clip.viralScore}/100</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
        <h3 className="text-sm font-semibold text-white line-clamp-2 drop-shadow-md">
          {clip.title}
        </h3>
        
        {/* Hover Actions */}
        <div className={cn("flex flex-col gap-2 transition-all duration-300", isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none")}>
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-md border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onPublish("youtube"); }}
              className="flex items-center justify-center py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-colors"
              title="Publish to YouTube Shorts"
            >
              <Youtube className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPublish("instagram"); }}
              className="flex items-center justify-center py-1.5 rounded-lg bg-pink-600/80 hover:bg-pink-600 text-white backdrop-blur-md transition-colors"
              title="Publish to Instagram Reels"
            >
              <Instagram className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPublish("linkedin"); }}
              className="flex items-center justify-center py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white backdrop-blur-md transition-colors"
              title="Publish to LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPublish("twitter"); }}
              className="flex items-center justify-center py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-white backdrop-blur-md transition-colors"
              title="Publish to X (Twitter)"
            >
              <Twitter className="w-3.5 h-3.5" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
