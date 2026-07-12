import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStories, getCategorySlug } from "@/lib/stories";
import { profile } from "@/data/profile";
import { categoryMeta } from "@/data/categories";
import { BackButton } from "@/components/project/back-button";

type Props = { params: Promise<{ slug: string }> };

function getCategoryData(slug: string) {
  const all = getStories();
  const stories = all
    .filter((s) => getCategorySlug(s.category) === slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (stories.length === 0) return null;
  const name = stories[0].category;
  const cover = stories.find((s) => s.cover)?.cover;
  const description = categoryMeta[slug]?.description ?? "";
  return { name, slug, cover, description, stories };
}

export function generateStaticParams() {
  const all = getStories();
  const slugs = [...new Set(all.map((s) => getCategorySlug(s.category)))];
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryData(slug);
  if (!cat) return {};

  const title = cat.name;
  const description = cat.description || `All chapters in ${cat.name}.`;
  const image = cat.cover ?? "/images/site/main-banner.png";

  return {
    title,
    description,
    alternates: { canonical: `/stories/category/${slug}` },
    openGraph: {
      title: `${title} — ${profile.name}`,
      description,
      url: `${profile.url}/stories/category/${slug}`,
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

export default async function StoryCategoryPage({ params }: Props) {
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
        <BackButton href="/stories" label="all stories" />
        <header className="mt-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            story
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
            {cat.stories.length} {cat.stories.length === 1 ? "chapter" : "chapters"}
          </p>
        </header>
      </div>

      {/* Bookshelf */}
      <div className="bleed-line px-4 pt-2 pb-14 sm:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {cat.stories.map((story) => {
            const eyebrow = story.number === 0 ? "Prequel" : "Chapter";
            return (
              <Link
                key={story.slug}
                href={`/stories/${story.slug}`}
                className="group relative flex aspect-[2/3] flex-col overflow-hidden rounded-sm border border-edge bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {story.cover && (
                  <>
                    <Image
                      src={story.cover}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 25vw, 45vw"
                      className="object-cover opacity-15 transition-opacity duration-500 group-hover:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background/70" />
                  </>
                )}

                {/* spine */}
                <div className="absolute inset-y-0 left-0 w-[6px] bg-edge/70" aria-hidden />

                <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-5 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                    {eyebrow}
                    {typeof story.number === "number" && story.number > 0 && ` ${story.number}`}
                  </span>
                  <h2 className="font-serif text-[19px] leading-snug tracking-tight text-foreground sm:text-[22px]">
                    {story.title}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
