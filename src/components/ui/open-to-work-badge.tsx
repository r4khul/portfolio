"use client";

import { motion } from "motion/react";

export function OpenToWorkBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-10"
    >
      <div className="relative flex items-center gap-2 rounded-full border border-white/40 bg-[#87bbea]/90 px-3 py-1 backdrop-blur-xl">
        {/* Static Status Indicator */}
        <span className="relative flex size-1.5">
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>

        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
          Open to work
        </span>

        {/* Subtle cloud color fade within the badge */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
