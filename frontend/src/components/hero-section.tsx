"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MWareXLogo } from "@/components/mwarex-logo";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SiteHeader } from './site-header';
import { MagicalDust } from './magical-dust';

export function HeroSection() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { label: "Features", href: "/#features" },
        { label: "Founder", href: "/#founder" },
        { label: "How It Works", href: "/#workflow" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Resources", href: "/support" },
    ];

    return (
        <section className="relative min-h-screen w-full overflow-hidden flex flex-col">

            {/* ══ Full-Screen Background Image ══ */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/backkm.png"
                    alt="MWareX Cinematic Background"
                    className="w-full h-full object-cover object-center"
                />
                {/* Bottom vignette so text is always legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
                {/* Left vignette for the text side */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                {/* Top vignette to blend nav */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
                
                {/* ── Page Merge Gradient (Bottom Shading) ── */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#111111] to-transparent z-10" />
                
                {/* ── Magical Dust Particles from Gate ── */}
                <MagicalDust />
            </div>

            {/* ══ Navigation Bar ══ */}
            <motion.header
                initial={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-30 w-full flex items-center justify-between px-8 md:px-14 py-6"
            >
                {/* Left nav links */}
                <nav className="hidden lg:flex items-center gap-7 text-[10px] font-bold tracking-[0.22em] uppercase text-white/50">
                    {navLinks.slice(0, 3).map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="hover:text-white transition-colors duration-200 relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/60 group-hover:w-full transition-all duration-300" />
                        </Link>
                    ))}
                </nav>

                {/* Center logo (Made larger and slightly shifted right for perfect optical centering) */}
                <Link href="/" className="absolute left-1/2 translate-x-[calc(-50%+6px)] z-50 hover:opacity-80 transition-opacity scale-125">
                    <MWareXLogo showText={false} size="md" />
                </Link>

                {/* Right nav links + CTA */}
                <nav className="hidden lg:flex items-center gap-7 text-[10px] font-bold tracking-[0.22em] uppercase text-white/50">
                    {navLinks.slice(3).map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="hover:text-white transition-colors duration-200 relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/60 group-hover:w-full transition-all duration-300" />
                        </Link>
                    ))}
                    <Link
                        href="/auth/signup"
                        className="ml-2 px-5 py-2.5 border border-white/30 text-white/80 hover:bg-white hover:text-black transition-all duration-300 tracking-[0.2em] text-[10px] font-bold"
                    >
                        Get Started
                    </Link>
                </nav>

                {/* Mobile menu toggle */}
                <button
                    className="lg:hidden text-white ml-auto"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </motion.header>

            {/* Mobile menu */}
            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center gap-8"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-[13px] font-bold tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="mt-4 px-8 py-3 border border-white/30 text-white text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-white hover:text-black transition-all">
                        Get Started
                    </Link>
                </motion.div>
            )}

            {/* ══ Main Hero Content — Pinned to Bottom ══ */}
            <div className="relative z-20 mt-auto w-full px-8 md:px-14 pb-12 md:pb-16 flex flex-col">
                
                {/* ── Top Block: Headings ── */}
                <div className="flex flex-col gap-1 max-w-4xl mb-6">
                    {/* H1: Bright white */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30, filter: "blur(16px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[2rem] md:text-[2.4rem] lg:text-[2.8rem] font-medium text-white leading-[1.1] tracking-tight mb-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] lg:whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif' }}
                    >
                        From Raw Video to Viral Content.
                    </motion.h1>

                    {/* Sub-headline: Shady grey */}
                    <motion.h2
                        initial={{ opacity: 0, y: 30, filter: "blur(16px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[2rem] md:text-[2.4rem] lg:text-[2.8rem] font-normal text-white/50 leading-[1.1] tracking-tight mt-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] lg:whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif' }}
                    >
                        Experience the Future of Video Editing.
                    </motion.h2>
                </div>

                {/* ── Horizontal Divider Line ── */}
                <motion.div 
                    initial={{ opacity: 0, scaleX: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scaleX: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
                    className="w-full h-px bg-white/10 origin-left mb-8"
                />

                {/* ── Bottom Block: Label/Buttons (Left) & Paragraphs (Right) ── */}
                <div className="flex flex-col md:flex-row items-start justify-between w-full gap-10">
                    
                    {/* Left: Small caps label and CTA */}
                    <div className="flex flex-col gap-6 max-w-sm">
                        <motion.p
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
                            className="text-[8px] md:text-[9px] font-medium tracking-[0.25em] uppercase text-white/40 font-sans"
                        >
                            AUTOMATE YOUR CONTENT. AMPLIFY YOUR REACH
                        </motion.p>
                        
                        {/* CTA row (retained) */}
                        <motion.div
                            initial={{ opacity: 0, y: 15, filter: "blur(12px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-center gap-6"
                        >
                            <Link href="/auth/signup">
                                <div className="group flex items-center gap-3 px-6 py-3 border border-white/20 text-white/85 hover:bg-white hover:text-black text-[9px] font-bold tracking-[0.22em] uppercase transition-all duration-300">
                                    Start Free Trial
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </Link>
                            <Link href="/auth/signin" className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/40 hover:text-white/70 transition-colors">
                                Sign In
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right: Description paragraphs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="hidden lg:flex flex-col gap-5 max-w-[360px]"
                    >
                        <p className="text-[12px] text-white/50 leading-[1.8] tracking-[0.01em] font-light">
                        MwareX is an AI-powered content operations platform built for YouTube creators and editing teams. It centralizes collaboration, review, approvals, cloud storage, and publishing turning scattered workflows into one seamless production pipeline
                        </p>
                        <p className="text-[12px] text-white/40 leading-[1.8] tracking-[0.01em] font-light">
                            AI that doesn't just assist — it anticipates your workflow, learns your style, and executes with cinematic precision.
                        </p>
                    </motion.div>
                    
                </div>
            </div>

        </section>
    );
}
