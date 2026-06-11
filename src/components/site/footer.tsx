import Image from "next/image";
import { profile, socials } from "@/data/profile";

export function Footer() {
  return (
    <footer className="bleed-line">
      <div className="flex flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/images/site/escapebranch-logo.png"
            alt="EscapeBranch"
            width={20}
            height={20}
            className="opacity-40 dark:invert"
          />
          <p className="font-mono text-[11px] text-faint">
            © {new Date().getFullYear()} {profile.name} · built with intent
          </p>
        </div>
        <nav aria-label="Social links" className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-muted transition-colors hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
