import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { getBlog, getBlogs, getReadingTime, getSeriesNeighbors } from "@/lib/blogs";
import { profile } from "@/data/profile";
import { MdxContent } from "@/components/mdx-content";
import { BackButton } from "@/components/project/back-button";
import GithubSlugger from "github-slugger";
import { BlogToc } from "@/components/blogs/blog-toc";
import { BlogPostJsonLd } from "@/components/site/json-ld";
import { ViewCounter } from "@/components/blogs/view-counter";
import { SeriesNavigation } from "@/components/blogs/series-navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getBlogs().map((blog) => ({ slug: blog.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlog(slug);
  if (!blog) return {};

  return {
    title: blog.title,
    description: blog.description,
    alternates: {
      canonical: `/blogs/${slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      url: `${profile.url}/blogs/${slug}`,
      siteName: profile.name,
      locale: "en_US",
      publishedTime: blog.date,
      modifiedTime: blog.date,
      authors: [profile.name],
      section: blog.category,
      tags: blog.tags || [],
      images: blog.cover
        ? [
            {
              url: blog.cover,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : [
            {
              url: "/images/site/main-banner.avif",
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      creator: "@r4khul",
      images: blog.cover ? [blog.cover] : ["/images/site/main-banner.avif"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = getBlog(slug);
  if (!blog) notFound();

  const { prev, next } = getSeriesNeighbors(slug);

  const slugger = new GithubSlugger();
  const headings = Array.from(blog.content.matchAll(/^##\s+(.*)$/gm)).map(match => {
    const rawTitle = match[1].trim();
    const cleanTitle = rawTitle.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    return {
      title: cleanTitle,
      id: slugger.slug(cleanTitle)
    };
  });

  return (
    <main>
      <BlogToc headings={headings} />
      <BlogPostJsonLd blog={blog} />
      {/* Cover */}
      <div className="relative h-[141px] overflow-hidden sm:h-[246px]">
        {blog.cover ? (
          <Image
            src={blog.cover}
            alt={`${blog.title} cover`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        ) : (
          <div className="dotgrid size-full" aria-hidden />
        )}
      </div>

      <div className="bleed-line px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackButton href="/blogs" label="all posts" />
            {typeof blog.number === "number" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-edge bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                <span className="text-faint uppercase">{blog.category}</span>
                <span className="text-edge-strong">·</span>
                <span className="font-medium text-foreground">#{blog.number}</span>
              </span>
            )}
          </div>
          <ViewCounter slug={slug} trackView={true} variant="chip" />
        </div>

        <header className="mt-6">
          <h1 className="mt-3 font-serif text-[32px] leading-none tracking-tight sm:text-[40px]">
            {blog.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-mono text-faint">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {new Date(blog.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>·</span>
            <span>{getReadingTime(blog.content)}</span>
          </div>
          {blog.tags && blog.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
              {blog.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-edge bg-surface px-2 py-0.5 font-mono text-[11px] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>
      </div>

      <article className="bleed-line px-4 py-10 sm:px-8">
        <MdxContent source={blog.content} />
        <SeriesNavigation prev={prev} next={next} />
      </article>
    </main>
  );
}
