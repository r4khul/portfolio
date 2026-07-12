import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowUpRight } from "lucide-react";
import { getBlogs, getCategorySlug, getReadingTime } from "@/lib/blogs";
import { profile } from "@/data/profile";
import { categoryMeta } from "@/data/categories";
import { BackButton } from "@/components/project/back-button";
import { ViewCounter } from "@/components/blogs/view-counter";

type Props = { params: Promise<{ slug: string }> };

function getCategoryData(slug: string) {
  const all = getBlogs();
  const blogs = all
    .filter((b) => getCategorySlug(b.category) === slug)
    .sort((a, b) => {
      if (typeof a.number === "number" && typeof b.number === "number") {
        return a.number - b.number;
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  if (blogs.length === 0) return null;
  const name = blogs[0].category;
  const cover = blogs.find((b) => b.cover)?.cover;
  const description = categoryMeta[slug]?.description ?? "";
  return { name, slug, cover, description, blogs };
}

export function generateStaticParams() {
  const all = getBlogs();
  const slugs = [...new Set(all.map((b) => getCategorySlug(b.category)))];
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryData(slug);
  if (!cat) return {};

  const title = cat.name;
  const description = cat.description || `All posts in ${cat.name}.`;
  const image = cat.cover ?? "/images/site/main-banner.png";

  return {
    title,
    description,
    alternates: { canonical: `/blogs/category/${slug}` },
    openGraph: {
      title: `${title} — ${profile.name}`,
      description,
      url: `${profile.url}/blogs/category/${slug}`,
      siteName: profile.name,
      locale: "en_US",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${profile.name}`,
      description,
      creator: "@r4khul",
      images: [image],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryData(slug);
  if (!cat) notFound();

  return (
    <main>
      {/* Banner */}
      <div className="relative h-[130px] overflow-hidden sm:h-[230px]">
        {cat.cover ? (
          <Image
            src={cat.cover}
            alt={cat.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="dotgrid size-full" aria-hidden />
        )}
      </div>

      {/* Header */}
      <div className="bleed-line px-4 py-8 sm:px-8">
        <BackButton href="/blogs" label="all posts" />
        <header className="mt-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            series
          </span>
          <h1 className="mt-2 font-serif text-[34px] leading-none tracking-tight sm:text-[44px]">
            {cat.name}
          </h1>
          {cat.description && (
            <p className="mt-3 max-w-prose text-[14.5px] leading-relaxed text-muted">
              {cat.description}
            </p>
          )}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-faint">
            {cat.blogs.length} {cat.blogs.length === 1 ? "post" : "posts"}
          </p>
        </header>
      </div>

      {/* Post grid */}
      <div className="bleed-line px-4 pt-2 pb-14 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {cat.blogs.map((blog) => (
            <Link
              key={blog.slug}
              href={`/blogs/${blog.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-edge bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[15.5px] font-semibold tracking-tight text-foreground transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {typeof blog.number === "number" && (
                      <span className="inline-flex items-center rounded-full border border-edge bg-background px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted">
                        #{blog.number}
                      </span>
                    )}
                    <ArrowUpRight className="size-3.5 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </div>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted line-clamp-3">
                  {blog.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-edge flex flex-col gap-2.5">
                {blog.tags && blog.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <li
                        key={tag}
                        className="rounded border border-edge bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between text-[10px] font-mono text-faint">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 shrink-0" />
                    {new Date(blog.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    <span className="opacity-55 mx-0.5">·</span>
                    <span>{getReadingTime(blog.content)}</span>
                  </span>
                  
                  <ViewCounter
                    slug={blog.slug}
                    trackView={false}
                    variant="chip"
                    showIcon={true}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
