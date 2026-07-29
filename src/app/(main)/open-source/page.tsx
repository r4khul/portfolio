import type { Metadata } from "next";
import { profile, openSource } from "@/data/profile";
import { BackButton } from "@/components/project/back-button";
import { OpenSourceList } from "@/components/open-source/open-source-list";

export const metadata: Metadata = {
  title: "Open Source",
  description:
    "A comprehensive record of pull requests, bug fixes, performance improvements, and feature contributions across production open-source software.",
  alternates: {
    canonical: "/open-source",
  },
  openGraph: {
    title: `Open Source — ${profile.name}`,
    description:
      "A comprehensive record of pull requests, bug fixes, performance improvements, and feature contributions across production open-source software.",
    url: `${profile.url}/open-source`,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/site/main-banner.png",
        width: 1200,
        height: 630,
        alt: `Open Source — ${profile.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Open Source — ${profile.name}`,
    description:
      "A comprehensive record of pull requests, bug fixes, performance improvements, and feature contributions across production open-source software.",
    creator: "@r4khul",
    images: ["/images/site/main-banner.png"],
  },
};

export default function OpenSourcePage() {
  return (
    <main>
      <div className="bleed-line px-4 py-8 sm:px-8">
        <BackButton href="/#open-source" label="home" />
        <header className="mt-6">
          <h1 className="font-serif text-[38px] leading-none tracking-tight sm:text-[48px]">
            Open Source
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            A comprehensive record of pull requests, bug fixes, performance optimizations, and
            feature contributions across production open-source software.
          </p>
        </header>
      </div>

      <div className="bleed-line px-4 pt-6 pb-14 sm:px-8 sm:pt-8">
        <OpenSourceList contributions={openSource} />
      </div>
    </main>
  );
}
