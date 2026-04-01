"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Maximize,
  Music,
  MessageSquare,
  Brain,
  Film,
  Type,
  Layers,
  FileVideo,
  Download,
  Cpu,
  Award,
  ChevronDown,
} from "lucide-react";

/* ── Chevron connector ─────────────────────────────────────────── */
function ChevronConnector() {
  return (
    <div className="flex items-center justify-center py-1">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-0"
      >
        <div className="w-px h-3 bg-gradient-to-b from-primary/40 to-primary/20" />
        <ChevronDown className="w-4 h-4 text-primary/40 -mt-1" />
      </motion.div>
    </div>
  );
}

/* ── Pipeline step card ────────────────────────────────────────── */
interface StepProps {
  stepNumber: number;
  icon: React.ElementType;
  title: string;
  description: string;
  tech?: string;
  output?: string;
  delay?: number;
}

function StepCard({ stepNumber, icon: Icon, title, description, tech, output, delay = 0 }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 30 }}
      className="relative w-full border rounded-xl p-5 transition-all duration-300 hover:shadow-lg bg-card border-border hover:border-primary/30 hover:shadow-primary/5 group"
    >
      <div className="flex items-start gap-4">
        {/* Step number circle */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="text-sm font-bold text-primary">{stepNumber}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <Icon className="w-4 h-4 text-primary/70 shrink-0" />
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            {description}
          </p>

          {/* Tech tags */}
          {tech && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tech.split(",").map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/60 text-primary/80 border border-border"
                >
                  {t.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Output example */}
          {output && (
            <div className="mt-2.5 px-3 py-2 rounded-lg bg-secondary/30 border border-border/60">
              <p className="text-[10px] font-mono text-muted-foreground/80 leading-relaxed">
                <span className="text-primary/60 font-semibold">Output:</span> {output}
              </p>
            </div>
          )}
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
          Complete Pipeline Flow
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-lg mx-auto">
          The automated system transforms raw video into professionally edited content with synchronized B-roll footage and accessibility captions.
        </p>
      </div>

      {/* ─── 10-STEP PIPELINE ──────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Automated Processing Pipeline
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col items-center">
          {/* Step 1 */}
          <StepCard
            stepNumber={1}
            icon={Upload}
            title="User uploads video"
            description="Entry point for a raw source file and any available metadata. Creator uploads raw footage directly to Amazon S3 via presigned URLs with real-time progress tracking."
            tech="AWS S3, Presigned URLs"
            delay={0}
          />

          <ChevronConnector />

          {/* Step 2 */}
          <StepCard
            stepNumber={2}
            icon={Maximize}
            title="Extract resolution with ffprobe"
            description="Read the input dimensions with ffprobe and lock the video size as width × height for the rest of the pipeline. This ensures consistent output without black bars."
            tech="FFprobe"
            output="1920×1080, 30fps, 12.4 Mbps"
            delay={0.05}
          />

          <ChevronConnector />

          {/* Step 3 */}
          <StepCard
            stepNumber={3}
            icon={Music}
            title="Extract audio with FFmpeg"
            description="Use FFmpeg to separate the audio track and save it as .wav for transcription. High-quality lossless extraction preserves every spoken word for accurate processing."
            tech="FFmpeg"
            output="audio.wav (PCM 16-bit, 44.1kHz)"
            delay={0.1}
          />

          <ChevronConnector />

          {/* Step 4 */}
          <StepCard
            stepNumber={4}
            icon={MessageSquare}
            title="Transcribe with Whisper"
            description="Send the audio to Whisper to generate the full transcript plus word-level timestamps. This enables precise caption placement and intelligent edit-point detection."
            tech="Groq Whisper API"
            output={`"Hello everyone..." → [0.0s - 1.2s], "today we..." → [1.3s - 2.1s]`}
            delay={0.15}
          />

          <ChevronConnector />

          {/* Step 5 */}
          <StepCard
            stepNumber={5}
            icon={Brain}
            title="Detect B-roll moments with an LLM"
            description="Send the transcript to an LLM to identify insert points and search queries. The AI understands context and suggests cinematic B-roll that enhances the narrative."
            tech="Gemini 2.0 Flash, LLM"
            output={`[ { start: 10.2, end: 14.5, query: "mountain landscape" }, ... ]`}
            delay={0.2}
          />

          <ChevronConnector />

          {/* Step 6 */}
          <StepCard
            stepNumber={6}
            icon={Film}
            title="Fetch and normalize B-roll"
            description="For each B-roll moment, fetch video from the Pexels API using the query, then use FFmpeg to scale and center-crop it to the exact input resolution. No visual mismatch."
            tech="Pexels API, FFmpeg"
            delay={0.25}
          />

          <ChevronConnector />

          {/* Step 7 */}
          <StepCard
            stepNumber={7}
            icon={Type}
            title="Generate captions"
            description="Create a .ass subtitle file from Whisper word timestamps, then apply the chosen caption style for font, color, and position. Supports multiple caption presets."
            tech="Whisper Timestamps, ASS Format"
            delay={0.3}
          />

          <ChevronConnector />

          {/* Step 8 */}
          <StepCard
            stepNumber={8}
            icon={Layers}
            title="Assemble the final edit"
            description="Run an FFmpeg complex filter to insert B-roll clips at the correct timestamps and burn captions on top of the video. Hardware-accelerated encoding for speed."
            tech="FFmpeg Complex Filter"
            delay={0.35}
          />

          <ChevronConnector />

          {/* Step 9 */}
          <StepCard
            stepNumber={9}
            icon={FileVideo}
            title="Output the final video"
            description="Save the rendered file at the same resolution as the input, with no black bars. Quality-optimized H.264 encoding with CRF 18 for near-lossless output."
            tech="H.264, CRF 18"
            output="final_edit_1920x1080.mp4"
            delay={0.4}
          />

          <ChevronConnector />

          {/* Step 10 */}
          <StepCard
            stepNumber={10}
            icon={Download}
            title="Creator reviews & publishes"
            description="Delivery step for the completed, automatically edited video. The creator previews the final cut on the dashboard and publishes directly to YouTube with a single click."
            tech="YouTube Data API v3, OAuth 2.0"
            delay={0.45}
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
          Fully automated. Zero manual editing.
          <span className="text-primary font-medium">Upload → Publish in minutes.</span>
        </div>
      </motion.div>
    </div>
  );
}
