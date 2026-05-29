"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { CloudRain, Snowflake, Sun, Leaf, Wind, Moon, Zap, EyeOff } from "lucide-react";
import { useSeason, Season } from "@/contexts/SeasonContext"; // Note: This uses the Context we just created
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// --- Particle Config ---
const PARTICLE_COUNT = 15; // Keep it low for performance

// Hook to detect reduced motion preference
const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
    }, []);
    return prefersReducedMotion;
};

// Hook to detect mobile view
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
};

// --- Season Components ---

const AutumnParticles = () => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const count = isMobile ? 8 : PARTICLE_COUNT;

    // Generate random positions/delays for leaves
    const leaves = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        size: 10 + Math.random() * 20,
        rotate: Math.random() * 360,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Ambient Warmth */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 mix-blend-overlay" />

            {leaves.map((leaf) => (
                <motion.div
                    key={leaf.id}
                    className="absolute text-orange-400 dark:text-orange-300 opacity-40 will-change-transform"
                    style={{
                        left: `${leaf.x}%`,
                        top: -50,
                    }}
                    animate={
                        !prefersReducedMotion ? {
                            y: ["0vh", "110vh"],
                            x: [0, (Math.random() - 0.5) * 200], // Drift horizontally
                            rotate: [leaf.rotate, leaf.rotate + 360],
                            opacity: [0, 0.4, 0], // Fade in/out
                        } : { opacity: 0.2, y: "50vh" } // Static for reduced motion
                    }
                    transition={{
                        duration: leaf.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: leaf.delay,
                    }}
                >
                    <Leaf size={leaf.size} fill="currentColor" className="opacity-60" />
                </motion.div>
            ))}
        </div>
    );
};

const WinterParticles = () => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const count = isMobile ? 10 : PARTICLE_COUNT * 2;

    const snowflakes = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
        size: 2 + Math.random() * 4,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Cool Ambient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/10 to-transparent dark:from-blue-900/10 mix-blend-overlay" />

            {snowflakes.map((flake) => (
                <motion.div
                    key={flake.id}
                    className="absolute bg-white rounded-full opacity-60 dark:opacity-40 will-change-transform"
                    style={{
                        left: `${flake.x}%`,
                        top: -10,
                        width: flake.size,
                        height: flake.size,
                    }}
                    animate={
                        !prefersReducedMotion ? {
                            y: ["0vh", "110vh"],
                            x: [0, (Math.random() - 0.5) * 50], // Drift slightly
                            opacity: [0, 0.6, 0],
                        } : { opacity: 0.3, y: "50vh" }
                    }
                    transition={{
                        duration: flake.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: flake.delay,
                    }}
                />
            ))}
        </div>
    );
};

const SummerParticles = () => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const count = isMobile ? 5 : 10;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Warm Glows - Optimized for Mobile */}
            <motion.div
                className={cn(
                    "absolute bg-yellow-400/10 rounded-full mix-blend-screen dark:mix-blend-lighten",
                    isMobile ? "top-[-5%] left-[10%] w-[200px] h-[200px] blur-[40px]" : "top-[-10%] left-[20%] w-[500px] h-[500px] blur-[100px]"
                )}
                animate={!prefersReducedMotion && !isMobile ? { x: [0, 50, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className={cn(
                    "absolute bg-orange-400/10 rounded-full mix-blend-screen dark:mix-blend-lighten",
                    isMobile ? "bottom-[-5%] right-[5%] w-[150px] h-[150px] blur-[30px]" : "bottom-[-10%] right-[10%] w-[400px] h-[400px] blur-[80px]"
                )}
                animate={!prefersReducedMotion && !isMobile ? { y: [0, -30, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Floating Dust */}
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-yellow-200 rounded-full opacity-40 will-change-transform"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: Math.random() * 4 + 2,
                        height: Math.random() * 4 + 2,
                    }}
                    animate={
                        !prefersReducedMotion ? {
                            y: [0, -40, 0],
                            opacity: [0.2, 0.5, 0.2],
                        } : {}
                    }
                    transition={{
                        duration: 4 + Math.random() * 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </div>
    );
};

const RainyParticles = () => {
    const prefersReducedMotion = useReducedMotion();

    const drops = Array.from({ length: PARTICLE_COUNT * 3 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.8 + Math.random() * 0.5, // fast
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Moody Ambient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-slate-800/5 mix-blend-overlay" />

            {drops.map((drop) => (
                <motion.div
                    key={drop.id}
                    className="absolute bg-blue-400/30 dark:bg-blue-300/20 w-[1px] h-[15px] will-change-transform"
                    style={{
                        left: `${drop.x}%`,
                        top: -20,
                    }}
                    animate={
                        !prefersReducedMotion ? {
                            y: ["0vh", "110vh"],
                            opacity: [0, 0.5, 0],
                        } : { opacity: 0.1, y: "50vh" }
                    }
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: drop.delay,
                    }}
                />
            ))}
        </div>
    );
};

const StormParticles = () => {
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const count = isMobile ? 25 : 55;

    // Generate random values for diagonal heavy wind-blown rain
    const drops = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 130 - 15, // wider to compensate for diagonal tilt
        delay: Math.random() * 1.5,
        duration: 0.55 + Math.random() * 0.35, // torrential speed
        length: 22 + Math.random() * 18,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Dark Stormy Atmosphere overlay */}
            <div className="absolute inset-0 bg-[#070707]/40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111116]/20 via-transparent to-transparent" />

            {/* Lightning Flashes (Double-strike pattern repeating at random times) */}
            {!prefersReducedMotion && (
                <motion.div
                    className="absolute inset-0 bg-white/70 pointer-events-none z-10"
                    animate={{
                        opacity: [0, 0, 0, 0.85, 0, 0, 0.7, 0, 0, 0, 0],
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.35, 0.37, 0.39, 0.41, 0.43, 0.45, 0.47, 0.5, 0.8, 1],
                    }}
                />
            )}

            {/* Heavy Wind-Blown Torrential Rain (at 18deg tilt) */}
            {drops.map((drop) => (
                <motion.div
                    key={drop.id}
                    className="absolute bg-blue-300/20 dark:bg-slate-400/20 w-[1.2px] will-change-transform"
                    style={{
                        left: `${drop.x}%`,
                        top: -30,
                        height: drop.length,
                        transform: "rotate(18deg)",
                    }}
                    animate={
                        !prefersReducedMotion ? {
                            y: ["0vh", "110vh"],
                            x: ["0px", `${110 * Math.tan(18 * Math.PI / 180)}vh`],
                            opacity: [0, 0.55, 0],
                        } : { opacity: 0.1, y: "50vh" }
                    }
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: drop.delay,
                    }}
                />
            ))}

            {/* Blowing Wind Wisps */}
            {!prefersReducedMotion && Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                    key={`wisp-${i}`}
                    className="absolute text-white/5 pointer-events-none"
                    style={{
                        top: `${20 + i * 20}%`,
                        left: "-25%",
                    }}
                    animate={{
                        x: ["0vw", "130vw"],
                        opacity: [0, 0.12, 0],
                    }}
                    transition={{
                        duration: 2.5 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 1.2,
                    }}
                >
                    <Wind size={70 + i * 15} strokeWidth={0.4} />
                </motion.div>
            ))}
        </div>
    );
};

// --- Main Background Component ---

export function SeasonalBackground() {
    const { season } = useSeason();
    const { theme } = useTheme(); // can be used to adjust intensity if needed
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || season === 'none') return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[30] transition-colors duration-1000">
            <AnimatePresence mode="wait">
                {season === 'autumn' && (
                    <motion.div
                        key="autumn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <AutumnParticles />
                    </motion.div>
                )}

                {season === 'winter' && (
                    <motion.div
                        key="winter"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <WinterParticles />
                    </motion.div>
                )}

                {season === 'summer' && (
                    <motion.div
                        key="summer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <SummerParticles />
                    </motion.div>
                )}

                {season === 'rainy' && (
                    <motion.div
                        key="rainy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <RainyParticles />
                    </motion.div>
                )}

                {season === 'storm' && (
                    <motion.div
                        key="storm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <StormParticles />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Switcher Components ---

export function SeasonSwitcher() {
    const { season, setSeason } = useSeason();
    const [isOpen, setIsOpen] = useState(false);

    const seasons: { id: Season; label: string; icon: React.ReactNode; color: string }[] = [
        { id: 'none', label: 'None', icon: <EyeOff className="w-4 h-4" />, color: "text-gray-500" },
        { id: 'autumn', label: 'Autumn', icon: <Leaf className="w-4 h-4" />, color: "text-orange-500" },
        { id: 'winter', label: 'Winter', icon: <Snowflake className="w-4 h-4" />, color: "text-blue-400" },
        { id: 'summer', label: 'Summer', icon: <Sun className="w-4 h-4" />, color: "text-amber-500" },
        { id: 'rainy', label: 'Rainy', icon: <CloudRain className="w-4 h-4" />, color: "text-indigo-400" },
        { id: 'storm', label: 'Thunderstorm', icon: <Zap className="w-4 h-4" />, color: "text-slate-400" },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
                title="Change Season"
            >
                {seasons.find(s => s.id === season)?.icon || <Wind className="w-4 h-4" />}
                {season !== 'none' && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1"
                        >
                            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Choose Ambience
                            </p>
                            {seasons.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setSeason(s.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2.5 text-sm flex items-center gap-3 transition-colors hover:bg-secondary/80",
                                        season === s.id ? "bg-secondary/50 text-foreground font-medium" : "text-muted-foreground"
                                    )}
                                >
                                    <span className={cn(s.color)}>{s.icon}</span>
                                    {s.label}
                                    {season === s.id && (
                                        <motion.div layoutId="active-season" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Floating Ambient Switcher (Floating Crescent Moon Widget) ────────────────
export function FloatingAmbientSwitcher() {
    const { season, setSeason } = useSeason();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isDashboard = (pathname ? pathname.startsWith("/dashboard") : false) ||
                        (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard"));

    if (isDashboard) return null;

    const seasons: { id: Season; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
        { id: 'none', label: 'Clear Sky', icon: <EyeOff className="w-4 h-4" />, desc: "Default dark template", color: "text-white/40" },
        { id: 'autumn', label: 'Autumn Leaves', icon: <Leaf className="w-4 h-4" />, desc: "Drifting orange leaves", color: "text-orange-500" },
        { id: 'winter', label: 'Snowy Winter', icon: <Snowflake className="w-4 h-4" />, desc: "Gentle aesthetic snowfall", color: "text-blue-400" },
        { id: 'summer', label: 'Golden Summer', icon: <Sun className="w-4 h-4" />, desc: "Warm glow & fireflies", color: "text-amber-500" },
        { id: 'rainy', label: 'Steady Rain', icon: <CloudRain className="w-4 h-4" />, desc: "Calm streaming rain drops", color: "text-sky-400" },
        { id: 'storm', label: 'Thunderstorm', icon: <Zap className="w-4 h-4" />, desc: "Sideways rain & lightning!", color: "text-yellow-500" },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[999]">
            {/* The Floating crescent moon logo button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#070707]/80 hover:bg-[#0c0c0c] border border-white/10 hover:border-[#C8A97E]/50 text-[#C8A97E] backdrop-blur-md transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.6)] cursor-pointer focus:outline-none"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                title="Choose Ambient Backdrop"
            >
                <Moon className={cn("w-5 h-5 transition-transform duration-500", isOpen && "rotate-45")} strokeWidth={1.5} fill="rgba(200,169,126,0.12)" />
                {season !== 'none' && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C8A97E] animate-pulse" />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay to close when clicking outside */}
                        <div
                            className="fixed inset-0 z-40 bg-transparent cursor-default pointer-events-auto"
                            onClick={() => setIsOpen(false)}
                        />
                        {/* Popup Panel positioned above the moon button */}
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute bottom-16 right-0 w-64 rounded-2xl border border-white/5 bg-[#0a0a0a]/95 backdrop-blur-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden py-3 p-1 pointer-events-auto"
                        >
                            <div className="px-4 py-2 border-b border-white/5 mb-2">
                                <p className="text-[10px] font-bold text-[#C8A97E] uppercase tracking-[0.2em] mb-0.5">
                                    Ambient Mode
                                </p>
                                <p className="text-[9px] text-white/40 tracking-wider">
                                    Customise page animations
                                </p>
                            </div>
                            
                            <div className="space-y-1">
                                {seasons.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setSeason(s.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-left rounded-xl flex items-center gap-3.5 transition-all duration-300 hover:bg-white/5",
                                            season === s.id ? "bg-white/5 text-white font-medium" : "text-white/50"
                                        )}
                                    >
                                        <span className={cn("p-1.5 rounded-lg bg-white/5 transition-all", s.color)}>
                                            {s.icon}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-xs tracking-wider">{s.label}</span>
                                            <span className="text-[9px] text-white/30 tracking-wide font-light">{s.desc}</span>
                                        </div>
                                        {season === s.id && (
                                            <motion.div 
                                                layoutId="floating-active-bullet" 
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C8A97E]" 
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
