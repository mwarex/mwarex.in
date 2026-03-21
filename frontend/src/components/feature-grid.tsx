"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Zap, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Autonomous AI Agent",
        description: "AI automatically cuts mistakes, silences, and retakes. Zero manual editing required.",
        icon: Zap,
    },
    {
        title: "Unified Workspace",
        description: "No more scattered apps. Manage raw files, chats, and edits natively in one platform.",
        icon: Shield,
    },
    {
        title: "Direct YT Publishing",
        description: "Push final cuts straight to YouTube. No downloading heavy 10GB raw files again.",
        icon: MousePointer2,
    },
    {
        title: "Creator Marketplace",
        description: "Access verified freelance editors securely when you need advanced cinematic edits.",
        icon: Lock,
    }
];

export function FeatureGrid() {
    return (
        <section className="py-32 relative overflow-hidden" id="features">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[30%] left-[-20%] w-[600px] h-[600px] bg-[#C8A97E]/5 rounded-full blur-[150px] opacity-40" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#111111] rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-8 uppercase"
                    >
                        Capabilities
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-normal text-white tracking-tight mb-8">
                        Built for <span className="italic text-[#C8A97E]">Scale.</span>
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto text-[15px] font-light leading-relaxed">
                        Everything you need to manage secure video workflows, organized in one powerful dashboard.
                    </p>
                </div>

                {/* Elegant Minimalist Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative w-full">

                    {/* Surrounding Cards */}
                    {features.map((feature, index) => {
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                                className="group relative flex flex-col p-8 md:p-10 border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md transition-all duration-700 hover:bg-[#111111] hover:border-[#C8A97E]/20"
                            >
                                {/* Top right subtle accent line */}
                                <div className="absolute top-0 right-0 w-8 h-px bg-gradient-to-r from-transparent to-[#C8A97E]/0 group-hover:to-[#C8A97E]/50 transition-colors duration-700"></div>
                                <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-[#C8A97E]/0 to-transparent group-hover:from-[#C8A97E]/50 transition-colors duration-700"></div>

                                <div className="mb-12">
                                    <feature.icon className="w-8 h-8 text-white/20 group-hover:text-[#C8A97E] transition-colors duration-500" strokeWidth={1} />
                                </div>

                                <div className="mt-auto">
                                    <h3 className="text-xl font-serif text-white mb-3 group-hover:text-[#C8A97E] transition-colors duration-500">{feature.title}</h3>
                                    <p className="text-[13px] text-white/30 font-light leading-[1.8] group-hover:text-white/50 transition-colors duration-500">{feature.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 10x Banner below grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-16 w-full border border-white/5 bg-gradient-to-r from-transparent via-[#111111] to-transparent py-10 flex flex-col items-center justify-center group"
                >
                    <span className="block text-4xl md:text-6xl font-serif text-[#ffffff] mb-3 group-hover:text-[#C8A97E] transition-colors duration-700 italic">10x</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Faster Workflow</span>
                </motion.div>

            </div>
        </section>
    );
}
