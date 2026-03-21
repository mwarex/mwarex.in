"use client";

import { useEffect } from "react";
import { SeasonalBackground } from "@/components/seasonal-background";
import { useSeason } from "@/contexts/SeasonContext";

import AIChatBot from "@/components/AIChatBot";

function DashboardSeasonInit() {
    const { season, setSeason } = useSeason();

    useEffect(() => {
        // Force autumn as default on dashboard if no user preference was set
        const saved = localStorage.getItem('dashboard_season_v3');
        if (!saved || saved === 'none') {
            setSeason('autumn');
        }
    }, [setSeason]);

    return null;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-[#0d0d0d]">
            {/* Init default winter season for dashboard */}
            <DashboardSeasonInit />

            {/* Premium corner net/grid — 4 individual corners fading inward */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                {/* Top-left */}
                <div className="absolute top-0 left-0 w-[55%] h-[55%]" style={{
                    backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at top left, black 0%, transparent 65%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at top left, black 0%, transparent 65%)'
                }} />
                {/* Top-right */}
                <div className="absolute top-0 right-0 w-[55%] h-[55%]" style={{
                    backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 65%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 65%)'
                }} />
                {/* Bottom-left */}
                <div className="absolute bottom-0 left-0 w-[55%] h-[55%]" style={{
                    backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at bottom left, black 0%, transparent 65%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at bottom left, black 0%, transparent 65%)'
                }} />
                {/* Bottom-right */}
                <div className="absolute bottom-0 right-0 w-[55%] h-[55%]" style={{
                    backgroundImage: 'linear-gradient(rgba(200,169,126,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.07) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 65%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 65%)'
                }} />
            </div>

            {/* Seasonal Effects (snowfall etc) */}
            <SeasonalBackground />

            {/* Content — sits above backgrounds */}
            <div className="relative" style={{ zIndex: 10 }}>
                {children}
            </div>

            {/* Global Floating AI Chat Widget */}
            <AIChatBot />
        </div>
    );
}
