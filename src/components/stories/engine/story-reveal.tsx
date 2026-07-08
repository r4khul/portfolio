"use client";

import { useEffect, useRef, ReactNode } from "react";

interface StoryRevealProps {
  children: ReactNode;
  /** Delay in ms before the animation starts after intersection */
  delay?: number;
  /** CSS class for the revealed state (default adds .is-revealed) */
  className?: string;
}

/**
 * Wraps children in a scroll-gated reveal.
 * Text starts hidden (opacity 0, slightly offset) and reveals once
 * it enters the viewport. Intersection is observed once — then disconnected.
 */
export function StoryReveal({ children, delay = 0, className = "" }: StoryRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion — skip entirely, just show
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("is-revealed");
          }, delay);
        } else {
          // If the element goes below the viewport (top of bounding rect is > 0),
          // remove the class so it reveals again when scrolling back down.
          if (entry.boundingClientRect.top > 0) {
            el.classList.remove("is-revealed");
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px", // trigger slightly before edge
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`story-reveal ${className}`}>
      {children}
    </div>
  );
}
