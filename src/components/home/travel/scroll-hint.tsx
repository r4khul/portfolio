"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { haptic } from "@/lib/haptics";

/**
 * A scroll container that tells you it scrolls without saying so:
 * - edges fade only where there's more content
 * - a hairline rail with a thumb shows where you are
 * - the first time it's seen, it nudges down and back once
 */
export function ScrollHint({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false, overflow: false });
  const [thumb, setThumb] = useState({ size: 1, offset: 0 });
  const frame = useRef(0);
  const nudging = useRef(false);
  const wasAtEnd = useRef({ top: true, bottom: false });

  const measure = useCallback(() => {
    frame.current = 0;
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight > clientHeight + 2;
    const top = overflow && scrollTop > 2;
    const bottom = overflow && scrollTop + clientHeight < scrollHeight - 2;
    // a small bump when a real scroll reaches either end
    if (overflow && !nudging.current) {
      const atTop = !top;
      const atBottom = !bottom;
      if ((atTop && !wasAtEnd.current.top) || (atBottom && !wasAtEnd.current.bottom)) haptic("edge");
      wasAtEnd.current = { top: atTop, bottom: atBottom };
    }
    setEdges({ overflow, top, bottom });
    if (overflow) {
      const size = clientHeight / scrollHeight;
      setThumb({ size, offset: (scrollTop / (scrollHeight - clientHeight)) * (1 - size) });
    }
  }, []);

  const schedule = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(measure);
  }, [measure]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    // one gentle nudge the first time the list is actually visible
    let nudged = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (nudged || reduce || !e.isIntersecting || e.intersectionRect.height < 40) return;
        if (el.scrollHeight <= el.clientHeight + 2 || el.scrollTop > 0) return;
        nudged = true;
        t1 = setTimeout(() => {
          nudging.current = true;
          el.scrollTo({ top: 36, behavior: "smooth" });
          t2 = setTimeout(() => {
            el.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => (nudging.current = false), 600);
          }, 520);
        }, 900);
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      cancelAnimationFrame(frame.current);
    };
  }, [measure, schedule]);

  const top = edges.top ? "18px" : "0px";
  const bottom = edges.bottom ? "36px" : "0px";
  const mask = `linear-gradient(to bottom, transparent, black ${top}, black calc(100% - ${bottom}), transparent)`;

  return (
    <div className="group/scroll relative">
      <div
        ref={ref}
        onScroll={schedule}
        className={`overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <div>{children}</div>
      </div>
      {edges.overflow && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-2 right-0 bottom-2 w-[2px] rounded-full bg-edge transition-[width] duration-200 group-hover/scroll:w-[3px]"
        >
          <div
            className="absolute inset-x-0 rounded-full bg-foreground/35 transition-[background-color] duration-200 group-hover/scroll:bg-foreground/60"
            style={{ height: `${thumb.size * 100}%`, top: `${thumb.offset * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
