'use client';


import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Youtube, Twitter, Github, Mail, Sparkles, Rocket, Users, Globe } from 'lucide-react';

const founderImages = [
    '/images/samay-samrat.jpg',
    '/images/samay-samrat-nvidia.jpg',
];

export function FounderSection() {
    return (
        <section className="relative py-32 md:py-48 overflow-hidden bg-[#111111] border-t border-white/5">
            {/* Background Minimalist Ambiance */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <img 
                    src="/bg-images/10039.jpg" 
                    alt="Vision Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-15 md:opacity-[0.25] mix-blend-screen" 
                />
                <div className="absolute inset-0 bg-[#111111]/30 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111] opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-[#111111] opacity-60" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#C8A97E]/[0.02] blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-4 text-[#C8A97E] text-[10px] font-bold tracking-[0.25em] mb-16 uppercase"
                >
                    <span className="w-8 h-[1px] bg-[#C8A97E] opacity-50"></span>
                    The Vision
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

                    {/* Left: Classic Fine-Art Style Photo Showcase */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="lg:col-span-5 relative mx-auto w-full max-w-md lg:max-w-none flex flex-col items-center lg:items-start"
                    >
                        {/* Frame Border */}
                        <div className="absolute -inset-4 md:-inset-6 border border-white/10 rounded-sm z-0 pointer-events-none" />
                        <div className="absolute -inset-4 md:-inset-6 border border-[#C8A97E]/20 rounded-sm z-0 pointer-events-none scale-[1.02] opacity-50" />

                        {/* Corner Accents */}
                        <div className="absolute -top-6 -left-6 w-3 h-3 border-t border-l border-[#C8A97E]" />
                        <div className="absolute -top-6 -right-6 w-3 h-3 border-t border-r border-[#C8A97E]" />
                        <div className="absolute -bottom-6 -left-6 w-3 h-3 border-b border-l border-[#C8A97E]" />
                        <div className="absolute -bottom-6 -right-6 w-3 h-3 border-b border-r border-[#C8A97E]" />

                        <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-[#111111] z-10">
                            <div className="absolute inset-0">
                                <Image
                                    src={founderImages[0]}
                                    alt="Samay Samrat – Founder of MwareX"
                                    fill
                                    className="object-cover object-center opacity-80"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                                {/* Vignette Overlay */}
                                <div className="absolute inset-0 shadow-[inset_0_0_100px_#050505] mix-blend-multiply" />
                            </div>

                            {/* Minimalist Name Plate */}
                            <div className="absolute bottom-6 left-6 z-20">
                                <p className="text-[#C8A97E] font-serif text-2xl tracking-wide mb-1">Samay Samrat</p>
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Founder & CEO</p>
                            </div>
                        </div>

                        {/* Minimalist Social Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="flex items-center gap-6 mt-12 justify-center lg:justify-start"
                        >
                            {[
                                { icon: Youtube, href: 'https://www.youtube.com/@futxsamay', label: 'YouTube' },
                                { icon: Twitter, href: 'https://x.com/mwarex', label: 'Twitter' },
                                { icon: Github, href: 'https://github.com/samay-hash', label: 'GitHub' },
                                { icon: Mail, href: 'mailto:founder.samay@gmail.com', label: 'Email' },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="text-white/30 hover:text-[#C8A97E] transition-colors duration-300"
                                >
                                    <social.icon className="w-5 h-5" strokeWidth={1.5} />
                                </a>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right: Elegant Typography Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                        className="lg:col-span-7 lg:pl-8"
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#ffffff] font-normal leading-[1.1] tracking-tight mb-8">
                            Building the future of <br className="hidden md:block" />
                            <span className="italic text-[#C8A97E]">creator collaboration.</span>
                        </h2>

                        <div className="w-12 h-px bg-[#C8A97E]/50 mb-8" />

                        <div className="space-y-6 text-white/50 text-[15px] leading-[1.8] font-light mb-16 max-w-2xl">
                            <p>
                                <strong className="text-white font-normal">Samay Samrat</strong> is an Indian entrepreneur, YouTuber, and the founder of MwareX — a platform designed to bridge the gap between creators and editors.
                            </p>
                            <p>
                                Frustrated by the broken workflows of managing editors, reviewing drafts, and publishing content,
                                Samay built MwareX to streamline the entire video production pipeline — from raw upload to one-click YouTube publish.
                            </p>
                            <blockquote className="pl-6 border-l leading-relaxed border-[#C8A97E]/30 italic text-white/70 py-2">
                                "Every creator deserves a team that works in sync. MwareX makes that possible — securely, seamlessly, and at scale."
                            </blockquote>
                        </div>

                        {/* Refined Stats */}
                        <div className="grid grid-cols-3 gap-8 mb-16 max-w-xl">
                            {[
                                { value: '2026', label: 'Founded' },
                                { value: '500+', label: 'Early Users' },
                                { value: 'India', label: 'Global HQ' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                                    className="border-t border-white/10 pt-4"
                                >
                                    <p className="text-2xl font-serif text-white mb-2">{stat.value}</p>
                                    <p className="text-[10px] text-[#C8A97E] uppercase tracking-widest">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <Link
                                href="/founder"
                                className="group inline-flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-[#C8A97E] uppercase hover:text-white transition-colors duration-300"
                            >
                                Read Full Story
                                <span className="w-8 h-[1px] bg-[#C8A97E] group-hover:w-12 group-hover:bg-white transition-all duration-300 relative">
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-current rotate-45" />
                                </span>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
