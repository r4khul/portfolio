"use client";

import { useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { nowPlace, places } from "@/data/travel";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import { useAtlas } from "./use-atlas";
import { CityGlyph, useIdleWhileVisible } from "./city-glyphs";

const stateCount = new Set(places.map((p) => p.state)).size;

/**
 * A quiet, living thumbnail of the atlas for the home page.
 * The whole card is a door into /travels.
 */
export function AtlasPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  useIdleWhileVisible(pillRef);
  const { playClick } = useAudioFeedback();
  const { ready, failed } = useAtlas({
    stageRef,
    canvasRef,
    options: { interactive: false, maxLabels: 4 },
    onReady: (engine) => engine.setInsets({ top: 18, right: 18, bottom: 18, left: 18 }),
  });

  if (failed) return null;

  return (
    <Link
      href="/travels"
      onClick={playClick}
      className="tactile group block overflow-hidden rounded-xl p-1.5 transition hover:-translate-y-0.5"
      aria-label="Open the travel atlas"
    >
      <div
        ref={stageRef}
        className="relative aspect-[4/3] overflow-hidden rounded-[9px] bg-background sm:aspect-[2/1]"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          role="img"
          aria-label={`Map of places I've been: ${places.map((p) => p.name).join(", ")}`}
        />
        {/* live status, same family as the "Building @ Ente" badge */}
        {nowPlace && (
          <div ref={pillRef} className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-edge-strong bg-background/90 py-1 pr-2.5 pl-2 font-mono text-[10px] tracking-widest text-muted uppercase">
            <span className="inline-flex size-3.5 text-[#2f80d1] dark:text-[#87bbea]">
              <CityGlyph id={nowPlace.id} />
            </span>
            <span>
              Now <span className="text-faint">·</span> <span className="text-foreground">{nowPlace.name}</span>
            </span>
          </div>
        )}
        <AnimatePresence>
          {!ready && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="dotgrid absolute inset-0"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4 px-2.5 pt-3 pb-2">
        <p className="text-[13.5px] text-muted">
          <span className="text-foreground">{places.length} places</span>
          <span className="mx-1.5 text-faint">·</span>
          {stateCount} states, one long way from done
        </p>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[12px] text-faint transition-colors group-hover:text-foreground">
          Explore
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
