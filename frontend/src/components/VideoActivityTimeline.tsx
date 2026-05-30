"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FileVideo,
  UserCheck,
  CheckCircle,
  XCircle,
  Upload,
  Youtube,
  ChevronDown,
  Bot,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  key: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  active: boolean;
  timestamp?: string;
}

interface VideoActivityTimelineProps {
  video: {
    status: string;
    createdAt?: string;
    updatedAt?: string;
    goLiveAt?: string;
    editorId?: any;
    youtubeId?: string;
    rejectionReason?: string;
    editorRejectionReason?: string;
  };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VideoActivityTimeline({ video }: VideoActivityTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);

  const STATUS_ORDER = [
    "raw_uploaded",
    "editing_in_progress",
    "ai_processing",
    "pending",
    "approved",
    "uploaded",
    "rejected",
    "raw_rejected",
  ];

  const currentStatusIndex = STATUS_ORDER.indexOf(video.status);
  const isRejected = video.status === "rejected" || video.status === "raw_rejected";

  const editorName =
    typeof video.editorId === "object" && video.editorId?.name
      ? video.editorId.name
      : undefined;

  const events: TimelineEvent[] = [
    {
      key: "uploaded",
      label: "Raw Uploaded",
      sublabel: formatDate(video.createdAt),
      icon: FileVideo,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
      active: true, // always true if we have the video
      timestamp: video.createdAt,
    },
    {
      key: "assigned",
      label: editorName ? `Assigned to ${editorName}` : "Assigned to Editor",
      sublabel: video.editorId ? "Editor notified" : undefined,
      icon: UserCheck,
      color: "text-[#C8A97E]",
      bg: "bg-[#C8A97E]/10",
      border: "border-[#C8A97E]/20",
      active: !!video.editorId,
    },
    {
      key: "editing",
      label:
        video.status === "raw_rejected" ? "Editor Rejected Raw" : "Editing In Progress",
      sublabel:
        video.editorRejectionReason
          ? `"${video.editorRejectionReason.slice(0, 40)}${video.editorRejectionReason.length > 40 ? "…" : ""}"`
          : undefined,
      icon:
        video.status === "raw_rejected" ? XCircle : Bot,
      color:
        video.status === "raw_rejected" ? "text-red-400" : "text-blue-400",
      bg:
        video.status === "raw_rejected" ? "bg-red-400/10" : "bg-blue-400/10",
      border:
        video.status === "raw_rejected" ? "border-red-400/20" : "border-blue-400/20",
      active:
        video.status === "editing_in_progress" ||
        video.status === "ai_processing" ||
        video.status === "raw_rejected" ||
        currentStatusIndex >= STATUS_ORDER.indexOf("pending"),
    },
    {
      key: "review",
      label: "Creator Review",
      sublabel: video.status === "pending" ? "Awaiting approval" : undefined,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
      active:
        video.status === "pending" ||
        video.status === "approved" ||
        video.status === "rejected" ||
        video.status === "uploaded",
      timestamp:
        video.status === "pending" || video.status === "approved" || video.status === "uploaded"
          ? video.updatedAt
          : undefined,
    },
    {
      key: "approved",
      label:
        isRejected && video.status === "rejected"
          ? "Rejected by Creator"
          : "Approved",
      sublabel:
        video.status === "rejected" && video.rejectionReason
          ? `"${video.rejectionReason.slice(0, 40)}${video.rejectionReason.length > 40 ? "…" : ""}"`
          : video.status === "approved" || video.status === "uploaded"
          ? formatDate(video.updatedAt)
          : undefined,
      icon: video.status === "rejected" ? XCircle : CheckCircle,
      color:
        video.status === "rejected" ? "text-red-400" : "text-emerald-400",
      bg:
        video.status === "rejected" ? "bg-red-400/10" : "bg-emerald-400/10",
      border:
        video.status === "rejected" ? "border-red-400/20" : "border-emerald-400/20",
      active:
        video.status === "approved" ||
        video.status === "rejected" ||
        video.status === "uploaded",
    },
    {
      key: "published",
      label: video.status === "uploaded" ? "Live on YouTube 🎉" : "Publish to YouTube",
      sublabel:
        video.status === "uploaded"
          ? video.goLiveAt
            ? formatDate(video.goLiveAt)
            : formatDate(video.updatedAt)
          : undefined,
      icon: Youtube,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      active: video.status === "uploaded",
    },
  ];

  const activeCount = events.filter((e) => e.active).length;
  const totalCount = events.length;

  return (
    <div className="border-t border-white/6">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/3 transition-all"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Activity Timeline</span>
          <span className="flex items-center gap-0.5 ml-1">
            {Array.from({ length: totalCount }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i < activeCount
                    ? isRejected
                      ? "bg-red-400"
                      : "bg-emerald-400"
                    : "bg-white/15"
                )}
              />
            ))}
          </span>
        </span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen ? "rotate-180" : "")}
        />
      </button>

      {/* Timeline Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div className="relative pl-5">
                {/* Vertical line */}
                <div className="absolute left-2 top-2 bottom-2 w-px bg-white/8" />

                {events.map((event, i) => (
                  <div key={event.key} className="relative flex items-start gap-3 mb-4 last:mb-0">
                    {/* Dot on the line */}
                    <div
                      className={cn(
                        "absolute -left-3 mt-1 w-3 h-3 rounded-full border-2 transition-all shrink-0",
                        event.active
                          ? isRejected && (event.key === "approved" || event.key === "editing")
                            ? "bg-red-400 border-red-400/50"
                            : "bg-emerald-400 border-emerald-400/50"
                          : "bg-[#0f0f0f] border-white/15"
                      )}
                    />

                    {/* Icon + content */}
                    <div
                      className={cn(
                        "flex items-start gap-2.5 p-2.5 rounded-xl border w-full transition-all",
                        event.active
                          ? cn(event.bg, event.border)
                          : "bg-transparent border-white/5 opacity-40"
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                          event.active ? event.bg : "bg-white/5"
                        )}
                      >
                        <event.icon
                          className={cn(
                            "w-3.5 h-3.5",
                            event.active ? event.color : "text-white/25"
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-xs font-medium leading-tight",
                            event.active ? "text-white/90" : "text-white/30"
                          )}
                        >
                          {event.label}
                        </p>
                        {event.sublabel && event.active && (
                          <p className="text-[10px] text-white/35 mt-0.5 leading-tight">
                            {event.sublabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
