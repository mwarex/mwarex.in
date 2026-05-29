"use client";

import { useState, useEffect } from "react";
import { CinematicIntro } from "@/components/cinematic-intro";
import { motion } from "framer-motion";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [contentVisible, setContentVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false); // default to false to allow initial render matching server

  useEffect(() => {
    setMounted(true);
    const played = sessionStorage.getItem("mwarex_intro_played") === "true";
    setHasPlayedIntro(played);
    if (played) {
      setContentVisible(true);
    }
  }, []);

  const handleComplete = () => {
    setContentVisible(true);
    sessionStorage.setItem("mwarex_intro_played", "true");
    setHasPlayedIntro(true);
  };

  return (
    <>
      {/* Wrap page content to smoothly fade and slide in during the intro's zoom phase */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
        className="w-full min-h-screen flex flex-col"
        style={{ opacity: 0 }}
      >
        {children}
      </motion.div>

      {/* Only render CinematicIntro on client side when not yet played */}
      {mounted && !hasPlayedIntro && (
        <CinematicIntro 
          onZoomStart={() => setContentVisible(true)}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
