"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface AnimatedActionButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  primary?: boolean;
}

export function AnimatedActionButton({ 
  href, 
  children, 
  className = "",
  primary = false
}: AnimatedActionButtonProps) {
  const baseClasses = "relative flex items-center justify-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold tracking-wide overflow-hidden";
  const colorClasses = primary 
    ? "tactile-accent" 
    : "bg-surface border border-edge text-foreground";

  return (
    <Link href={href} className="group outline-none">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`${baseClasses} ${colorClasses} ${className}`}
      >
        <span className="relative z-10 flex items-center gap-1.5">
          {children}
          <motion.span
            className="inline-block"
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ArrowRight className="size-4" />
          </motion.span>
        </span>
        
        {/* Subtle shine effect on hover */}
        <motion.div
          className="absolute inset-0 z-0 bg-white opacity-0"
          initial={{ opacity: 0, x: "-100%" }}
          whileHover={{ opacity: 0.1, x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ skewX: -20 }}
        />
      </motion.div>
    </Link>
  );
}
