"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Season = 'none' | 'autumn' | 'winter' | 'summer' | 'rainy' | 'storm';

interface SeasonContextType {
    season: Season;
    setSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: React.ReactNode }) {
    const [season, setSeasonState] = useState<Season>('none');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedSeason = localStorage.getItem('dashboard_season_v3') as Season;
        if (savedSeason) {
            setSeasonState(savedSeason);
        } else {
            // Default for landing page: none (no effects)
            setSeasonState('none');
        }
        setMounted(true);
    }, []);

    const setSeason = (newSeason: Season) => {
        setSeasonState(newSeason);
        localStorage.setItem('dashboard_season_v3', newSeason);
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
