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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
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

      {/* Post list */}
      <div className="bleed-line px-4 pt-2 pb-14 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge">
          {cat.blogs.map((blog) => (
            <Link
              key={blog.slug}
              href={`/blogs/${blog.slug}`}
              className="group flex flex-col gap-5 bg-background p-4 transition-colors hover:bg-surface md:flex-row md:items-stretch md:justify-between sm:p-5"
            >
              {/* Content */}
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
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] uppercase tracking-wide text-faint">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3 shrink-0" />
                      {new Date(blog.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
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
                    {blog.tags.slice(0, 4).map((tag) => (
                      <li
                        key={tag}
                        className="rounded border border-edge bg-surface/30 px-1.5 py-0.5 font-mono text-[10px] text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                    {blog.tags.length > 4 && (
                      <li className="px-1 py-0.5 font-mono text-[10px] text-faint">
                        +{blog.tags.length - 4}
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Cover thumbnail */}
              <div className="relative shrink-0 md:w-[28%]">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-edge bg-surface md:aspect-[16/10]">
                  {blog.cover ? (
                    <Image
                      src={blog.cover}
                      alt={`${blog.title} cover`}
                      fill
                      sizes="(min-width: 768px) 215px, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="dotgrid size-full opacity-30" />
                  )}
                  <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border border-edge-strong/10 bg-background/80 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                    <ArrowUpRight className="size-3 text-foreground" />
                  </div>
                  <div className="absolute bottom-2 left-2 z-10">
                    <ViewCounter
                      slug={blog.slug}
                      trackView={false}
                      variant="chip"
                      showIcon={false}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
