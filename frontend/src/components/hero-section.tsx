"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const BACKGROUNDS = [
    "/bg-images/10097.jpg"
];

export function HeroSection() {
    const [currentBg, setCurrentBg] = useState(0);

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12">
            {/* Base Background Color */}
            <div className="absolute inset-0 -z-30 w-full h-full bg-[#0a0a0a]"></div>

            {/* Absolute Background Image Slider - Professional Smooth Merge */}
            <div className="absolute inset-0 -z-20 w-full h-full overflow-hidden bg-black">
                <AnimatePresence>
                    <motion.div
                        key={currentBg}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full lg:left-auto lg:right-0 lg:w-[85%] [mask-image:linear-gradient(to_right,transparent_0%,black_70%)]"
                    >
                        <img
                            src={BACKGROUNDS[currentBg]}
                            alt="Background"
                            className="w-full h-full object-cover opacity-60 object-right"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dark gradient overlay for deep contrast and blending */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111111] via-[#111111]/75 to-[#111111]/10 pointer-events-none" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/50 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full z-10 pt-10">
                <div className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-10 md:mb-16 uppercase opacity-90">
                    <span className="w-12 h-[1px] bg-[#C8A97E] opacity-50"></span>
                    MWAREX · EST. 2026
                </div>

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-4xl mx-auto lg:mx-0">
                    {/* Left Column: Content */}
                    <div className="flex flex-col items-center lg:items-start relative z-30">
                        {/* Main Heading with Elegant Typography */}
                        <div className="mb-8 md:mb-10 w-full">
                            <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-orbitron uppercase text-[#ffffff] leading-[1.05] font-bold tracking-[0.05em]">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    Simplify
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                                >
                                    Your Creator
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                    className="text-[#C8A97E] pr-4 ml-8 md:ml-0"
                                >
                                    Workflow.
                                </motion.div>
                            </h1>
                        </div>

                        {/* Subtitle - Typewriter Effect */}
                        <div className="mb-10 md:mb-12 h-auto md:h-[120px] w-full flex justify-center lg:justify-start">
                            <TypewriterText
                                text="MWarex connects your editing team directly to your YouTube channel. Upload, review, chat, approve, and publish videos automatically — all in one secure workspace."
                                className="text-[14px] md:text-[16px] font-oswald tracking-[0.15em] uppercase text-white/80 max-w-lg leading-relaxed flex flex-wrap justify-center lg:justify-start text-center lg:text-left"
                            />
                        </div>

                        {/* CTA Buttons - Line style with Gold */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row items-center gap-6"
                        >
                            <Link href="/auth/signup">
                                <div className="group relative px-8 py-3.5 border border-[#C8A97E] text-[#C8A97E] rounded-none text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#C8A97E] hover:text-[#111] hover:shadow-[0_0_20px_rgba(200,169,126,0.3)]">
                                    <span className="relative flex items-center justify-center gap-3">
                                        Start Free Trial
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 duration-300" />
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={() => toast.info("Demo Video Coming Soon", {
                                    description: "We are currently finalizing the complete end-to-end workflow video. It will be officially uploaded very soon. Stay tuned!",
                                    duration: 5000,
                                })}
                                className="group flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-300"
                            >
                                <Play className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" fill="currentColor" /> Watch Demo
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column: Video Preview Area (Currently Hidden per user request) */}
                    {/* 
                           Reserved for future video implementation 
                        */}

                </div>
            </div>
        </section>
    );
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.5,
            },
        },
    };

    const child = {
        hidden: { opacity: 0, y: 5 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 200,
            },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {words.map((word, index) => (
                <span key={index} className="mr-[0.3em] mb-1 flex">
                    {word.split("").map((char, charIndex) => (
                        <motion.span key={charIndex} variants={child}>
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </motion.div>
    );
}
