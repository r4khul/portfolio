import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStory, getStories, getSeriesNeighbors } from "@/lib/stories";
import { profile } from "@/data/profile";
import { StoryMdxContent } from "@/components/stories/engine/story-mdx";
import { StoryPostJsonLd } from "@/components/site/json-ld";
import { ViewCounter } from "@/components/blogs/view-counter";

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

  const { next } = getSeriesNeighbors(slug);
  
  // Optional ambient extraction from frontmatter - assuming we add it, otherwise default
  // Just parsing it from content for now, or defaulting to warm/cold based on something
  // We'll leave it to layout/CSS default for now

  return (
    <>
      <ViewCounter slug={slug} trackView={true} variant="silent" />
      <div className="story-progress-bar" aria-hidden="true" />
      <StoryPostJsonLd story={story} />

      <article>
        <StoryMdxContent source={story.content} />
      </article>

      {/* Minimalist Footer Navigation */}
      <nav className="mt-32 pt-16 border-t border-story-border text-center story-fade-in pb-24">
        {next ? (
          <Link 
            href={`/stories/${next.slug}`}
            className="group inline-block"
          >
            <span className="block font-mono text-[11px] uppercase tracking-widest text-story-faint mb-4 transition-colors group-hover:text-story-text">
              Next Chapter
            </span>
            <span className="font-serif text-2xl sm:text-3xl text-story-text transition-colors group-hover:text-story-accent">
              {next.title}
            </span>
          </Link>
        ) : (
          <div>
            <div className="w-8 h-8 mx-auto mb-8 opacity-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-story-text" />
            </div>
            <Link 
              href="/stories"
              className="font-mono text-[11px] uppercase tracking-widest text-story-faint transition-colors hover:text-story-text"
            >
              Return to Library
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
