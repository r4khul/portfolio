"use client";

import { useState, useEffect, ComponentProps } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { User, Briefcase, FolderOpen, Wrench, GitMerge, BookOpen, Library, Mail, Earth } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { AudioToggle } from "./audio-toggle";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

// These stay as home-page hashes so the same drawer works from detail pages.
// Every destination remains available even when a short viewport needs scrolling.
const nav = [
  { label: "About",       href: "/#about",       icon: User },
  { label: "Experience",  href: "/#experience",  icon: Briefcase },
  { label: "Skills",      href: "/#skills",      icon: Wrench },
  { label: "Projects",    href: "/#projects",    icon: FolderOpen },
  { label: "Open Source", href: "/#open-source", icon: GitMerge },
  { label: "Blogs",       href: "/#blogs",       icon: BookOpen },
  { label: "Stories",     href: "/#stories",     icon: Library },
  { label: "Travels",     href: "/#travels",     icon: Earth },
  { label: "Contact",     href: "/#contact",     icon: Mail },
] as const;

const Path = (props: ComponentProps<typeof motion.path>) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
);

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { playClick } = useAudioFeedback();

  // Scroll the drawer's link region rather than the page behind it. Restore the
  // previous inline value so closing this menu does not undo another scroll lock.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      // Escape uses the same state transition as the close button, including
      // effect cleanup that restores page scrolling.
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    // This must match Tailwind's xl:hidden breakpoint. CSS hiding alone would
    // leave an open drawer's body lock active after resizing to desktop.
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    playClick();
    setIsOpen(false);
    const id = href.replace("/#", "");
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      // Wait for drawer exit animation to almost finish before scrolling
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  return (
    <div className="xl:hidden">
      {/* Menu Toggle Button (Morphing) */}
      <button
        type="button"
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="fixed right-4 top-3 z-[70] flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition active:scale-95 hover:bg-background/50 hover:text-foreground"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" className="text-foreground">
          <Path
            variants={{
              closed: { d: "M 4 6 L 20 6" },
              open: { d: "M 6 6 L 18 18" }
            }}
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
          <Path
            d="M 4 12 L 20 12"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          <Path
            variants={{
              closed: { d: "M 4 18 L 20 18" },
              open: { d: "M 6 18 L 18 6" }
            }}
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
        </svg>
      </button>

      {/* Full-screen Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.2, duration: 0.3 } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[65] flex h-dvh flex-col bg-background/95 backdrop-blur-3xl px-5 py-4 sm:px-6 sm:py-5"
          >
            {/* This slot cannot shrink: the fixed close button must never cover
                the first link, including in a short landscape viewport. */}
            <div className="h-11 shrink-0" />

            {/* flex-1 takes the space left between header and controls. min-h-0
                lets it become smaller than its contents, which enables scrolling. */}
            <nav aria-label="Primary" className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain">
              {/* Center when links fit; otherwise this inner wrapper grows to
                  their natural height so the first link stays scroll-accessible. */}
              <div className="flex min-h-full flex-col items-end justify-center gap-1 py-2 pr-2 sm:gap-1.5 sm:pr-4">
                {nav.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      className="shrink-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, transition: { delay: 0 } }}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => handleLinkClick(e, item.href)}
                        // Smaller type and icons reduce clutter, while the row
                        // retains a 44px minimum touch target independently.
                        className="group flex min-h-11 items-center gap-3 text-2xl sm:text-3xl font-serif text-muted transition hover:text-foreground active:scale-95"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-edge bg-surface transition-colors group-hover:border-edge-strong">
                          <Icon className="size-4.5 text-faint transition-colors group-hover:text-foreground" strokeWidth={1.5} />
                        </span>
                        <span className="tracking-tight">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* A separate, nonshrinking footer keeps both reading controls
                visible while the destinations above scroll. Padding separates
                the final link from these independent touch targets. */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { delay: 0 } }}
              transition={{
                duration: 0.5,
                delay: nav.length * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex w-full shrink-0 items-center justify-between pt-3"
            >
              <div className="font-mono text-[10px] tracking-widest text-faint opacity-50 select-none">
                r4khul
              </div>
              <div className="flex items-center gap-2">
                <AudioToggle 
                  className="flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition active:scale-95 hover:bg-background/50 hover:text-foreground"
                  iconClassName="relative size-5"
                />
                <ThemeToggle 
                  className="flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition active:scale-95 hover:bg-background/50 hover:text-foreground"
                  iconClassName="relative size-5"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
