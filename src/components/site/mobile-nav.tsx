"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, Briefcase, FolderOpen, Wrench, GitMerge, Mail } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { label: "About",       href: "/#about",       icon: User },
  { label: "Experience",  href: "/#experience",  icon: Briefcase },
  { label: "Skills",      href: "/#skills",      icon: Wrench },
  { label: "Projects",    href: "/#projects",    icon: FolderOpen },
  { label: "Open Source", href: "/#open-source", icon: GitMerge },
  { label: "Contact",     href: "/#contact",     icon: Mail },
] as const;

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

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
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-3 z-40 flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition-all active:scale-95 hover:bg-background/50 hover:text-foreground"
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
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
            {/* Header / Top actions inside drawer */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition-all active:scale-95 hover:bg-background/50 hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Nav Items List */}
            <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:gap-8">
              {nav.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { delay: 0 } }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className="group flex items-center gap-4 text-4xl sm:text-5xl font-serif text-muted transition-all hover:text-foreground active:scale-95"
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
              <div className="font-mono text-[10px] tracking-widest text-faint opacity-50 uppercase select-none">
                r4khul
              </div>
              <ThemeToggle 
                className="flex size-11 items-center justify-center rounded-full text-foreground/80 backdrop-blur-xl bg-background/30 border border-edge/30 shadow-sm transition-all active:scale-95 hover:bg-background/50 hover:text-foreground"
                iconClassName="relative size-5"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
