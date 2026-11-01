"use client";

import { useEffect, useRef } from "react";
import { useAudioContext } from "@/lib/contexts/audio-context";
import { isStoryAudioReady, playStorySound, subscribeStoryAudio, type StoryPlayback, type StorySound } from "@/lib/story-audio";

/**
 * Couple a scene's visibility, CSS motion and single authored audio phrase.
 * An SVG may keep moving quietly while in view, but that never loops its sound.
 */
export function useStoryScene(sound: StorySound) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMuted } = useAudioContext();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The overhead encounter needs both curbs in view. A quarter of the frame
    // only exposes the road's lower edge on a phone, spending the approach sound
    // before the car reaches the screen. Closing clues likewise wait for their
    // central detail; the quieter memory/fortune scenes can enter earlier.
    const entryThreshold = sound === "roadside" ? 0.7
      : sound === "watch" || sound === "opportunity" ? 0.55 : 0.25;
    let inView = false;
    // Consume the phrase once per visit. Tab visibility changes alone do not
    // replay it; a deliberate departure and return to the scene begins a new visit.
    let played = false;
    let playback: StoryPlayback | null = null;

    const stop = () => {
      playback?.stop();
      playback = null;
    };
    const update = () => {
      const active = inView && !document.hidden && !reducedMotion.matches;
      container.dataset.active = String(active);
      // Muting leaves the illustration running. Reduced motion instead presents
      // the static drawing, with no unsolicited scene sound attached to it.
      if (!active || isMuted || !isStoryAudioReady()) {
        stop();
        return;
      }
      if (played) return;
      playback = playStorySound(sound);
      if (playback) {
        played = true;
        // Start the SVG phrase at the same software origin as the decoded sound.
        // This also handles a late download/unlock: the watch's two hand steps
        // still match the contacts authored at .08s and .57s before the ending's
        // five-second musical bed. Both run once rather than restarting on a loop.
        container.getAnimations({ subtree: true }).forEach((animation) => {
          animation.currentTime = 0;
        });
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      // Use a lower departure threshold than entry. This hysteresis prevents
      // small scroll movements from repeatedly firing the same authored phrase.
      const visible = entry.isIntersecting && entry.intersectionRatio >= (inView ? 0.1 : entryThreshold);
      if (!visible && inView) played = false;
      inView = visible;
      update();
    }, { threshold: [0, 0.1, entryThreshold] });

    observer.observe(container);
    // Readiness covers both completed decoding and browser/OS audio state changes.
    // update() rechecks all reader preferences, so neither can play an unseen scene.
    const unsubscribe = subscribeStoryAudio(update);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pagehide", stop);
    reducedMotion.addEventListener("change", update);

    return () => {
      // Route changes and Strict Mode remounts must release exactly what this
      // visit installed, including any phrase still sounding during navigation.
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      unsubscribe();
      window.removeEventListener("pagehide", stop);
      reducedMotion.removeEventListener("change", update);
      container.dataset.active = "false";
      stop();
    };
  }, [sound, isMuted]);

  return containerRef;
}
