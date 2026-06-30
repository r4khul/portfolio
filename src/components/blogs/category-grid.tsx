"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowUpRight, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { Blog } from "@/lib/blogs";
import { getCategorySlug } from "@/lib/blog-utils";
import { getReadingTime } from "@/lib/reading-time";
import { categoryMeta } from "@/data/categories";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

type CategoryGroup = {
  name: string;
  slug: string;
  cover: string | undefined;
  description: string;
  blogs: Blog[];
};

function CategoryTotalViews({ slugs }: { slugs: string[] }) {
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

  if (total === null) return null;

  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-faint">
      <Eye className="size-3 shrink-0" />
      {total.toLocaleString()}
    </span>
  );
}

export function buildCategories(blogs: Blog[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>();
  for (const blog of blogs) {
    const slug = getCategorySlug(blog.category);
    if (!map.has(slug)) {
      map.set(slug, {
        name: blog.category,
        slug,
        cover: blog.cover,
        description: categoryMeta[slug]?.description ?? "",
        blogs: [],
      });
    }
    map.get(slug)!.blogs.push(blog);
  }
  map.forEach((cat) => {
    cat.blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  return [...map.values()];
}

function PostSlide({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group/post flex-none w-[75%] sm:w-[210px] rounded-lg border border-edge bg-background p-3 transition-colors hover:bg-surface"
      style={{ scrollSnapAlign: "start" }}
    >
      {typeof blog.number === "number" && (
        <span className="inline-flex items-center rounded-full border border-edge bg-surface px-1.5 py-0.5 font-mono text-[8px] font-medium text-muted">
          #{blog.number}
        </span>
      )}
      <h4 className="mt-1.5 text-[12px] font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
        {blog.title}
      </h4>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted line-clamp-2">
        {blog.description}
      </p>
      <div className="mt-2.5 flex items-center gap-1 font-mono text-[9px] uppercase text-faint">
        <Calendar className="size-2.5 shrink-0" />
        {new Date(blog.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
        <span className="opacity-50 px-0.5">·</span>
        {getReadingTime(blog.content)}
      </div>
    </Link>
  );
}

function CategoryCard({ category, priority = false }: { category: CategoryGroup; priority?: boolean }) {
  const { playClick } = useAudioFeedback();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 12
      : 220;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-edge bg-surface">
      {/* Banner header */}
      <Link
        href={`/blogs/category/${category.slug}`}
        onClick={playClick}
        className="group/header relative block aspect-[16/6] overflow-hidden border-b border-edge"
      >
        {category.cover ? (
          <Image
            src={category.cover}
            alt={category.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover/header:scale-[1.03]"
          />
        ) : (
          <div className="dotgrid size-full" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute right-3 bottom-3">
          <span className="rounded-full border border-white/25 bg-black/30 px-2 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-sm">
            {category.blogs.length} {category.blogs.length === 1 ? "post" : "posts"}
          </span>
        </div>
        <div className="absolute left-3 top-3 flex size-6 items-center justify-center rounded-full border border-white/20 bg-black/30 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/header:opacity-100">
          <ArrowUpRight className="size-3 text-white" />
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[20px] leading-tight tracking-tight text-foreground">
            {category.name}
          </h3>
          <CategoryTotalViews slugs={category.blogs.map((b) => b.slug)} />
        </div>
        {category.description && (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
            {category.description}
          </p>
        )}

        {/* Post carousel */}
        <div className="group/carousel relative mt-4">
          <div
            ref={scrollRef}
            className="scrollbar-none flex gap-3 overflow-x-auto pb-0.5"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {category.blogs.map((blog) => (
              <PostSlide key={blog.slug} blog={blog} />
            ))}
          </div>

          {category.blogs.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute -left-2.5 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-edge bg-surface text-muted shadow-sm transition-all hover:text-foreground opacity-0 group-hover/carousel:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute -right-2.5 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-edge bg-surface text-muted shadow-sm transition-all hover:text-foreground opacity-0 group-hover/carousel:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-edge pt-3">
          <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">
            latest series
          </span>
          <Link
            href={`/blogs/category/${category.slug}`}
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

export function CategoryGrid({ blogs }: { blogs: Blog[] }) {
  const categories = buildCategories(blogs);

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
      {categories.map((cat, i) => (
        <Reveal key={cat.slug} delay={i * 0.08}>
          <CategoryCard category={cat} priority={i === 0} />
        </Reveal>
      ))}
    </div>
  );
}
