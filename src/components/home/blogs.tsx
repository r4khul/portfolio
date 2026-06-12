import { memo } from "react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { PenTool, Sparkles } from "lucide-react";

export const BlogsSection = memo(() => {
  return (
    <Section id="blogs" index="06" title="Blogs">
      <Reveal>
        <div className="relative overflow-hidden rounded-lg border border-edge bg-surface p-8 sm:p-10">
          <div className="dotgrid absolute inset-0 opacity-[0.25]" aria-hidden />
          <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto py-6">
            <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
              Serious writing on the way.
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-sans">
              Preparing a collection of notes on system architecture, offline-first mobile engineering, clean interfaces, and lessons learned in production.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-[11px] font-mono text-faint select-none">
              <PenTool className="size-3.5" />
              <span>Stay tuned</span>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
});

BlogsSection.displayName = "BlogsSection";
