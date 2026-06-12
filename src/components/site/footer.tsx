import { profile, socials } from "@/data/profile";

export function Footer() {
  return (
    <footer className="bleed-line">
      <div className="flex flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="font-mono text-[11px] text-faint">
            © {new Date().getFullYear()} {profile.name}
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
