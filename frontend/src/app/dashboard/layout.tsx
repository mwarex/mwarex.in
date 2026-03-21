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

            {/* Floating WhatsApp Channel Button */}
            <a
              href="https://whatsapp.com/channel/0029VbCLiDRInlqWn7hoDF00"
              target="_blank"
              rel="noopener noreferrer"
              title="Join our WhatsApp Channel"
              className="fixed bottom-[88px] right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-200"
            >
              <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                <path d="M16.004 3.2C8.94 3.2 3.204 8.936 3.204 16c0 2.26.588 4.46 1.708 6.404L3.2 28.8l6.596-1.732A12.72 12.72 0 0 0 16.004 28.8c7.064 0 12.796-5.736 12.796-12.8S23.068 3.2 16.004 3.2Zm0 23.2a10.36 10.36 0 0 1-5.288-1.444l-.38-.224-3.916 1.028 1.044-3.82-.248-.392A10.36 10.36 0 0 1 5.604 16c0-5.744 4.656-10.4 10.4-10.4 5.744 0 10.396 4.656 10.396 10.4 0 5.744-4.652 10.4-10.396 10.4Zm5.7-7.788c-.312-.156-1.848-.912-2.136-1.016-.284-.108-.492-.156-.7.156s-.804 1.016-.988 1.224c-.18.208-.364.232-.676.076-.312-.156-1.316-.484-2.508-1.548-.928-.828-1.552-1.848-1.736-2.16-.18-.312-.02-.48.136-.636.14-.14.312-.364.468-.544.156-.184.208-.312.312-.52.108-.208.056-.388-.028-.544-.08-.156-.7-1.688-.96-2.312-.252-.608-.508-.524-.7-.536l-.596-.008c-.208 0-.544.076-.828.388-.284.312-1.088 1.064-1.088 2.596s1.112 3.012 1.268 3.22c.156.208 2.188 3.34 5.3 4.684.74.32 1.32.512 1.772.656.744.236 1.42.204 1.956.124.596-.088 1.848-.756 2.108-1.484.26-.728.26-1.352.184-1.484-.08-.128-.288-.208-.6-.364Z"/>
              </svg>
            </a>

            {/* Global Floating AI Chat Widget */}
            <AIChatBot />
        </div>
    );
}
