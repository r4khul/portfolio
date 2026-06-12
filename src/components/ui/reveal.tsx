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
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ 
        duration: 0.55, 
        delay, 
        ease: [0.21, 0.47, 0.32, 0.98],
        opacity: { duration: 0.4 },
        y: { type: "spring", damping: 25, stiffness: 200 }
      }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});

Reveal.displayName = 'Reveal';
