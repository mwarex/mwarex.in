"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export function ComparisonSection() {
    return (
        <section className="py-32 relative bg-[#111111] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C8A97E]/5 rounded-[100%] blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-8 uppercase"
                    >
                        <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50"></span>
                        The Difference
                        <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50"></span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight mb-8">
                        The End of <span className="italic text-red-400">Chaos.</span>
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto text-[15px] font-light leading-relaxed">
                        Say goodbye to the fragmented, scattered workflow of the past. MWareX replaces an entire ecosystem of subscriptions with one unified, autonomous engine.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative max-w-5xl mx-auto">
                    {/* The Old Way */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="p-8 md:p-12 rounded-2xl border border-red-500/10 bg-red-500/[0.02] backdrop-blur-sm"
                    >
                        <h3 className="text-2xl font-serif text-white/80 mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-sm">
                                <X className="w-4 h-4" />
                            </span>
                            The Old Way
                        </h3>
                        
                        <div className="space-y-6">
                            {[
                                "Struggle to find and hire trusted editors",
                                "Dealing with large 2-3GB+ raw file transfers",
                                "Scattered communication across apps causing delays in work",
                                "Unclear payment structures, risk of scams, and trust issues",
                                "Unsafely giving editors YouTube channel access"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <X className="w-5 h-5 text-red-400/50 shrink-0 mt-0.5" />
                                    <p className="text-white/40 text-[14px] leading-relaxed font-light">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* The MWareX Way */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="p-8 md:p-12 rounded-2xl border border-[#C8A97E]/30 bg-[#C8A97E]/[0.05] backdrop-blur-sm relative"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#C8A97E]/10 to-transparent opacity-50 rounded-2xl" />
                        
                        <h3 className="text-2xl font-serif text-white mb-8 flex items-center gap-3 relative z-10">
                            <span className="w-8 h-8 rounded-full bg-[#C8A97E]/20 text-[#C8A97E] flex items-center justify-center text-sm">
                                <Check className="w-4 h-4" />
                            </span>
                            The MWareX Way
                        </h3>
                        
                        <div className="space-y-6 relative z-10">
                            {[
                                "Autonomous AI Agent generates polished cuts without human editors",
                                "No hiring, no editor coordination, no delays",
                                "Zero file transfer hassle—everything processes inside the platform",
                                "Built-in Publishing directly to YouTube. No platform switching",
                                "Cost efficient—no editing costs, fully automated workflow"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <Check className="w-5 h-5 text-[#C8A97E] shrink-0 mt-0.5" />
                                    <p className="text-white/80 text-[14px] leading-relaxed font-light">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
