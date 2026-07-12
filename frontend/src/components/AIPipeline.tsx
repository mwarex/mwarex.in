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
  Sparkles,
  ArrowDown
} from "lucide-react";

/* ── Premium Connector ─────────────────────────────────────────── */
function LineConnector() {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 48, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[1px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent relative"
      >
        <motion.div 
          animate={{ y: [0, 48] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-4 bg-primary rounded-full blur-[1px]"
        />
      </motion.div>
    </div>
  );
}

/* ── Spacious Premium Step Card ────────────────────────────────── */
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative w-full max-w-4xl mx-auto group"
    >
      {/* Background ambient glow on hover */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-700" />
      
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 p-8 md:p-10 rounded-2xl bg-zinc-950/40 backdrop-blur-xl border border-white/5 hover:border-white/10 hover:bg-zinc-900/50 transition-all duration-500 overflow-hidden">
        
        {/* Subtle glass reflection */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Left: Icon & Numbering */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-16 h-16 rounded-2xl bg-zinc-900/80 border border-white/5 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Icon className="w-7 h-7 text-primary/80 group-hover:text-primary transition-colors duration-500" />
          </div>
          <span className="mt-4 text-[11px] font-mono font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Phase 0{stepNumber}
          </span>
        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl md:text-2xl font-medium text-zinc-100 tracking-tight mb-3">
            {title}
          </h3>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6 max-w-2xl font-light">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Tech stack badge */}
            {tech && (
              <div className="flex flex-wrap gap-2">
                {tech.split(",").map((t, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono font-medium tracking-wide px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-300 shadow-inner"
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Output terminal style */}
            {output && (
              <div className="sm:ml-auto w-full sm:w-auto px-4 py-2 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-zinc-500 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse" />
                <span className="truncate max-w-[200px] sm:max-w-[300px]">{output}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function AIPipeline() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-24 pb-32">
      {/* Premium Header */}
      <div className="mb-24 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-white/5 text-xs font-medium text-zinc-300 mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="tracking-widest uppercase font-mono">Top 0.1% Architecture</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight mb-6"
        >
          Automated Editor Engine
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-zinc-400 max-w-2xl font-light leading-relaxed"
        >
          A single-pass, fully automated pipeline that transforms raw footage into a cinematic masterpiece with mathematical precision and zero micro-stutters.
        </motion.p>
      </div>

      {/* ─── PIPELINE STEPS ──────────────────────────────────── */}
      <div className="relative">
        {/* Background glow line */}
        <div className="absolute left-[3.25rem] md:left-[5.5rem] top-24 bottom-24 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent hidden md:block" />

        <div className="flex flex-col items-center w-full space-y-4">
          <StepCard
            stepNumber={1}
            icon={Upload}
            title="Video Ingestion & Cloud Storage"
            description="The creator uploads raw footage directly via the web dashboard. The file is instantly uploaded to an S3 Bucket via high-speed presigned URLs, bypassing server memory limits."
            tech="AWS S3, Next.js, Edge API"
            delay={0.1}
          />

          <LineConnector />

          <StepCard
            stepNumber={2}
            icon={Music}
            title="Lossless Audio Extraction"
            description="The background Celery worker picks up the job and uses FFmpeg to perfectly extract the audio track into a lossless 16-bit PCM WAV file to preserve maximum fidelity."
            tech="FFmpeg, Celery, Redis"
            output="Extracting audio.wav"
            delay={0.2}
          />

          <LineConnector />

          <StepCard
            stepNumber={3}
            icon={MessageSquare}
            title="Whisper Word-Level Transcription"
            description="The audio is processed through Whisper. It doesn't just transcribe text—it mathematically calculates the exact millisecond every single word is spoken."
            tech="faster-whisper, Python"
            output="[0.0s - 1.2s] 'Hello'"
            delay={0.3}
          />

          <LineConnector />

          <StepCard
            stepNumber={4}
            icon={Brain}
            title="Top 0.1% NLP Editor Analysis"
            description="Instead of basic text matching, an LLM acts as your Chief Editor. It analyzes the transcript sentence-by-sentence, ignoring filler words and hunting for emotional hooks or high-action statements."
            tech="Ollama, Llama 3, NLTK"
            output="Found 4 Hooks"
            delay={0.4}
          />

          <LineConnector />

          <StepCard
            stepNumber={5}
            icon={Film}
            title="Aesthetic B-Roll Fetching"
            description="For the selected hooks, the AI generates hyper-specific, cinematic search queries (e.g. 'aesthetic late night coding blur') and instantly downloads HD stock footage from Pexels."
            tech="Pexels API, REST"
            output="Downloading aesthetic_blur.mp4"
            delay={0.5}
          />

          <LineConnector />

          <StepCard
            stepNumber={6}
            icon={Type}
            title="Real-Time Active Captions"
            description="A programmatic .ass subtitle file is compiled. It maps the words perfectly to the audio, injecting a vibrant yellow highlight color on the exact word currently being spoken."
            tech="ASS Subtitles, Python"
            output="Compiled full_video.ass"
            delay={0.6}
          />

          <LineConnector />

          <StepCard
            stepNumber={7}
            icon={Cpu}
            title="Single-Pass Rendering Engine"
            description="The ultimate secret to zero stutters. The pipeline builds a massive FFmpeg Complex Filtergraph. It overlays all B-rolls and burns all captions onto the original video in ONE continuous mathematical pass."
            tech="FFmpeg Filtergraph, Hardware Encode"
            output="Overlaying B-Rolls..."
            delay={0.7}
          />

          <LineConnector />

          <StepCard
            stepNumber={8}
            icon={Download}
            title="Ready to Publish"
            description="The final edited video is pushed back to the cloud. The creator views it on the ultra-sleek dashboard and can publish it directly to YouTube with a single click."
            tech="S3 S3, React, YouTube API"
            output="video_pro.mp4 ready"
            delay={0.8}
          />
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-32 text-center"
      >
        <div className="inline-flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20">
            <ArrowDown className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-medium text-white mb-2">Ready to edit?</h2>
          <p className="text-zinc-500 font-light">Drop your first video and let the AI do the rest.</p>
        </div>
      </motion.div>
    </div>
  );
}
