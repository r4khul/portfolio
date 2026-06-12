import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="dotgrid flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-[11px] tracking-widest text-faint uppercase">
        Error - FIG. 404
      </p>
      <h1 className="font-serif text-4xl tracking-tight">Page not found</h1>
      <Link
        href="/"
        className="tactile mt-2 rounded-md px-4 py-2 text-[13px] font-medium"
      >
        Back home
      </Link>
    </main>
  );
}
