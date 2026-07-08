import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type NavigableItem = {
  title: string;
  slug: string;
  description: string;
};

interface SeriesNavigationProps {
  prev?: NavigableItem;
  next?: NavigableItem;
  basePath?: string;
}

export function SeriesNavigation({ prev, next, basePath = "/blogs" }: SeriesNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 border-t border-edge pt-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev && (
          <Link
            href={`${basePath}/${prev.slug}`}
            className="group flex items-center gap-3 rounded-lg border border-edge bg-surface px-3 py-2.5 transition-colors hover:bg-background"
          >
            <ArrowLeft className="size-3.5 shrink-0 text-faint transition-transform group-hover:-translate-x-0.5" />
            <div className="min-w-0">
              <span className="block font-mono text-[10px] uppercase text-faint">
                previous
              </span>
              <span className="block truncate font-serif text-[13px] tracking-tight text-foreground">
                {prev.title}
              </span>
            </div>
          </Link>
        )}

        {next && (
          <Link
            href={`${basePath}/${next.slug}`}
            className={`group flex items-center justify-end gap-3 rounded-lg border border-edge bg-surface px-3 py-2.5 transition-colors hover:bg-background ${
              !prev ? "sm:col-start-2" : ""
            }`}
          >
            <div className="min-w-0 text-right">
              <span className="block font-mono text-[10px] uppercase text-faint">
                next
              </span>
              <span className="block truncate font-serif text-[13px] tracking-tight text-foreground">
                {next.title}
              </span>
            </div>
            <ArrowRight className="size-3.5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {next && (
        <p className="mt-2.5 line-clamp-1 text-[12px] leading-relaxed text-muted">
          up next: {next.description}
        </p>
      )}
    </nav>
  );
}
