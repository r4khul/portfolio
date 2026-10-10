"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";

/**
 * Tiny hand-drawn glyphs that give each city in a sentence a little life.
 * Pure SVG + CSS (transform/opacity only); motion lives in globals.css under
 * "TRAVEL ATLAS - city glyphs". Hover plays them on desktop; on touch screens
 * they play once as they scroll into view.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Chennai: the Marina sun climbing over rolling waves. */
function Waves() {
  return (
    <svg viewBox="0 0 16 16" className="glyph glyph--waves" aria-hidden>
      <circle className="glyph-sun" cx="8" cy="9" r="2.6" {...stroke} />
      <g className="glyph-sea">
        <path
          className="glyph-wave"
          d="M-4 11.5c1.2 0 1.2-1 2.4-1s1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1"
          {...stroke}
        />
        <path
          className="glyph-wave glyph-wave--slow"
          d="M-4 14.2c1.2 0 1.2-1 2.4-1s1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1"
          {...stroke}
          strokeOpacity={0.55}
        />
      </g>
    </svg>
  );
}

/** Nagercoil: a coconut palm from the southern groves, swaying. */
function Palm() {
  return (
    <svg viewBox="0 0 16 16" className="glyph glyph--palm" aria-hidden>
      <path d="M8.2 15c-.5-2.9-.3-5.8 1-8.3" {...stroke} />
      <path d="M5 15h6.5" {...stroke} strokeOpacity={0.55} />
      <g className="glyph-fronds">
        <path d="M9.2 6.7C7.8 5.1 5.6 4.7 3.8 5.4" {...stroke} />
        <path d="M9.2 6.7c.3-2 1.8-3.4 3.9-3.8" {...stroke} />
        <path d="M9.2 6.7c1.9-.7 4 0 5.2 1.6" {...stroke} />
        <path d="M9.2 6.7c-1-1.9-.8-3.8.4-5.1" {...stroke} />
        <path d="M9.2 6.7C7.6 7 6.4 8.3 6.1 9.9" {...stroke} />
      </g>
    </svg>
  );
}

/** Bangalore: a traffic light that is, mostly, red. */
function TrafficLight() {
  return (
    <svg viewBox="0 0 16 16" className="glyph glyph--traffic" aria-hidden>
      <rect x="5.4" y="1.2" width="5.2" height="11.2" rx="2.6" {...stroke} />
      <path d="M8 12.4V15" {...stroke} />
      <circle className="glyph-lamp glyph-lamp--red" cx="8" cy="3.9" r="1.15" />
      <circle className="glyph-lamp glyph-lamp--amber" cx="8" cy="6.8" r="1.15" />
      <circle className="glyph-lamp glyph-lamp--green" cx="8" cy="9.7" r="1.15" />
    </svg>
  );
}

/** Fallback: a pin that hops. */
function Pin() {
  return (
    <svg viewBox="0 0 16 16" className="glyph glyph--pin" aria-hidden>
      <g className="glyph-pin">
        <path d="M8 13.6s4-3.6 4-6.8a4 4 0 0 0-8 0c0 3.2 4 6.8 4 6.8z" {...stroke} />
        <circle cx="8" cy="6.8" r="1.4" {...stroke} />
      </g>
    </svg>
  );
}

const glyphs: Record<string, () => ReactNode> = {
  chennai: Waves,
  nagercoil: Palm,
  bangalore: TrafficLight,
};

export function CityGlyph({ id }: { id: string }) {
  const G = glyphs[id] ?? Pin;
  return <G />;
}

/** Plays the glyph once when it scrolls into view on touch devices. */
function useTouchReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-live");
        timer = setTimeout(() => el.classList.remove("is-live"), 2600);
        io.disconnect();
      },
      { threshold: 1 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);
  return ref;
}

const tokenClass =
  "city-token group/token relative inline-flex cursor-pointer items-baseline gap-[0.28em] whitespace-nowrap text-foreground transition-colors duration-200 hover:text-[#2f80d1] focus-visible:text-[#2f80d1] dark:hover:text-[#87bbea] dark:focus-visible:text-[#87bbea]";

function TokenBody({ id, children }: { id: string; children: ReactNode }) {
  return (
    <>
      <span className="glyph-box relative top-[0.12em] inline-flex size-[1.05em] shrink-0 text-faint transition-colors duration-200 group-hover/token:text-current">
        <CityGlyph id={id} />
      </span>
      <span className="underline decoration-edge-strong decoration-dotted underline-offset-[5px] transition-[text-decoration-color] group-hover/token:decoration-current">
        {children}
      </span>
    </>
  );
}

/** Inline city that links to it on /travels. */
export function CityLink({ id, children, onClick }: { id: string; children: ReactNode; onClick?: () => void }) {
  const ref = useTouchReveal<HTMLAnchorElement>();
  return (
    <Link ref={ref} href={`/travels?place=${id}`} onClick={onClick} className={tokenClass}>
      <TokenBody id={id}>{children}</TokenBody>
    </Link>
  );
}

/** Inline city that runs an action (e.g. focus it on the map). */
export function CityButton({
  id,
  children,
  onClick,
  onHover,
}: {
  id: string;
  children: ReactNode;
  onClick: () => void;
  onHover?: (on: boolean) => void;
}) {
  const ref = useTouchReveal<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={tokenClass}
    >
      <TokenBody id={id}>{children}</TokenBody>
    </button>
  );
}
