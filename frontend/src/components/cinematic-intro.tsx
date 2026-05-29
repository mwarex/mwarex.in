"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Phase = "appear" | "hold" | "zoom" | "glide" | "done";

interface FlyTarget {
  x: number;
  y: number;
  scale: number;
}

interface CinematicIntroProps {
  onZoomStart?: () => void;
  onComplete?: () => void;
}

export function CinematicIntro({ onZoomStart, onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<Phase | null>(null); // null = not started / loading
  const [flyTarget, setFlyTarget] = useState<FlyTarget>({ x: 0, y: 0, scale: 0.4 });

  useEffect(() => {
    // Start the animation sequence immediately on mount
    setPhase("appear");

    // Hide the navbar logo at start so it doesn't double-render
    const navAnchor = document.getElementById("nav-logo-anchor");
    if (navAnchor) {
      navAnchor.style.opacity = "0";
      navAnchor.style.transition = "opacity 0.3s ease";
    }

    // 1. Transition to 'hold' after appearance (0.8s)
    const toHold = setTimeout(() => {
      setPhase("hold");
    }, 400);

    // 2. Transition to 'zoom' (black screen starts fading, logo gets huge, page content fades in) (1.4s)
    const toZoom = setTimeout(() => {
      setPhase("zoom");
      if (onZoomStart) onZoomStart();
    }, 1400);

    // 3. Transition to 'glide' (logo flies to the top-left corner) (2.2s)
    const toGlide = setTimeout(() => {
      const anchor = document.getElementById("nav-logo-anchor");
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;
      const centerX = wWidth / 2;
      const centerY = wHeight / 2;

      let tx = -centerX + 60;
      let ty = -centerY + 40;
      let tScale = 0.4;

      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const navCenterX = rect.left + rect.width / 2;
        const navCenterY = rect.top + rect.height / 2;

        tx = navCenterX - centerX;
        ty = navCenterY - centerY;
        tScale = rect.width / 100; // 100px is the natural size of our centered logo image
      }

      setFlyTarget({ x: tx, y: ty, scale: tScale });
      setPhase("glide");
    }, 2200);

    // 4. Complete animation sequence (2.2s)
    const toDone = setTimeout(() => {
      setPhase("done");
      // Reveal the real navbar logo
      const anchor = document.getElementById("nav-logo-anchor");
      if (anchor) {
        anchor.style.opacity = "1";
      }
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(toHold);
      clearTimeout(toZoom);
      clearTimeout(toGlide);
      clearTimeout(toDone);
    };
  }, [onZoomStart, onComplete]);

  // Render nothing if completed or loading
  if (phase === null || phase === "done") return null;

  // ── Animation values based on phase ────────────────────────────────────────
  const logoAnimate =
    phase === "appear"
      ? { opacity: 1, scale: 1.1, x: 0, y: 0 }
      : phase === "hold"
      ? { opacity: 1, scale: 1.25, x: 0, y: 0 }
      : phase === "zoom"
      ? { opacity: 0.9, scale: 4.5, x: 0, y: 0 }
      : /* glide */ { opacity: 1, scale: flyTarget.scale, x: flyTarget.x, y: flyTarget.y };

  const logoTransition =
    phase === "appear"
      ? { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as any } // elegant spring bounce
      : phase === "hold"
      ? { duration: 0.6, ease: "linear" } // slow cinematic drift
      : phase === "zoom"
      ? { duration: 0.8, ease: [0.25, 1, 0.5, 1] as any } // smooth zoom-in expansion
      : /* glide */ { duration: 1.0, ease: [0.16, 1, 0.3, 1] as any }; // custom premium deceleration curve

  const overlayAnimate =
    phase === "appear" || phase === "hold" ? { opacity: 1 } : { opacity: 0 };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden">
      {/* Solid black screen backdrop — fades out during zoom phase */}
      <motion.div
        className="absolute inset-0 bg-[#070707]"
        animate={overlayAnimate}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Dynamic light halos behind the logo for a premium studio look */}
      {phase !== "glide" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
          <motion.div
            animate={{
              scale: phase === "zoom" ? [1.2, 2.5] : [1, 1.2, 1],
              opacity: phase === "zoom" ? [0.6, 0] : [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: phase === "zoom" ? 0.8 : 3.0,
              ease: "easeInOut",
              repeat: phase === "zoom" ? 0 : Infinity,
            }}
            style={{
              width: 350,
              height: 350,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,229,255,0.12) 0%, rgba(200,169,126,0.06) 50%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>
      )}

      {/* The main logo container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          id="ci-logo"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={logoAnimate}
          transition={logoTransition}
          style={{ transformOrigin: "center center" }}
        >
          <Image
            src="/mwarexlogo.png"
            alt="MWareX"
            width={100}
            height={100}
            priority
            className="object-contain block drop-shadow-[0_0_35px_rgba(255,255,255,0.1)]"
            draggable={false}
          />
        </motion.div>
      </div>
    </div>
  );
}
