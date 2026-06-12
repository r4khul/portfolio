import { memo } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
] as const;

export const Header = memo(() => {
  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between border-b border-x border-edge px-4 pt-1 sm:px-8 sm:pt-0">
        <Link
          href="/"
          aria-label="Home"
          className="font-mono text-sm font-bold tracking-tighter select-none"
        >
          {"r4khul"}
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
          <nav aria-label="Primary" className="hidden items-center gap-4 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
