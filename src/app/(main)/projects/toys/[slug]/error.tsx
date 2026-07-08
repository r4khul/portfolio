"use client";

import Link from "next/link";

export default function ToyPageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="dotgrid flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-[11px] tracking-widest text-faint uppercase">
        Error loading page
      </p>
      <h1 className="font-serif text-4xl tracking-tight">Something went wrong</h1>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="tactile rounded-md px-4 py-2 text-[13px] font-medium"
        >
          Try again
        </button>
        <Link
          href="/projects"
          className="rounded-md px-4 py-2 text-[13px] font-medium text-muted hover:text-foreground transition-colors"
        >
          Back to projects
        </Link>
      </div>
    </main>
  );
}
