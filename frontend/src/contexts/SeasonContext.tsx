"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type Season = 'none' | 'autumn' | 'winter' | 'summer' | 'rainy' | 'storm';

interface SeasonContextType {
    season: Season;
    setSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = (pathname ? pathname.startsWith("/dashboard") : false) ||
                        (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard"));

    const [publicSeason, setPublicSeason] = useState<Season>('none');
    const [dashboardSeason, setDashboardSeason] = useState<Season>('autumn');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedPublic = localStorage.getItem('public_season_v3') as Season;
        if (savedPublic) {
            setPublicSeason(savedPublic);
        } else {
            setPublicSeason('none');
        }

        const savedDashboard = localStorage.getItem('dashboard_season_v3') as Season;
        if (savedDashboard) {
            setDashboardSeason(savedDashboard);
        } else {
            setDashboardSeason('autumn');
        }
        setMounted(true);
    }, []);

    const season = isDashboard ? dashboardSeason : publicSeason;

    const setSeason = (newSeason: Season) => {
        if (isDashboard) {
            setDashboardSeason(newSeason);
            localStorage.setItem('dashboard_season_v3', newSeason);
        } else {
            setPublicSeason(newSeason);
            localStorage.setItem('public_season_v3', newSeason);
        }
    };

    return (
        <SeasonContext.Provider value={{ season, setSeason }}>
            {children}
        </SeasonContext.Provider>
    );
}

export function useSeason() {
    const context = useContext(SeasonContext);
    if (context === undefined) {
        throw new Error('useSeason must be used within a SeasonProvider');
    }
    return context;
}
