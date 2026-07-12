"use client";

import { motion } from "framer-motion";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.99 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
}
