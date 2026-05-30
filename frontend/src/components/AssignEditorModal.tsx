"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserCheck,
  FileText,
  Calendar,
  Loader2,
  CheckCircle,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Editor {
  _id: string;
  name: string;
  email: string;
  videosInProgress?: number;
}

interface AssignEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (editorId: string, brief: string, deadline: string) => Promise<void>;
  editors: Editor[];
  videoTitle: string;
}

const EDITING_STYLE_PRESETS = [
  "Cut silences, add captions",
  "MrBeast-style fast cuts",
  "Cinematic documentary style",
  "Add B-roll + music",
  "Shorts/Reels format (60s)",
  "Custom instructions below",
];

export default function AssignEditorModal({
  isOpen,
  onClose,
  onAssign,
  editors,
  videoTitle,
}: AssignEditorModalProps) {
  const [selectedEditorId, setSelectedEditorId] = useState("");
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");

  const handlePreset = (preset: string) => {
    if (preset === "Custom instructions below") {
      setSelectedPreset(preset);
      return;
    }
    setSelectedPreset(preset);
    setBrief((prev) => {
      const existing = prev.trim();
      if (existing && !EDITING_STYLE_PRESETS.includes(existing)) {
        return existing; // keep custom text
      }
      return preset;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditorId) return;
    setIsAssigning(true);
    try {
      await onAssign(selectedEditorId, brief, deadline);
      // reset
      setSelectedEditorId("");
      setBrief("");
      setDeadline("");
      setSelectedPreset("");
      onClose();
    } finally {
      setIsAssigning(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full sm:max-w-lg bg-[#0f0f0f] border border-white/10 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
          >
            {/* Gold accent top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#C8A97E]/60 via-[#D4AF37]/80 to-[#C8A97E]/60" />

            {/* Header */}
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C8A97E]/10 border border-[#C8A97E]/20 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-[#C8A97E]" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-white">Assign to Editor</h2>
                  <p className="text-[11px] text-white/40 truncate max-w-[220px]">{videoTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Editor Selection */}
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Select Editor
                </label>
                {editors.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>No editors in this workspace yet. Invite one first.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editors.map((editor) => (
                      <button
                        key={editor._id}
                        type="button"
                        onClick={() => setSelectedEditorId(editor._id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left",
                          selectedEditorId === editor._id
                            ? "bg-[#C8A97E]/10 border-[#C8A97E]/40 shadow-sm shadow-[#C8A97E]/10"
                            : "bg-white/3 border-white/8 hover:border-white/15 hover:bg-white/5"
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all",
                            selectedEditorId === editor._id
                              ? "bg-[#C8A97E]/20 text-[#C8A97E]"
                              : "bg-white/8 text-white/60"
                          )}
                        >
                          {editor.name?.[0]?.toUpperCase() || "E"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{editor.name}</p>
                          <p className="text-[11px] text-white/40 truncate">{editor.email}</p>
                        </div>

                        {editor.videosInProgress !== undefined && (
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                              editor.videosInProgress === 0
                                ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                                : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                            )}
                          >
                            {editor.videosInProgress === 0
                              ? "Available"
                              : `${editor.videosInProgress} in progress`}
                          </span>
                        )}

                        {selectedEditorId === editor._id && (
                          <CheckCircle className="w-4 h-4 text-[#C8A97E] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Brief Presets */}
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Editing Style
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {EDITING_STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePreset(preset)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200",
                        selectedPreset === preset
                          ? "bg-[#C8A97E]/15 border-[#C8A97E]/40 text-[#C8A97E]"
                          : "bg-white/3 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Task Brief
                </label>
                <textarea
                  rows={3}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe what you need: cuts, transitions, captions, B-roll references, music vibe..."
                  className="w-full resize-none bg-white/4 border border-white/10 focus:border-[#C8A97E]/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline <span className="text-white/25 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <input
                  type="date"
                  min={today}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white/4 border border-white/10 focus:border-[#C8A97E]/40 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all [color-scheme:dark]"
                />
                {deadline && (
                  <p className="text-[11px] text-white/35 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due:{" "}
                    {new Date(deadline).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedEditorId || isAssigning}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                  selectedEditorId
                    ? "bg-[#C8A97E] text-[#0d0d0d] hover:bg-[#D4AF37] shadow-lg shadow-[#C8A97E]/20"
                    : "bg-white/5 text-white/25 cursor-not-allowed"
                )}
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Assign to Editor
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
