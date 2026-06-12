"use client";

import { useState, useEffect, ComponentProps } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { User, Briefcase, FolderOpen, Wrench, GitMerge, BookOpen, Mail } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

const nav = [
  { label: "About",       href: "/#about",       icon: User },
  { label: "Experience",  href: "/#experience",  icon: Briefcase },
  { label: "Skills",      href: "/#skills",      icon: Wrench },
  { label: "Projects",    href: "/#projects",    icon: FolderOpen },
  { label: "Open Source", href: "/#open-source", icon: GitMerge },
  { label: "Blogs",       href: "/#blogs",       icon: BookOpen },
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

  // Lock body scroll when drawer is open
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
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="fixed right-4 top-3 z-60 flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition active:scale-95 hover:bg-background/50 hover:text-foreground"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.2, duration: 0.3 } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-3xl px-6 py-6"
          >
            {/* Top spacing to account for fixed toggle button height */}
            <div className="h-11" />

            {/* Nav Items List (Right Aligned) */}
            <div className="flex flex-1 flex-col items-end justify-center gap-6 sm:gap-8 pr-4 sm:pr-10 w-full">
              {nav.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
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
                      className="group flex items-center gap-4 text-4xl sm:text-5xl font-serif text-muted transition hover:text-foreground active:scale-95"
                    >
                      <span className="flex size-12 sm:size-14 items-center justify-center rounded-full border border-edge bg-surface transition-colors group-hover:border-edge-strong">
                        <Icon className="size-5 sm:size-6 text-faint transition-colors group-hover:text-foreground" strokeWidth={1.5} />
                      </span>
                      <span className="tracking-tight">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer / Bottom actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { delay: 0 } }}
              transition={{
                duration: 0.5,
                delay: nav.length * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center justify-between w-full mt-auto"
            >
              <div className="font-mono text-[10px] tracking-widest text-faint opacity-50 select-none">
                r4khul
              </div>
              <ThemeToggle 
                className="flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition active:scale-95 hover:bg-background/50 hover:text-foreground"
                iconClassName="relative size-5"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
