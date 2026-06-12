"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { playClick } = useAudioFeedback();

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    // Check initial scroll position
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => {
            playClick();
            scrollToTop();
          }}
          aria-label="Scroll back to top"
          className="fixed z-40 flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition active:scale-95 hover:bg-background/50 hover:text-foreground
            bottom-6 right-4
            sm:right-8
            xl:bottom-10 xl:right-[calc(50vw-24rem-5rem)]
            cursor-pointer
          "
        >
          <ArrowUp className="size-5" strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
