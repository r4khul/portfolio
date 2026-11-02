import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PosterArt } from "./memory-poster";

export function SlideCard() {
  return (
    <Link
      href="/slides/game-console-and-ice-tubes"
      className="group block overflow-hidden rounded-lg border border-edge bg-surface text-foreground transition-colors hover:border-edge-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      <div className="relative aspect-[2.4] overflow-hidden border-b border-edge bg-background" aria-hidden="true">
        {/* the memory's poster, cropped to the lamp, the ride home and the console */}
        <svg
          viewBox="40 76 1160 483"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full text-foreground transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <PosterArt />
        </svg>
      </div>
      <div className="p-5 sm:p-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
        Core memory · 01
      </p>
      <h3 className="mt-4 max-w-[25ch] font-serif text-[28px] leading-[1.15] tracking-tight sm:text-[34px]">
        Game Console <em>&amp; Ice Tubes</em>
      </h3>
      <p className="mt-3 max-w-[49ch] text-[14px] leading-[1.8] text-muted">
        A bicycle ride, a console I never bought, and a kind of love I only
        understood later.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-edge pt-4">
        <span className="font-mono text-[10px] leading-relaxed text-faint">
          Nagercoil <span className="px-1.5" aria-hidden="true">·</span> 7 min
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted transition-colors group-hover:text-foreground">
          read memory
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" />
        </span>
      </div>
      </div>
    </Link>
  );
}
