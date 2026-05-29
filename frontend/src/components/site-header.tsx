"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MWareXLogo } from "@/components/mwarex-logo";
import { Menu, X } from "lucide-react";
import React, { useState } from "react";

export function SiteHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
                className="fixed top-0 left-0 right-0 z-50 px-4 md:px-12 py-6"
            >
                {/* Layout: Logo (Left) | Nav (Absolute Center) | Actions (Right) */}
                <div className="w-full relative flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link href="/" className="z-50 hover:scale-105 transition-transform duration-300" id="nav-logo-anchor">
                        <div className="flex items-center gap-2">
                            <MWareXLogo showText={false} size="md" />
                        </div>
                    </Link>

                    {/* Center: Desktop Navigation */}
                    <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center gap-10 text-[11px] font-bold tracking-[1.5px] uppercase text-white/50 w-max">
                        <Link href="/#workflow" className="relative group hover:text-white transition-colors py-2">
                            Workflow
                            <span className="absolute bottom-1 left-0 w-0 h-px bg-[#C8A97E] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <span className="text-white/10 font-light">/</span>
                        <Link href="/#features" className="relative group hover:text-white transition-colors py-2">
                            Features
                            <span className="absolute bottom-1 left-0 w-0 h-px bg-[#C8A97E] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <span className="text-white/10 font-light">/</span>
                        <Link href="/#pricing" className="relative group hover:text-white transition-colors py-2">
                            Pricing
                            <span className="absolute bottom-1 left-0 w-0 h-px bg-[#C8A97E] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </nav>

                    {/* Right: Desktop Actions + Mobile Toggle */}
                    <div className="flex items-center gap-6 z-50">
                        <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold tracking-[0.25em] uppercase text-white/50">
                            <Link href="/auth/signin" className="hover:text-white transition-colors">Login</Link>
                            <span className="text-white/10 font-light">|</span>
                            <Link href="/auth/signup" className="text-[#00E5FF] hover:text-white transition-colors">Register</Link>
                            <button
                                className="ml-4 text-white hover:text-[#C8A97E] transition-colors p-2"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" strokeWidth={1.5} />
                                ) : (
                                    <Menu className="w-5 h-5" strokeWidth={1.5} />
                                )}
                            </button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 -mr-2 text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center p-6 space-y-8"
                    >
                        <nav className="flex flex-col items-center gap-8 text-[12px] tracking-[0.25em] uppercase text-white/70">
                            <Link href="/#workflow" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C8A97E]">Workflow</Link>
                            <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C8A97E]">Features</Link>
                            <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C8A97E]">Pricing</Link>
                            <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white mt-4 border-t border-white/10 pt-8 w-full text-center">Log In</Link>
                            <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-[#00E5FF] px-8 py-3 rounded-full mt-4 border border-[#00E5FF]/30">Register</Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
