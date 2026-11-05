import type { Metadata } from "next";
import { BackButton } from "@/components/project/back-button";
import { SlideGrid } from "@/components/slides/slide-card";
import { memories } from "@/data/memories";

export const metadata: Metadata = {
  title: "Slides",
  description:
    "Life, one memory at a time. Immersive first-person stories from the moments that stayed.",
  alternates: { canonical: "/slides" },
  openGraph: {
    title: "Slides — Life, one memory at a time",
    description:
      "Scroll into the moments that stayed. First-person core memories by Rakhul Prakash.",
    url: "/slides",
    type: "website",
  },
};

export default function SlidesPage() {
  return (
    <main>
      <div className="bleed-line px-4 py-8 sm:px-8">
        <BackButton href="/#slides" label="home" />
        <header className="mt-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            Life writings
          </p>
          <h1 className="font-serif text-[46px] leading-none tracking-tight sm:text-[58px]">
            Slides
          </h1>
          <p className="mt-4 max-w-[40ch] text-[15px] leading-[1.8] text-muted">
            Life, one memory at a time. Scroll into the moments that stayed.
          </p>
        </header>
      </div>

      <section aria-labelledby="core-memories-title" className="bleed-line px-4 pt-8 pb-14 sm:px-8 sm:pt-10">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 id="core-memories-title" className="font-serif text-[26px] tracking-tight">
            Core memories
          </h2>
          <span className="font-mono text-[10px] text-faint">{String(memories.length).padStart(2, "0")} memories</span>
        </div>
        <SlideGrid />
        <p className="mt-5 font-mono text-[10px] leading-relaxed text-faint">
          Best taken slowly. On whichever screen is yours.
        </p>
      </section>
    </main>
  );
}
