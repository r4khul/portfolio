"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Reusable hook for tactile audio feedback.
 * Provides click sound for premium, minimal interface interactions.
 */
export function useAudioFeedback() {
  const clickAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only initialize on client-side
    if (typeof window !== "undefined") {
      clickAudio.current = new Audio("/sfx/click.mp3");
      clickAudio.current.preload = "auto";
      clickAudio.current.volume = 0.45;
    }
  }, []);

  const playClick = useCallback(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const audio = clickAudio.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(() => {
      /* User hasn't interacted with DOM yet */
    });
  }, []);

  return { playClick };
}
