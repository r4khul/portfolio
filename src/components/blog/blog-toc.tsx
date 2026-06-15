"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import { AlignLeft } from "lucide-react";

type Heading = { title: string; id: string };

export function BlogToc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { playClick } = useAudioFeedback();
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Scroll spy
  useEffect(() => {
    if (headings.length === 0) return;

    let rafId = 0;
    let scheduled = false;

    const update = () => {
      scheduled = false;
      if (isScrollingRef.current) return;

      const scrollY = window.scrollY + window.innerHeight * 0.3;

      let current = headings[0]?.id || "";
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollY) current = heading.id;
        }
      }

      // Near-bottom special case
      const nearBottom =
         window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10;
      if (nearBottom && headings.length > 0) {
        current = headings[headings.length - 1].id;
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(update);
    };

    // Initial check
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    playClick();
    setIsOpen(false);
    
    const el = document.getElementById(id);
    if (el) {
      // Pause scroll spy to prevent stuttering from rapid re-renders
      isScrollingRef.current = true;
      setActiveId(id);
      
      const y = el.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: y, behavior: "smooth" });
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  // Lock body scroll when mobile drawer is open
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

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop TOC - Fixed to the right gutter */}
      <aside className="fixed top-0 right-0 z-40 hidden h-full w-[calc((100vw-48rem)/2)] flex-col items-start justify-center pointer-events-none xl:flex pl-[max(2rem,calc((100vw-48rem)/4-6rem))]">
        <nav className="flex flex-col items-start gap-1 pointer-events-auto" aria-label="Table of Contents">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`group relative flex items-center gap-3 py-1.5 text-left no-underline`}
              >
                {/* Active Indicator Line */}
                <span 
                  className={`absolute left-0 w-0.5 rounded-full duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'h-full bg-accent opacity-100' : 'h-1/2 bg-edge opacity-0 group-hover:opacity-100'} transition-all will-change-[height,opacity]`} 
                />
                
                {/* Title */}
                <span
                  className={`font-serif text-[16px] pl-3.5 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left tracking-tight transition-all will-change-transform ${
                    isActive
                      ? "text-foreground scale-110"
                      : "text-faint hover:text-muted scale-100"
                  }`}
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {heading.title}
                </span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Toggle Button */}
      <div className="xl:hidden">
        <button
          onClick={() => {
            playClick();
            setIsOpen(!isOpen);
          }}
          className="fixed left-4 top-3 z-60 flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition active:scale-95 hover:bg-background/50 hover:text-foreground"
          aria-label="Table of Contents"
        >
          <AlignLeft className="size-5" strokeWidth={1.5} />
        </button>

        {/* Mobile Drawer (65% width) */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => { playClick(); setIsOpen(false); }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-[70%] max-w-[300px] border-r border-edge bg-background/95 backdrop-blur-2xl shadow-2xl px-6 py-6 flex flex-col"
              >
                <div className="h-11 mb-4" /> {/* Spacing to clear the fixed button area */}
                
                <nav className="flex flex-col gap-6 overflow-y-auto scrollbar-none pb-12">
                  {headings.map((heading, i) => {
                    const isActive = activeId === heading.id;
                    return (
                      <motion.div
                        key={heading.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                      >
                        <a
                          href={`#${heading.id}`}
                          onClick={(e) => handleClick(e, heading.id)}
                          className={`group flex items-start gap-4 transition-colors duration-200 ${isActive ? "text-foreground" : "text-muted hover:text-foreground"}`}
                        >
                          <span className={`mt-2 flex size-1.5 shrink-0 rounded-full transition-colors duration-200 ${isActive ? "bg-accent" : "bg-edge group-hover:bg-muted"}`} />
                          <span className="font-serif text-[20px] leading-tight tracking-tight">
                            {heading.title}
                          </span>
                        </a>
                      </motion.div>
                    );
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
