import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
};

/**
 * Blueprint-style section: full-bleed top rule, mono index annotation,
 * and crosshair corner markers — the structural rhythm of the page.
 */
export function Section({ id, index, title, children }: SectionProps) {
  return (
    <section id={id} className="bleed-line relative scroll-mt-20">
      <span
        aria-hidden
        className="absolute -top-px -left-[4.5px] select-none text-[9px] leading-[1px] text-faint"
      >
        +
      </span>
      <span
        aria-hidden
        className="absolute -top-px -right-[4.5px] select-none text-[9px] leading-[1px] text-faint"
      >
        +
      </span>
      <div className="flex items-baseline justify-between px-4 pt-10 pb-6 sm:px-8">
        <h2 className="text-sm font-semibold tracking-widest uppercase">{title}</h2>
        <span className="font-mono text-[11px] text-faint select-none">{index}</span>
      </div>
      <div className="px-4 pb-12 sm:px-8">{children}</div>
    </section>
  );
}
