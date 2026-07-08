import type { Metadata } from "next";
import { PenTool } from "lucide-react";
import { getStories } from "@/lib/stories";
import { profile } from "@/data/profile";
import { BackButton } from "@/components/project/back-button";
import { StorySummaryGrid } from "@/components/stories/story-summary-card";

const STORIES_BANNER = "/images/stories/the-girl-in-the-dream/the-girl-in-the-dream-banner.png";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Fiction, fragments, and serialized tales. One chapter at a time.",
  alternates: {
    canonical: "/stories",
  },
  openGraph: {
    title: `Stories — ${profile.name}`,
    description:
      "Fiction, fragments, and serialized tales. One chapter at a time.",
    url: `${profile.url}/stories`,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: STORIES_BANNER,
        width: 1200,
        height: 630,
        alt: `Stories — ${profile.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Stories — ${profile.name}`,
    description:
      "Fiction, fragments, and serialized tales. One chapter at a time.",
    creator: "@r4khul",
    images: [STORIES_BANNER],
  },
};

export default function StoriesPage() {
  const stories = getStories();

  return (
    <main>
      <div className="bleed-line px-4 py-8 sm:px-8">
        <BackButton href="/#stories" label="home" />
        <header className="mt-6">
          <h1 className="font-serif text-[38px] leading-none tracking-tight sm:text-[48px]">
            Stories
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            Fiction, fragments, and serialized tales. One chapter at a time.
          </p>
        </header>
      </div>

      <div className="bleed-line px-4 pt-8 pb-14 sm:px-8 sm:pt-10">
        {stories.length === 0 ? (
          <div className="relative overflow-hidden rounded-lg border border-edge bg-surface p-8 sm:p-10">
            <div className="dotgrid absolute inset-0 opacity-[0.25]" aria-hidden />
            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center py-6 text-center">
              <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
                Stories are on the way.
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-sans">
                Preparing a collection of fiction, fragments, and serialized
                tales told one chapter at a time.
              </p>
              <div className="mt-6 flex items-center gap-1.5 select-none font-mono text-[11px] text-faint">
                <PenTool className="size-3.5" />
                <span>Stay tuned</span>
              </div>
            </div>
          </div>
        ) : (
          <StorySummaryGrid stories={stories} />
        )}
      </div>
    </main>
  );
}
