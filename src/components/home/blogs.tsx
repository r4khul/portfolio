"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, PenTool } from "lucide-react";
import type { Blog } from "@/lib/blogs";
import { Section } from "@/components/ui/section";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import { CategoryGrid } from "@/components/blogs/category-grid";

interface BlogsSectionProps {
  blogs: Blog[];
}

export const BlogsSection = memo(({ blogs }: BlogsSectionProps) => {
  const { playClick } = useAudioFeedback();

  if (blogs.length === 0) {
    return (
      <Section
        id="blogs"
        index="06"
        title="Blogs"
        action={
          <Link
            href="/blogs"
            onClick={playClick}
            className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
          >
            all posts
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      >
        <div className="relative overflow-hidden rounded-lg border border-edge bg-surface p-8 sm:p-10">
          <div className="dotgrid absolute inset-0 opacity-[0.25]" aria-hidden />
          <div className="relative z-10 mx-auto flex max-w-md flex-col items-center py-6 text-center">
            <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
              Serious writing on the way.
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-sans">
              Preparing a collection of notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.
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
      id="blogs"
      index="06"
      title="Blogs"
      action={
        <Link
          href="/blogs"
          onClick={playClick}
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          all posts
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      }
    >
      <CategoryGrid blogs={blogs} />
    </Section>
  );
});

BlogsSection.displayName = "BlogsSection";
