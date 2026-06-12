"use client";

import { useEffect, useRef, memo } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export const ThemeToggle = memo(({
  className = "tactile flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground active:scale-90",
  iconClassName = "relative size-4.5"
}: {
  className?: string;
  iconClassName?: string;
} = {}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sfx/switch.mp3");
    audioRef.current.preload = "auto";
  }, []);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const toggleTheme = (event: React.MouseEvent) => {
    // Audio feedback - non-blocking
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    const isDark = resolvedTheme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    // Fallback for browsers that don't support View Transitions 
    // or for users who prefer reduced motion (extremely important for low-end feel)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (!(document as any).startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(async () => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      // Use a slightly faster duration (450ms) for a snappier feel on low-end hardware
      // 700ms can feel like it's "dragging" if frames drop
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 800,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const isLight = mounted && resolvedTheme === "light";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className={className}
      onClick={toggleTheme}
    >
      <div className={iconClassName}>
        <motion.div
          animate={{
            scale: isLight ? 1 : 0,
            rotate: isLight ? 0 : 45,
            opacity: isLight ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="absolute inset-0"
        >
          <Sun className="size-full fill-current" />
        </motion.div>
        <motion.div
          animate={{
            scale: isLight ? 0 : 1,
            rotate: isLight ? -45 : 0,
            opacity: isLight ? 0 : 1,
          }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="absolute inset-0"
        >
          <Moon className="size-full fill-current" />
        </motion.div>
      </div>
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
