import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, GalleryHorizontal, MapPin } from "lucide-react";
import { memories, type Memory } from "@/data/memories";
import { MoviePosterArt } from "./first-movie-poster";
import { PosterArt } from "./memory-poster";

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-7 items-center justify-center rounded-full border border-edge bg-surface text-muted">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-faint">
          {label}
        </span>
        <span className="text-[13px] font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}

/** Each memory's poster, and the crop of it its card shows. */
const POSTERS: Record<string, { Art: ComponentType; crop: string }> = {
  // the lamp, the ride home and the console
  "game-console-and-ice-tubes": { Art: PosterArt, crop: "170 22 1030 579" },
  // the ride home, the ticket and the burger
  "first-movie-and-a-burger": { Art: MoviePosterArt, crop: "300 120 860 484" },
};

export function SlideCard({ memory }: { memory: Memory }) {
  const scenes = memory.scenes.length;
  const { Art, crop } = POSTERS[memory.slug];

  return (
    <Link
      href={`/slides/${memory.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-edge bg-surface text-foreground transition-colors hover:border-edge-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-edge bg-background">
        {/* the memory's poster, cropped */}
        <svg
          viewBox={crop}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full text-foreground transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <Art />
        </svg>
        <div className="absolute right-3 bottom-3">
          <span className="rounded-full border border-edge bg-background/70 px-2 py-0.5 font-mono text-[9px] text-muted backdrop-blur-sm">
            {scenes} scenes
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[20px] leading-tight tracking-tight">
            {memory.title[0]} <em>{memory.title[1]}</em>
          </h3>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted">
            <MapPin className="size-3.5" aria-hidden="true" />
            {memory.place}
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
          {memory.summary}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat
            icon={<GalleryHorizontal className="size-3.5" aria-hidden="true" />}
            label="scenes"
            value={scenes}
          />
          <Stat
            icon={<Clock className="size-3.5" aria-hidden="true" />}
            label="read time"
            value={`${memory.minutes} min`}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-edge pt-3">
          <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">
            core memory · {memory.number}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted transition-colors group-hover:text-foreground">
            read memory
            <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SlideGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
      {memories.map((memory) => <SlideCard key={memory.slug} memory={memory} />)}
    </div>
  );
}
