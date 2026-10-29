"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/lib/contexts/audio-context";
import { primeStoryAudio, warmStoryAudio } from "@/lib/story-audio";
import { playSfx } from "@/lib/sfx";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AudioPrompt() {
  const { isMuted, toggleMute } = useAudioContext();
  const [show, setShow] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fetch/decode while the reader considers the card. This produces no audio;
  // browser output stays locked until a real entry/unmute gesture below.
  useEffect(() => { void warmStoryAudio(); }, []);

  useEffect(() => {
    if (!show) return;
    // Preserve an existing overflow rule instead of blindly clearing another
    // surface's scroll lock when the entry card closes or the layout unmounts.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the dialog, not its last button. Focusing Enter would scroll a tall
    // card past its title on short landscape screens before it had been read.
    dialogRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previous; };
  }, [show]);

  useEffect(() => {
    if (isMuted) return;
    // The card is the only visible sound control in story mode. Once dismissed,
    // trusted gestures can still recover audio after a phone/OS interruption.
    // Observing a scene or returning to the tab never resumes audio by itself.
    const unlock = () => { void primeStoryAudio(); };
    window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [isMuted]);

  const handleToggleClick = () => {
    // Share the saved mute preference with the portfolio navigation's control.
    // An explicit unmute is also a valid gesture for unlocking Web Audio.
    if (isMuted) {
      void primeStoryAudio();
      playSfx("switch", 0.45);
    }
    toggleMute();
  };

  const handleEnter = () => {
    // A reader may enter with audio muted. Only an enabled entry unlocks output;
    // there is no extra top-of-page button or second consent step in the chapter.
    if (!isMuted) void primeStoryAudio();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
          aria-modal="true"
          aria-labelledby="story-audio-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[#0d0c0c]/98 backdrop-blur-md px-6 py-6 text-center select-none"
        >
          {/* Auto margins center a fitting card and become zero on short screens.
              The outer scroll area then keeps Enter Story reachable in landscape. */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
            className="my-auto w-full max-w-[440px] shrink-0 rounded-2xl border border-story-border bg-[#0d0c0c] p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle overlay matching the story mode styling */}
            <div className="story-grain absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" />
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#5a5754] mb-2">
                Cinematic Reading
              </span>
              
              <h2 id="story-audio-title" className="mb-4 font-serif text-3xl md:text-4xl font-normal text-[#e8e6e3]">
                Immersive Audio
              </h2>

              <p className="mb-10 font-sans text-sm leading-relaxed text-[#9c9994] max-w-[320px]">
                This story features custom sound effects and ambient soundscapes. Turn on audio for the intended experience.
              </p>

              {/* Large central interactive toggle button */}
              <button
                type="button"
                onClick={handleToggleClick}
                className="group relative flex h-24 w-24 items-center justify-center rounded-full border border-story-border bg-[#141416]/50 text-[#e8e6e3] transition-all hover:bg-[#1c1c1e] hover:border-[#5a5754] hover:shadow-[0_0_30px_rgba(253,224,71,0.04)] active:scale-95 mb-4"
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {/* Active glow ping if unmuted */}
                {!isMuted && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-yellow-500/10 pointer-events-none" />
                )}
                
                <div className="relative size-8">
                  <motion.div
                    initial={{ scale: isMuted ? 1 : 0, rotate: isMuted ? 0 : 45, opacity: isMuted ? 1 : 0 }}
                    animate={{
                      scale: isMuted ? 1 : 0,
                      rotate: isMuted ? 0 : 45,
                      opacity: isMuted ? 1 : 0,
                    }}
                    transition={{ duration: 0.25, ease: "circOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <VolumeX className="size-full fill-current text-[#5a5754] group-hover:text-[#9c9994] transition-colors" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: isMuted ? 0 : 1, rotate: isMuted ? -45 : 0, opacity: isMuted ? 0 : 1 }}
                    animate={{
                      scale: isMuted ? 0 : 1,
                      rotate: isMuted ? -45 : 0,
                      opacity: isMuted ? 0 : 1,
                    }}
                    transition={{ duration: 0.25, ease: "circOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Volume2 className="size-full fill-current text-yellow-400" />
                  </motion.div>
                </div>
              </button>

              <span className="font-mono text-[11px] uppercase tracking-wider text-[#9c9994] mb-12">
                {isMuted ? "Audio is Muted" : "Audio is On"}
              </span>

              {/* Enter Button */}
              <button
                type="button"
                onClick={handleEnter}
                className="w-full rounded-full bg-[#e8e6e3] hover:bg-[#ffffff] text-[#0d0c0c] py-3.5 font-sans text-sm font-medium tracking-wide transition-all active:scale-98 shadow-md"
              >
                Enter Story
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
