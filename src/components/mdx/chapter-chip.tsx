import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
};

export function ChapterChip({ icon, label }: Props) {
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 font-mono text-[10px] tracking-wide text-faint uppercase">
      {icon}
      {label}
    </span>
  );
}
