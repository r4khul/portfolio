import type { Metadata } from "next";
import { PenTool } from "lucide-react";
import { getBlogs } from "@/lib/blogs";
import { profile } from "@/data/profile";
import { BackButton } from "@/components/project/back-button";
import { CategoryGrid } from "@/components/blogs/category-grid";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: `Blog — ${profile.name}`,
    description:
      "Notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.",
    url: `${profile.url}/blogs`,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/site/main-banner.png",
        width: 1200,
        height: 630,
        alt: `Blog — ${profile.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog — ${profile.name}`,
    description:
      "Notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.",
    creator: "@r4khul",
    images: ["/images/site/main-banner.png"],
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
            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center py-6 text-center">
              <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
                Serious writing on the way.
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-sans">
                Preparing a collection of notes on system architecture,
                offline-first mobile engineering, clean interfaces, and lessons
                learned in production.
              </p>
              <div className="mt-6 flex items-center gap-1.5 select-none font-mono text-[11px] text-faint">
                <PenTool className="size-3.5" />
                <span>Stay tuned</span>
              </div>
            </div>
          </div>
        ) : (
          <CategoryGrid items={blogs} />
        )}
      </div>
    </main>
  );
}
