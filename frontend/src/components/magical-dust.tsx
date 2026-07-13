"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const colors = [
  "#ff758f", // deep rose
  "#ff8fab", // pink
  "#ffb3c6", // light pink
  "#ffc2d1", // very light pink
];

export function MagicalDust() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Very few particles, just a subtle elegant touch
    const newParticles = Array.from({ length: 15 }).map((_, i) => {
      // Exactly from the center of the open gate
      const startX = 49 + Math.random() * 2; // 49% to 51% (dead center)
      const startY = 60 + Math.random() * 15; // 60% to 75% (lower middle of the door)
      
      // Gentle drift upwards and slightly outwards
      const driftX = (Math.random() - 0.5) * 15; // -7.5% to +7.5% sideways
      const driftY = -(15 + Math.random() * 20); // 15% to 35% upwards
      
      return {
        id: i,
        startX,
        startY,
        endX: startX + driftX,
        endY: startY + driftY,
        size: Math.random() * 2.5 + 1.5, // slightly smaller, 1.5px to 4px
        duration: Math.random() * 3 + 3.5, // 3.5s to 6.5s (faster fade out into the air)
        delay: Math.random() * 8, // staggered starts
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-screen">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            left: [`${p.startX}%`, `${p.endX}%`],
            top: [`${p.startY}%`, `${p.endY}%`],
            opacity: [0, 1, 0], // Smooth fade in and fade out
            scale: [0, 1.2, 0.2], // Starts small, grows slightly, then shrinks as it vanishes
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear", // Linear makes it float continuously without stopping or crawling
          }}
        />
      ))}
    </div>
  );
}
