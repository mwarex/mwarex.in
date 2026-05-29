"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#111111]">
      <div className="flex flex-col items-center gap-6">
        {/* Logo with pulse glow */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            filter: ["brightness(0.8)", "brightness(1.3)", "brightness(0.8)"],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Glow halo */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl bg-white/10"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Image
            src="/mwarexlogo.png"
            alt="MWareX"
            width={64}
            height={64}
            priority
            className="relative z-10 object-contain"
          />
        </motion.div>

        {/* Loading bar */}
        <div className="w-32 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/60 rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
