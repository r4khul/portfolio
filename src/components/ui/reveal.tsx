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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a more premium, "smooth-stop" feel
        opacity: { duration: 0.6 },
      }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
});

Reveal.displayName = 'Reveal';
