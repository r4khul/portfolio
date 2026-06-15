"use client";

import { motion, useReducedMotion } from "motion/react";
import { memo, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** Scroll-triggered fade-up. Respects prefers-reduced-motion. */
export const Reveal = memo(({ children, delay = 0, className }: RevealProps) => {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: "easeOut",
      }}
      style={{ 
        willChange: "opacity, transform",
        backfaceVisibility: "hidden",
        perspective: 1000
      }}
    >
      {children}
    </motion.div>
  );
});

Reveal.displayName = 'Reveal';
