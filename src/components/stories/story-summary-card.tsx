"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Clock, Eye } from "lucide-react";
import { getReadingTimeMinutes } from "@/lib/reading-time";
import type { Story } from "@/lib/stories";
import { getCategorySlug } from "@/lib/blog-utils";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

type StoryGroup = {
  name: string;
  slug: string;
  cover?: string;
  description: string;
  stories: Story[];
};

function buildStoryGroups(stories: Story[]): StoryGroup[] {
  const map = new Map<string, StoryGroup>();
  for (const story of stories) {
    const slug = getCategorySlug(story.category);
    if (!map.has(slug)) {
      map.set(slug, {
        name: story.category,
        slug,
        cover: story.cover,
        description: "",
        stories: [],
      });
    }
    map.get(slug)!.stories.push(story);
  }
  map.forEach((group) => {
    group.stories.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
  });
  return [...map.values()];
}

function TotalViews({ slugs }: { slugs: string[] }) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    Promise.all(
      slugs.map((slug) =>
        fetch(`/api/views/${slug}`)
          .then((r) => (r.ok ? r.json() : { views: 0 }))
          .then((d) => (typeof d.views === "number" ? d.views : 0))
          .catch(() => 0)
      )
    ).then((counts) => setTotal(counts.reduce((a, b) => a + b, 0)));
  }, [slugs]);

  if (total === null) return <span className="text-faint">—</span>;

  return <span>{total.toLocaleString()}</span>;
}

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

export function StorySummaryCard({ group }: { group: StoryGroup }) {
  const { playClick } = useAudioFeedback();
  const totalChapters = group.stories.length;
  const totalMinutes = group.stories.reduce(
    (sum, s) => sum + getReadingTimeMinutes(s.content),
    0
  );
  const slugs = group.stories.map((s) => s.slug);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-edge bg-surface">
      <Link
        href={`/stories/category/${group.slug}`}
        onClick={playClick}
        className="group/header relative block aspect-[16/9] overflow-hidden border-b border-edge"
      >
        {group.cover ? (
          <Image
            src={group.cover}
            alt={group.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
            className="object-cover transition-transform duration-700 group-hover/header:scale-[1.03]"
          />
        ) : (
          <div className="dotgrid size-full" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute right-3 bottom-3">
          <span className="rounded-full border border-white/25 bg-black/30 px-2 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-sm">
            {totalChapters} {totalChapters === 1 ? "chapter" : "chapters"}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[20px] leading-tight tracking-tight text-foreground">
            {group.name}
          </h3>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <Eye className="size-3.5" />
            <TotalViews slugs={slugs} /> views
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
          {group.description || "A serialized story told one chapter at a time."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat
            icon={<BookOpen className="size-3.5" />}
            label="chapters"
            value={totalChapters}
          />
          <Stat
            icon={<Clock className="size-3.5" />}
            label="read time"
            value={`${totalMinutes} min`}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-edge pt-3">
          <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">
            serialized tale
          </span>
          <Link
            href={`/stories/category/${group.slug}`}
            onClick={playClick}
            className="group/link inline-flex items-center gap-1 font-mono text-[11px] text-muted transition-colors hover:text-foreground"
          >
            view all
            <ArrowUpRight className="size-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function StorySummaryGrid({ stories }: { stories: Story[] }) {
  const groups = buildStoryGroups(stories);

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
      {groups.map((group) => (
        <StorySummaryCard key={group.slug} group={group} />
      ))}
    </div>
  );
}
