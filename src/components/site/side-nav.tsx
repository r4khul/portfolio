"use client";

import { memo, useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Briefcase,
  FolderOpen,
  Wrench,
  GitMerge,
  BookOpen,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { AudioToggle } from "./audio-toggle";
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

const SECTION_IDS = nav.map((n) => n.href.replace("/#", ""));

export const SideNav = memo(() => {
  const pathname = usePathname();
  const [active, setActive] = useState<string>("");
  const { playClick } = useAudioFeedback();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      playClick();
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Optimistically set active on click — observer will correct if needed
        setActive(id);
      }
    },
    [playClick],
  );

  useEffect(() => {
    if (pathname !== "/") {
      if (pathname.startsWith("/projects/")) {
        setActive("projects");
      } else {
        setActive("");
      }
      return;
    }

    // Use scroll position to detect active section — more reliable than
    // IntersectionObserver with aggressive rootMargin for terminal sections.
    const sectionEls = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sectionEls.length === 0) return;

    let rafId = 0;
    let scheduled = false;

    const update = () => {
      scheduled = false;
      const scrollY = window.scrollY + window.innerHeight * 0.3;

      // Find the last section whose top is above the 30% viewport mark
      let current = sectionEls[0].id;
      for (const el of sectionEls) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollY) current = el.id;
      }

      // Near-bottom special case: if we're within 80px of the page bottom, 
      // highlight the last section regardless
      const nearBottom =
         window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80;
      if (nearBottom) current = sectionEls[sectionEls.length - 1].id;

      setActive(current);
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(update);
    };

    // Run once immediately to set initial state
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return (
    <aside aria-label="Site navigation" className="side-nav">
      {/* Vertical nav list — wheel-picker style */}
      <nav className="side-nav__list" aria-label="Primary">
        {nav.map((item) => {
          const id = item.href.replace("/#", "");
          const isActive = active === id;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className={`side-nav__item ${isActive ? "side-nav__item--active" : "side-nav__item--idle"}`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Icon — replaces the horizontal pip */}
              <span className={`side-nav__icon ${isActive ? "side-nav__icon--active" : ""}`}>
                <Icon strokeWidth={1.5} />
              </span>

              {/* Label in Instrument Serif */}
              <span className={`side-nav__label ${isActive ? "side-nav__label--active" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="side-nav__toggle">
        <ThemeToggle />
      </div>

      {/* Audio toggle */}
      <div className="side-nav__toggle">
        <AudioToggle />
      </div>

      {/* Rotated brand moniker */}
      <div className="side-nav__brand" aria-hidden>
        r4khul
      </div>
    </aside>
  );
});

SideNav.displayName = "SideNav";
