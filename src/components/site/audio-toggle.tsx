"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useAudioContext } from "@/lib/contexts/audio-context";

export const AudioToggle = memo(({
  className = "tactile flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground active:scale-90",
  iconClassName = "relative size-4.5"
}: {
  className?: string;
  iconClassName?: string;
} = {}) => {
  const { isMuted, toggleMute } = useAudioContext();
  const switchAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      switchAudio.current = new Audio("/sfx/switch.mp3");
      switchAudio.current.preload = "auto";
    }
  }, []);

  const handleClick = useCallback(() => {
    // Play switch sound before muting
    if (switchAudio.current && !isMuted) {
      switchAudio.current.currentTime = 0;
      switchAudio.current.play().catch(() => {});
    }
    toggleMute();
  }, [isMuted, toggleMute]);

  return (
    <button
      type="button"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
      className={className}
      onClick={handleClick}
    >
      <div className={iconClassName}>
        <motion.div
          initial={{ scale: isMuted ? 1 : 0, rotate: isMuted ? 0 : 45, opacity: isMuted ? 1 : 0 }}
          animate={{
            scale: isMuted ? 1 : 0,
            rotate: isMuted ? 0 : 45,
            opacity: isMuted ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="absolute inset-0"
        >
          <VolumeX className="size-full fill-current" />
        </motion.div>
        <motion.div
          initial={{ scale: isMuted ? 0 : 1, rotate: isMuted ? -45 : 0, opacity: isMuted ? 0 : 1 }}
          animate={{
            scale: isMuted ? 0 : 1,
            rotate: isMuted ? -45 : 0,
            opacity: isMuted ? 0 : 1,
          }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="absolute inset-0"
        >
          <Volume2 className="size-full fill-current" />
        </motion.div>
      </div>
    </button>
  );
});

AudioToggle.displayName = 'AudioToggle';
