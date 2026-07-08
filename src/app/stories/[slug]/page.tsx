import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { getStory, getStories, getReadingTime, getSeriesNeighbors } from "@/lib/stories";
import { profile } from "@/data/profile";
import { MdxContent } from "@/components/mdx-content";
import { BackButton } from "@/components/project/back-button";
import GithubSlugger from "github-slugger";
import { BlogToc } from "@/components/blogs/blog-toc";
import { StoryPostJsonLd } from "@/components/site/json-ld";
import { ViewCounter } from "@/components/blogs/view-counter";
import { SeriesNavigation } from "@/components/blogs/series-navigation";
import { ShareButton } from "@/components/blogs/share-button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getStories().map((story) => ({ slug: story.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};

  return {
    title: story.title,
    description: story.description,
    alternates: {
      canonical: `/stories/${slug}`,
    },
    openGraph: {
      title: story.title,
      description: story.description,
      type: "article",
      url: `${profile.url}/stories/${slug}`,
      siteName: profile.name,
      locale: "en_US",
      publishedTime: story.date,
      modifiedTime: story.date,
      authors: [profile.name],
      section: story.category,
      tags: story.tags || [],
      images: story.cover
        ? [
            {
              url: story.cover,
              width: 1200,
              height: 630,
              alt: story.title,
            },
          ]
        : [
            {
              url: "/images/site/main-banner.png",
              width: 1200,
              height: 630,
              alt: story.title,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.description,
      creator: "@r4khul",
      images: story.cover ? [story.cover] : ["/images/site/main-banner.png"],
    },
  };
}

export default async function StoryChapterPage({ params }: Props) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const { prev, next } = getSeriesNeighbors(slug);

  const slugger = new GithubSlugger();
  const headings = Array.from(story.content.matchAll(/^##\s+(.*)$/gm)).map(match => {
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
      <StoryPostJsonLd story={story} />
      {/* Cover */}
      <div className="relative h-[141px] overflow-hidden sm:h-[246px]">
        {story.cover ? (
          <Image
            src={story.cover}
            alt={`${story.title} cover`}
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
            <BackButton href="/stories" label="all chapters" />
          </div>
          <ViewCounter slug={slug} trackView={true} variant="chip" />
        </div>

        <header className="mt-6">
          {typeof story.number === "number" && (
            <div className="flex">
              <span className="inline-flex items-center gap-1 rounded-full border border-edge bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                <span className="text-faint uppercase">{story.category}</span>
                <span className="text-edge-strong">·</span>
                <span className="font-medium text-foreground">#{story.number}</span>
              </span>
            </div>
          )}
          <h1 className="mt-3 font-serif text-[32px] leading-none tracking-tight sm:text-[40px]">
            {story.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-mono text-faint">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {new Date(story.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>·</span>
            <span>{getReadingTime(story.content)}</span>
          </div>
          {story.tags && story.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
              {story.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-edge bg-surface px-2 py-0.5 font-mono text-[11px] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5">
            <ShareButton title={story.title} />
          </div>
        </header>
      </div>

      <article className="bleed-line px-4 py-10 sm:px-8">
        <MdxContent source={story.content} />
        <SeriesNavigation prev={prev} next={next} basePath="/stories" />
      </article>
    </main>
  );
}
