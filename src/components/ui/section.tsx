import { memo, type ReactNode } from "react";

type SectionProps = {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
};

/**
 * Blueprint-style section: full-bleed top rule, mono index annotation,
 * and crosshair corner markers, the structural rhythm of the page.
 */
export const Section = memo(({ id, index, title, children }: SectionProps) => {
  return (
    <section id={id} className="bleed-line relative scroll-mt-4">
      <div className="flex items-baseline justify-between px-4 pt-12 pb-7 sm:px-8">
        <h2 className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] tracking-widest text-faint select-none">
            {index}
          </span>
          <span className="font-serif text-[26px] leading-none tracking-tight sm:text-[28px]">
            {title}
          </span>
        </h2>
      </div>
      <div className="px-4 pb-14 sm:px-8">{children}</div>
    </section>
  );
});

Section.displayName = 'Section';
