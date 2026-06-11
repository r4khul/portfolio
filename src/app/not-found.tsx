import Link from "next/link";

export default function NotFound() {
  return (
    <main className="dotgrid flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-[11px] tracking-widest text-faint uppercase">
        Error — FIG. 404
      </p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <Link
        href="/"
        className="mt-2 rounded-md border border-edge-strong px-4 py-2 text-[13px] font-medium transition-colors hover:bg-surface"
      >
        Back home
      </Link>
    </main>
  );
}
