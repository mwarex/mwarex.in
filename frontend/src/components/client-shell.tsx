"use client";

import { useState } from "react";
import { CinematicIntro } from "@/components/cinematic-intro";
import { motion } from "framer-motion";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [contentVisible, setContentVisible] = useState(false);

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

      <CinematicIntro 
        onZoomStart={() => setContentVisible(true)}
        onComplete={() => setContentVisible(true)} // Safeguard to ensure page is visible
      />
    </>
  );
}
