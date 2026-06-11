"use client";

import { useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
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
    // Audio feedback - optimized for immediate play
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Peak Transition: View Transition API with circular clip-path
    if (!(document as any).startViewTransition) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = (document as any).startViewTransition(async () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="tactile flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground active:scale-95"
      onClick={toggleTheme}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && resolvedTheme === "light" ? (
          <motion.div
            key="sun"
            initial={{ scale: 0.5, rotate: 45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Sun className="size-4.5 fill-current" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Moon className="size-4.5 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
