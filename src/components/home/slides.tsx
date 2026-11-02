import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SlideCard } from "@/components/slides/slide-card";

export function SlidesSection() {
  return (
    <Section
      id="slides"
      index="08"
      title="Slides"
      action={
        <Link
          href="/slides"
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          all memories
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" />
        </Link>
      }
    >
      <p className="mb-6 max-w-prose text-[15px] leading-[1.8] text-muted">
        Life, one memory at a time. Scroll into the moments that stayed.
      </p>
      <SlideCard />
    </Section>
  );
}
