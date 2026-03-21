"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Brain,
  Scissors,
  CheckCircle,
  Youtube,
  MessageSquare,
  Sparkles,
  Cpu,
  Eye,
  Wand2,
  Zap,
  Instagram,
  Target,
  Award,
} from "lucide-react";

/* ── Simple connector line ─────────────────────────────────────── */
function GlowLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-px h-8 bg-border" />
    </div>
  );
}

/* ── Pipeline step card ────────────────────────────────────────── */
interface StepProps {
  icon: React.ElementType;
  label: string;
  model: string;
  description: string;
  status: "active" | "future";
  delay?: number;
}

function StepCard({ icon: Icon, label, model, description, status, delay = 0 }: StepProps) {
  const isActive = status === "active";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 30 }}
      className={`relative border rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
        isActive
          ? "bg-card border-border hover:border-primary/30 hover:shadow-primary/5"
          : "bg-card/50 border-dashed border-border/60 hover:border-primary/20 hover:shadow-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isActive ? "bg-primary/10 border border-primary/20" : "bg-secondary/60 border border-border"
          }`}
        >
          <Icon className={`w-4.5 h-4.5 ${isActive ? "text-primary" : "text-muted-foreground/60"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-sm font-semibold text-foreground">{label}</h4>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-secondary text-muted-foreground/50 border border-border"
              }`}
            >
              {isActive ? "Active" : "Coming Soon"}
            </span>
          </div>
          <p className="text-[11px] font-medium text-primary/70 mb-1.5">{model}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export default function AIPipeline() {
  return (
    <div className="w-full max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 border border-border text-xs font-medium text-muted-foreground mb-4">
          <Cpu className="w-3 h-3" />
          SYSTEM ARCHITECTURE
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          AI Pipeline
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-md mx-auto">
          End-to-end autonomous video processing — from raw upload to YouTube publish. Each stage is powered by a dedicated AI model.
        </p>
      </div>

      {/* ─── CURRENT PIPELINE ──────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Current Pipeline
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col items-center">
          <StepCard
            icon={Upload}
            label="1 — Raw Video Upload"
            model="AWS S3 Direct Upload"
            description="Creator uploads raw footage directly to Amazon S3 via presigned URLs. Supports files up to 10 GB with real-time progress tracking."
            status="active"
            delay={0}
          />

          <GlowLine />

          <StepCard
            icon={Brain}
            label="2 — AI Content Analysis"
            model="Google Gemini 2.0 Flash — Multimodal"
            description="Gemini analyzes every video frame, audio pattern, and speech segment. Identifies silences, stutters, mistakes, and cinematic B-roll moments to produce precise edit timestamps."
            status="active"
            delay={0.1}
          />

          <GlowLine />

          <StepCard
            icon={Scissors}
            label="3 — Intelligent Video Editing"
            model="FFmpeg Engine — Hardware Accelerated"
            description="AI-generated timestamps are fed into FFmpeg which cuts, trims, and stitches video segments with frame-accurate precision. Preserves quality while removing unwanted parts."
            status="active"
            delay={0.2}
          />

          <GlowLine />

          <StepCard
            icon={CheckCircle}
            label="4 — Creator Review & Approval"
            model="Human-in-the-Loop"
            description="The processed video is presented to the creator for review. They can approve for YouTube publishing, or reject with feedback for AI re-editing."
            status="active"
            delay={0.3}
          />

          <GlowLine />

          <StepCard
            icon={Youtube}
            label="5 — YouTube Auto-Publish"
            model="YouTube Data API v3 + OAuth 2.0"
            description="Upon approval, the video is streamed directly from S3 to YouTube via the official API. Thumbnails, titles, and descriptions are uploaded automatically."
            status="active"
            delay={0.4}
          />

          <GlowLine />

          <StepCard
            icon={MessageSquare}
            label="6 — AI Chat Assistant"
            model="Gemini 2.0 Flash → Gemini 1.5 Flash (Fallback)"
            description="Context-aware conversational AI that understands the platform. Creators can ask for content suggestions, editing advice, or get help with the publishing workflow."
            status="active"
            delay={0.5}
          />
        </div>
      </div>

      {/* ─── FUTURE / ADVANCED PIPELINE ────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Advanced Pipeline — Coming Soon
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col items-center">
          <StepCard
            icon={Sparkles}
            label="Prompt-to-Video Generation"
            model="Gemini 2.5 Pro + Veo AI"
            description="Generate entire videos from a single text prompt. The AI creates visuals, selects stock footage, adds voiceover, and produces a publish-ready video end to end."
            status="future"
            delay={0.1}
          />

          <GlowLine />

          <StepCard
            icon={Eye}
            label="Advanced Scene Understanding"
            model="Gemini 2.5 Pro — Vision"
            description="Deep scene-by-scene analysis with emotion detection, pacing optimization, and automatic color grading suggestions based on content mood and genre."
            status="future"
            delay={0.2}
          />

          <GlowLine />

          <StepCard
            icon={Wand2}
            label="AI Auto-Thumbnail & Metadata"
            model="Imagen 3 + Gemini Pro"
            description="Automatically generates click-worthy thumbnails using AI image generation. Writes SEO-optimized titles, descriptions, and tags based on video content analysis."
            status="future"
            delay={0.3}
          />

          <GlowLine />

          <StepCard
            icon={Instagram}
            label="Instagram Reels Pipeline"
            model="Instagram Graph API + Gemini"
            description="Auto-create vertical short-form content from long-form videos. AI crops, resizes, and optimizes for Instagram Reels with trending audio suggestions."
            status="future"
            delay={0.4}
          />

          <GlowLine />

          <StepCard
            icon={Zap}
            label="Multi-Platform Simultaneous Publish"
            model="Unified Distribution Engine"
            description="One-click publish to YouTube (Long Form + Shorts), Instagram Reels, and TikTok simultaneously. Each format auto-optimized for its platform's algorithm."
            status="future"
            delay={0.5}
          />

          <GlowLine />

          <StepCard
            icon={Target}
            label="Streak Challenges & Gamification"
            model="MWareX Rewards Engine"
            description="Daily upload streak tracking with gamified milestones. Earn free credits, unlock premium AI models, and compete on creator leaderboards."
            status="future"
            delay={0.6}
          />

          <GlowLine />

          <StepCard
            icon={MessageSquare}
            label="Personal Video Chat Box"
            model="Gemini 2.5 Pro — Video-Linked Context"
            description="Chat with an AI assistant that's directly linked to your video timeline. Say 'make 0:45 faster' or 'add B-roll at 2:10' and the AI re-edits in real time."
            status="future"
            delay={0.7}
          />
        </div>
      </div>

      {/* Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
          <Award className="w-3.5 h-3.5" />
          Pipeline is continuously evolving.
          <span className="text-primary font-medium">Ship fast, iterate faster.</span>
        </div>
      </motion.div>
    </div>
  );
}
