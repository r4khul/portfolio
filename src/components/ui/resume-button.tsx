"use client";

import { motion } from "motion/react";
import { FileUser } from "lucide-react";

interface ResumeButtonProps {
  href: string;
}

export function ResumeButton({ href }: ResumeButtonProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-center overflow-hidden rounded-xl border border-white/40 bg-[#87bbea] px-4 py-2 text-white transition duration-300 hover:brightness-105"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-label="View Resume"
    >
      {/* Cloudy white tone at the left top edge for spread of 25% */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          background: "radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 25%)"
        }}
      />

      {/* Subtle cloud color fade (internal) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-center gap-2">
        <FileUser className="size-4.5" />
        <span className="font-sans text-[14px] font-medium tracking-wide">
          Resume
        </span>
      </div>

      {/* Soft inner border/glow for definition without shadow */}
      <div className="absolute inset-px rounded-[11px] border border-white/20 pointer-events-none" />
    </motion.a>
  );
}
