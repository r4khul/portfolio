"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, PenTool } from "lucide-react";
import type { Story } from "@/lib/stories";
import { Section } from "@/components/ui/section";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import { StorySummaryGrid } from "@/components/stories/story-summary-card";

interface StoriesSectionProps {
  stories: Story[];
}

export const StoriesSection = memo(({ stories }: StoriesSectionProps) => {
  const { playClick } = useAudioFeedback();

  if (stories.length === 0) {
    return (
      <Section
        id="stories"
        index="07"
        title="Stories"
        action={
          <Link
            href="/stories"
            onClick={playClick}
            className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
          >
            all chapters
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      >
        <div className="relative overflow-hidden rounded-lg border border-edge bg-surface p-8 sm:p-10">
          <div className="dotgrid absolute inset-0 opacity-[0.25]" aria-hidden />
          <div className="relative z-10 mx-auto flex max-w-md flex-col items-center py-6 text-center">
            <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
              Stories are on the way.
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-sans">
              Preparing a collection of fiction, fragments, and serialized tales
              told one chapter at a time.
            </p>
            <div className="mt-6 flex items-center gap-1.5 select-none font-mono text-[11px] text-faint">
              <PenTool className="size-3.5" />
              <span>Stay tuned</span>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="stories"
      index="07"
      title="Stories"
      action={
        <Link
          href="/stories"
          onClick={playClick}
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          all chapters
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      }
    >
      <StorySummaryGrid stories={stories} />
    </Section>
  );
});

StoriesSection.displayName = "StoriesSection";
