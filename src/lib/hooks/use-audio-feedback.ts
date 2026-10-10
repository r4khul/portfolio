"use client";

import { useCallback } from "react";
import { useAudioContext } from "@/lib/contexts/audio-context";
import { haptic } from "@/lib/haptics";
import { playSfx } from "@/lib/sfx";

/**
 * Reusable hook for tactile feedback.
 * An instant click sound (Web Audio, decoded once per page) on pointer
 * devices, a crisp haptic tick on touch devices.
 */
export function useAudioFeedback() {
  const { isMuted } = useAudioContext();

  const playClick = useCallback(() => {
    // touch screens feel every press, even though they don't hear it
    haptic("tick");
    if (isMuted || window.matchMedia("(pointer: coarse)").matches) return;
    playSfx("click", 0.45);
  }, [isMuted]);

  return { playClick };
}
