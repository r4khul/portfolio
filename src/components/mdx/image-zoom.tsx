"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";

type ImageZoomProps = {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
};

export function ImageZoom({ src, alt, children }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleZoom = useCallback(() => setIsOpen((prev) => !prev), []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const content = children ? (
    children
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="block w-full"
      loading="lazy"
    />
  );

  return (
    <>
      <div className="group relative my-8 overflow-hidden rounded-xl border border-edge transition-all hover:border-edge-strong">
        {/* Main Content */}
        <div 
          className="cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.01]"
          onClick={toggleZoom}
        >
          {content}
        </div>

        {/* Zoom Button - Enhanced for discoverability */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2 pointer-events-none">
          <span className="rounded-full bg-background/90 px-2 py-1 font-mono text-[10px] font-medium text-foreground shadow-sm backdrop-blur-md opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Tap to expand
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
            className="flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-background opacity-100 sm:opacity-0 group-hover:opacity-100 pointer-events-auto"
            aria-label="Zoom image"
          >
            <Maximize2 className="size-4.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/98 p-2 backdrop-blur-3xl sm:p-8"
            onClick={toggleZoom}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-6 right-6 z-10 flex size-12 items-center justify-center rounded-full bg-surface text-foreground shadow-xl ring-1 ring-edge-strong active:scale-95 sm:top-10 sm:right-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <X className="size-6" />
            </motion.button>

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: "spring", 
                  stiffness: 350, 
                  damping: 30,
                  mass: 0.7
                } 
              }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="relative w-full max-w-[98vw] overflow-hidden sm:max-w-[92vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center justify-center">
                {/* Scrollable container for very large diagrams on mobile */}
                <div className="max-h-[85vh] w-full overflow-auto rounded-2xl shadow-2xl [&>img]:mx-auto [&>img]:max-h-[82vh] [&>img]:w-auto [&>img]:max-w-full [&>img]:object-contain [&>div]:mx-auto [&>div]:w-full [&>div]:scale-[1.05] sm:[&>div]:scale-110 [&>svg]:mx-auto [&>svg]:max-h-[82vh] [&>svg]:w-full">
                  {content}
                </div>
                
                {alt && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                    className="mt-8 px-6 text-center font-serif text-xl italic text-muted sm:text-2xl"
                  >
                    {alt}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
