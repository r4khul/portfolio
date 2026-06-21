import { memo, type ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

type SectionProps = {
  id: string;
  index: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Blueprint-style section: full-bleed top rule, mono index annotation,
 * and crosshair corner markers, the structural rhythm of the page.
 */
export const Section = memo(({ id, index, title, action, children }: SectionProps) => {
  // Extract numeric part of index (e.g., "01" -> 1) for staggered delay calculation
  const sectionNumber = parseInt(index, 10);
  const baseDelay = sectionNumber * 0.05;

  return (
    <section id={id} className="bleed-line relative scroll-mt-4">
      <Reveal delay={baseDelay}>
        <div className="flex items-center justify-between px-4 pt-12 pb-7 sm:px-8">
          <h2 className="flex items-baseline gap-3">
            <span className="font-mono text-[11px] tracking-widest text-faint select-none">
              {index}
            </span>
            <span className="font-serif text-[26px] leading-none tracking-tight sm:text-[28px]">
              {title}
            </span>
          </h2>
          {action}
        </div>
      </Reveal>
      <div className="px-4 pb-14 sm:px-8">
        <Reveal delay={baseDelay + 0.1}>
          {children}
        </Reveal>
      </div>
    </section>
  );
});

Section.displayName = 'Section';
