"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Youtube,
  Instagram,
  MessageSquare,
  Target,
  Zap,
  Award,
  ArrowRight,
  Bot,
  Video,
} from "lucide-react";

const features = [
  {
    id: 1,
    title: "AI Video Generation",
    description:
      "Generate complete, publish-ready videos from a single text prompt using our advanced AI engine.",
    icon: Bot,
    flow: ["Text Prompt", "AI Generation", "YouTube Publish"],
  },
  {
    id: 2,
    title: "Instagram Reels Pipeline",
    description:
      "Seamless Instagram API integration — create, edit, and publish short-form vertical videos directly.",
    icon: Instagram,
    flow: ["Insta API", "AI Short", "Auto Edit", "Publish to IG"],
  },
  {
    id: 3,
    title: "Multi-Format Expansion",
    description:
      "Upload once. The AI auto-expands into YouTube Long-Form, YouTube Shorts, and Instagram Reels simultaneously.",
    icon: Zap,
    flow: ["Raw Upload", "YT Long Form", "YT Shorts", "IG Reels"],
  },
  {
    id: 4,
    title: "Daily Streak Challenges",
    description:
      "Stay consistent with gamified daily upload streaks. Hit milestones to earn free platform credits automatically.",
    icon: Target,
    flow: ["Daily Upload", "Build Streak", "Earn Rewards"],
  },
  {
    id: 5,
    title: "Milestone Achievements",
    description:
      "Unlock premium features and free credits as you achieve platform milestones and grow your content portfolio.",
    icon: Award,
    flow: ["Create Content", "Hit Milestones", "Free Credits"],
  },
  {
    id: 6,
    title: "Personal Video Chat Box",
    description:
      "Talk to an AI assistant linked directly to your video timeline. Request specific edits, pacing changes, and improvements conversationally.",
    icon: MessageSquare,
    flow: ["Select Video", "Chat with AI", "Auto Re-Edit"],
  },
];

export default function FutureFeatures() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 border border-border text-xs font-medium text-muted-foreground mb-4">
          <Sparkles className="w-3 h-3" />
          ROADMAP
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Upcoming Features
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-md mx-auto">
          An exclusive look at what's coming next to MWareX. These features are
          currently in development.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            variants={item}
            className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Number Badge */}
            <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              {feature.id}
            </div>

            {/* Icon + Title */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                <feature.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>

            {/* Flow Pipeline */}
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                {feature.flow.map((step, i) => (
                  <React.Fragment key={i}>
                    <span className="px-2.5 py-1 rounded-md bg-secondary/70 border border-border text-[11px] font-medium text-foreground/80 whitespace-nowrap">
                      {step}
                    </span>
                    {i < feature.flow.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
          <Video className="w-3.5 h-3.5" />
          All features are subject to change during development.
          <span className="text-primary font-medium">Stay tuned.</span>
        </div>
      </motion.div>
    </div>
  );
}
