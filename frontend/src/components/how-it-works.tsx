"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { UserPlus, Users, Upload, Youtube, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const workflowSteps = [
    {
        step: 1,
        title: "Upload Raw Footage",
        description: "Drop huge 10GB+ raw files directly into your workspace. No more Google Drive links or WeTransfer limits.",
        icon: Upload,
    },
    {
        step: 2,
        title: "AI Content Analysis",
        description: "Our multimodal AI analyzes your footage to identify mistakes, silences, stutters, and cinematic B-roll automatically.",
        icon: UserPlus,
        badge: "Powered by Gemini"
    },
    {
        step: 3,
        title: "Autonomous Editing",
        description: "The engine instantly cuts and stitches the video. What used to take days of manual editing now takes minutes.",
        icon: Users,
    },
    {
        step: 4,
        title: "AI Chat Assistant",
        description: "Review the cut and chat directly with your video timeline to request pacing changes or specific re-edits.",
        icon: CheckCircle,
    },
    {
        step: 5,
        title: "One-Click Publish",
        description: "Approve the final cut and stream it directly to YouTube via API. No downloading heavy files back to your PC.",
        icon: Youtube,
    },
];

export function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const lineHeight = useTransform(smoothProgress, [0.1, 0.9], ["0%", "100%"]);

    return (
        <section
            ref={containerRef}
            className="py-32 relative bg-[#111111] overflow-hidden border-t border-white/5"
            id="workflow"
        >
            {/* Background Elements - Minimalist */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 right-[-20%] w-[600px] h-[600px] bg-[#C8A97E]/5 rounded-full blur-[150px] opacity-30" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-32 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-8 uppercase"
                    >
                        <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50"></span>
                        How It Works
                        <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50"></span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#ffffff] font-normal tracking-tight mb-8"
                    >
                        From Upload to <span className="italic text-[#C8A97E]">Published.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-white/40 max-w-xl mx-auto text-[15px] font-light leading-relaxed"
                    >
                        A completely autonomous AI workflow that edits and publishes your content while you sleep.
                    </motion.p>
                </div>

                {/* Timeline Container */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Center Vertical Line - Subtle static line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 bg-white/5" />

                    {/* Animated Progress Line */}
                    <motion.div
                        className="absolute left-8 md:left-1/2 top-0 w-px md:-translate-x-1/2 overflow-hidden bg-[#C8A97E]"
                        style={{ height: lineHeight }}
                    >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#C8A97E] blur-[4px]" />
                    </motion.div>

                    {/* Steps */}
                    <div className="space-y-24 md:space-y-32">
                        {workflowSteps.map((step, index) => {
                            const isEven = index % 2 === 0;

                            return (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
                                    className={cn(
                                        "relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center",
                                        isEven ? "" : "md:flex-row-reverse"
                                    )}
                                >
                                    {/* Timeline Node - Elegant hollow circle */}
                                    <div
                                        className="absolute left-8 md:left-1/2 w-3 h-3 -translate-x-[5px] md:-translate-x-[5px] rounded-full border border-[#C8A97E] bg-[#111111] z-20 flex items-center justify-center transition-all duration-500 hover:scale-150 hover:bg-[#C8A97E]"
                                    >
                                    </div>

                                    {/* Content Area */}
                                    <div className={cn(
                                        "pl-20 md:pl-0 w-full md:w-1/2 flex flex-col relative group",
                                        isEven ? "md:pr-16 md:items-end text-left md:text-right" : "md:pl-16 md:items-start text-left"
                                    )}>
                                        {/* Massive Background Number */}
                                        <div className={cn(
                                            "absolute top-1/2 -translate-y-1/2 text-[120px] font-serif font-bold text-white/[0.02] pointer-events-none select-none z-0 transition-colors duration-700 group-hover:text-white/[0.04]",
                                            isEven ? "right-12" : "left-12"
                                        )}>
                                            0{step.step}
                                        </div>

                                        <div className="relative z-10 w-full">
                                            {/* Badge & Step Indicator */}
                                            <div className={cn(
                                                "flex items-center gap-3 mb-6",
                                                isEven ? "md:justify-end" : "justify-start"
                                            )}>
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C8A97E]">
                                                    Phase 0{step.step}
                                                </span>
                                                {step.badge && (
                                                    <span className="text-[9px] font-medium text-black bg-[#C8A97E] px-2 py-0.5 uppercase tracking-wider">
                                                        {step.badge}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 group-hover:text-[#C8A97E] transition-colors duration-500">
                                                {step.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-[14px] text-white/40 leading-[1.8] font-light max-w-sm">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Icon Container for Visual Balance - Opposite to Content */}
                                    <div className={cn(
                                        "hidden md:flex w-1/2 items-center",
                                        isEven ? "pl-16 justify-start" : "pr-16 justify-end"
                                    )}>
                                        <div className="w-16 h-16 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center transition-all duration-700 hover:border-[#C8A97E]/30 hover:bg-[#C8A97E]/5">
                                            <step.icon className="w-6 h-6 text-white/20" strokeWidth={1} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
