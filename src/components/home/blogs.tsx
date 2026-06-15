"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowUpRight, PenTool } from "lucide-react";
import type { Blog } from "@/lib/blogs";
import { getReadingTime } from "@/lib/reading-time";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import { ViewCounter } from "@/components/blogs/view-counter";

interface BlogsSectionProps {
  blogs: Blog[];
}

export const BlogsSection = memo(({ blogs }: BlogsSectionProps) => {
  const { playClick } = useAudioFeedback();
  const latest = blogs.slice(0, 3);

  if (blogs.length === 0) {
    return (
      <Section id="blogs" index="06" title="Blogs">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg border border-edge bg-surface p-8 sm:p-10">
            <div className="dotgrid absolute inset-0 opacity-[0.25]" aria-hidden />
            <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto py-6">
              <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
                Serious writing on the way.
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-sans">
                Preparing a collection of notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-[11px] font-mono text-faint select-none">
                <PenTool className="size-3.5" />
                <span>Stay tuned</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    );
  }

  return (
    <Section id="blogs" index="06" title="Blogs">
      <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge">
        {latest.map((blog, i) => (
          <Reveal key={blog.slug} delay={i * 0.06} className="bg-background">
            <Link
              href={`/blogs/${blog.slug}`}
              onClick={playClick}
              className="group flex flex-col gap-5 p-4 transition-colors hover:bg-surface md:flex-row md:items-stretch md:justify-between sm:p-5"
            >
              {/* Content Column (72%) */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14.5px] font-semibold tracking-tight text-foreground">
                      {blog.title}
                    </h3>
                    {typeof blog.number === "number" && (
                      <span className="inline-flex items-center rounded-full border border-edge bg-surface px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted">
                        #{blog.number}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] tracking-wide text-faint uppercase">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3 shrink-0" />
                      {new Date(blog.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {blog.category && <span>· {blog.category}</span>}
                    </span>
                    <span className="opacity-55">·</span>
                    <span>{getReadingTime(blog.content)}</span>
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted line-clamp-2 sm:line-clamp-3">
                    {blog.description}
                  </p>
                </div>
                {blog.tags && blog.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <li
                        key={tag}
                        className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px] text-muted bg-surface/30"
                      >
                        {tag}
                      </li>
                    ))}
                    {blog.tags.length > 3 && (
                      <li className="px-1 py-0.5 font-mono text-[10px] text-faint">
                        +{blog.tags.length - 3}
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Media Column (28%) */}
              <div className="relative md:w-[28%] shrink-0">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-edge bg-surface md:aspect-[16/10]">
                  {blog.cover ? (
                    <Image
                      src={blog.cover}
                      alt={`${blog.title} cover`}
                      fill
                      sizes="(min-width: 768px) 215px, 100vw"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="dotgrid size-full opacity-30" />
                  )}
                  {/* Top-Right Link Arrow */}
                  <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border border-edge-strong/10 bg-background/80 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 shadow-sm">
                    <ArrowUpRight className="size-3 text-foreground" />
                  </div>
                  {/* Bottom-Left View Counter Chip Overlay */}
                  <div className="absolute left-2 bottom-2 z-10">
                    <ViewCounter slug={blog.slug} trackView={false} variant="chip" showIcon={false} />
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {blogs.length > 3 && (
        <Reveal delay={0.2}>
          <div className="mt-6 flex justify-end">
            <Link
              href="/blogs"
              onClick={playClick}
              className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
            >
              all posts
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>
      )}
    </Section>
  );
});

BlogsSection.displayName = "BlogsSection";
