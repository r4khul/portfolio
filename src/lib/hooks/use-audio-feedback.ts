"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioContext } from "@/lib/contexts/audio-context";

/**
 * Reusable hook for tactile audio feedback.
 * Provides click sound for premium, minimal interface interactions.
 */
export function useAudioFeedback() {
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const { isMuted } = useAudioContext();

  useEffect(() => {
    // Only initialize on client-side
    if (typeof window !== "undefined") {
      clickAudio.current = new Audio("/sfx/click.mp3");
      clickAudio.current.preload = "auto";
      clickAudio.current.volume = 0.45;
    }
  }, []);

  const playClick = useCallback(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches || isMuted) {
      return;
    }

    const audio = clickAudio.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(() => {
      /* User hasn't interacted with DOM yet */
    });
  }, [isMuted]);

  return { playClick };
}
