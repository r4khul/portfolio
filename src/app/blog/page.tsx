import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import { getBlogs, getReadingTime } from "@/lib/blogs";
import { profile } from "@/data/profile";
import { BackButton } from "@/components/project/back-button";
import { ViewCounter } from "@/components/blog/view-counter";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: `Blog — ${profile.name}`,
    description:
      "Notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.",
    url: `${profile.url}/blog`,
  },
};

export default function BlogPage() {
  const blogs = getBlogs();

  return (
    <main>
      <div className="bleed-line px-4 py-8 sm:px-8">
        <BackButton href="/#blogs" label="home" />
        <header className="mt-6">
          <h1 className="font-serif text-[38px] leading-none tracking-tight sm:text-[48px]">
            Blog
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            Notes on system architecture, offline-first mobile engineering, clean
            interfaces, and lessons learned in production.
          </p>
        </header>
      </div>

      <div className="bleed-line px-4 pt-8 pb-14 sm:px-8 sm:pt-10">
        {blogs.length === 0 ? (
          <div className="relative overflow-hidden rounded-lg border border-edge bg-surface p-8 sm:p-10">
            <div className="dotgrid absolute inset-0 opacity-[0.25]" aria-hidden />
            <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto py-6">
              <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
                Serious writing on the way.
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-sans">
                Preparing a collection of notes on system architecture,
                offline-first mobile engineering, clean interfaces, and lessons
                learned in production.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="group flex flex-col gap-5 bg-background p-4 transition-colors hover:bg-surface md:flex-row md:items-stretch md:justify-between sm:p-5"
              >
                {/* Content Column (72%) */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14.5px] font-semibold tracking-tight text-foreground">
                        {blog.title}
                      </h2>
                      {typeof blog.number === "number" && (
                        <span className="inline-flex items-center rounded-full border border-edge bg-surface px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted">
                          #{blog.number}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-faint uppercase">
                      <Calendar className="size-3" />
                      {new Date(blog.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {blog.category && ` · ${blog.category}`}
                      <span className="px-0.5 opacity-55">·</span>
                      <span>{getReadingTime(blog.content)}</span>
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted line-clamp-2 sm:line-clamp-3">
                      {blog.description}
                    </p>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <ul
                      className="mt-3 flex flex-wrap gap-1.5"
                      aria-label="Tags"
                    >
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
                      <img
                        src={blog.cover}
                        alt={`${blog.title} cover`}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
