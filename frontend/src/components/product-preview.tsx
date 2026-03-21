"use client";

import { motion } from "framer-motion";
import { Lock, CheckCircle2, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductPreview() {
    return (
        <section className="relative py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-24 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-8 uppercase"
                    >
                        <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50"></span>
                        Why MWareX Succeeds
                        <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50"></span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#ffffff] font-normal leading-tight tracking-tight mb-8"
                    >
                        Replacing the <span className="italic text-[#C8A97E]">Fragmented Workflow.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-white/40 text-[15px] max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        We eliminate the chaos of using 5 different scattered apps by bringing file storage, AI editing, secure communication, and publishing into a single autonomous engine.
                    </motion.p>
                </div>

           
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                    <FeatureCard
                        title="End-to-End Autonomous Platform"
                        description="Stop juggling Google Drive, WhatsApp, Premiere Pro, and YouTube. MWareX handles the entire lifecycle from raw 10GB uploads to the final YouTube stream in one place."
                        delay={0.1}
                        index={0}
                    >
                        <Lock className="w-10 h-10 text-white/20 group-hover:text-[#C8A97E] transition-colors duration-500 mb-8" strokeWidth={1} />
                    </FeatureCard>

                    <FeatureCard
                        title="Zero File Transfer Nightmare"
                        description="Raw footage is processed directly in the cloud. Our AI engine edits the video internally, meaning you never have to download or re-upload massive GB files again."
                        delay={0.2}
                        index={1}
                    >
                        <CheckCircle2 className="w-10 h-10 text-white/20 group-hover:text-[#C8A97E] transition-colors duration-500 mb-8" strokeWidth={1} />
                    </FeatureCard>

                    <FeatureCard
                        title="Instant AI Output vs Slow Freelancers"
                        description="Traditional editors take hours or days just to cut silences and mistakes. Our AI completes the heavy lifting in minutes, saving you thousands of dollars in editing costs."
                        delay={0.3}
                        index={2}
                    >
                        <svg className="w-10 h-10 text-white/20 group-hover:text-[#C8A97E] transition-colors duration-500 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                    </FeatureCard>

                    <FeatureCard
                        title="Secure Marketplace & Payments"
                        description="Need advanced cinematic edits? Hire verified editors directly inside MWareX. No scammed payments, no channel password sharing, and completely protected through escrow."
                        delay={0.4}
                        index={3}
                    >
                        <Headphones className="w-10 h-10 text-white/20 group-hover:text-[#C8A97E] transition-colors duration-500 mb-8" strokeWidth={1} />
                    </FeatureCard>

                </div>
            </div>
        </section>
    );
}

function FeatureCard({ title, description, children, delay = 0, className, index = 0 }: { title: string, description: string, children?: React.ReactNode, delay?: number, className?: string, index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden bg-[#111111]/40 border border-white/5 p-10 md:p-14 group transition-all duration-700",
                "hover:bg-[#151515] hover:border-[#C8A97E]/30",
                className
            )}
        >
            {/* Corner Decorative Accent */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#C8A97E]/0 group-hover:border-[#C8A97E]/40 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#C8A97E]/0 group-hover:border-[#C8A97E]/40 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col h-full">
                {children}

                <div className="mt-auto">
                    <h3 className="text-xl md:text-2xl font-serif text-[#ffffff] mb-4 tracking-wide group-hover:text-[#C8A97E] transition-colors duration-500">
                        {title}
                    </h3>
                    <p className="text-white/40 text-[13px] md:text-[14px] leading-[1.8] font-light group-hover:text-white/60 transition-colors duration-500">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
