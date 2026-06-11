import Image from "next/image";
import {
  CalendarClock,
  Code2,
  Link2,
  MapPin,
  Mail,
} from "lucide-react";
import { profile } from "@/data/profile";
import { LocalTime } from "@/components/site/local-time";

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-[13px] text-muted">
      <span className="tactile flex size-6 shrink-0 items-center justify-center rounded-full text-faint">
        {icon}
      </span>
      {children}
    </div>
  );
}

export function Hero() {
  return (
    <section aria-label="Intro">
      {/* Cover banner */}
      <div className="relative h-40 overflow-hidden sm:h-52">
        <Image
          src="/images/site/pfp-banner.png"
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden
        />
      </div>

      {/* Identity block */}
      <div className="bleed-line relative">
        <div className="flex items-end gap-4 px-4 sm:gap-6 sm:px-8">
          <div className="relative z-10 -mt-12 size-24 shrink-0 overflow-hidden rounded-full border-2 border-edge-strong bg-background sm:-mt-16 sm:size-32">
            <Image
              src="/images/site/pfp.png"
              alt="Rakhul Prakash"
              width={128}
              height={128}
              priority
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <h1 className="truncate font-serif text-[34px] leading-none tracking-tight sm:text-5xl">
              Rakhul Prakash
            </h1>
            <p className="mt-2 border-t border-edge pt-2 font-mono text-[12px] tracking-wide text-muted">
              {profile.role}
            </p>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="bleed-line mt-6">
        <div className="grid gap-x-8 gap-y-3 px-4 py-6 sm:grid-cols-2 sm:px-8">
          <InfoRow icon={<Code2 className="size-3" />}>
            Flutter · ships to the Play Store
          </InfoRow>
          <InfoRow icon={<CalendarClock className="size-3" />}>
            <LocalTime timezone={profile.timezone} />
          </InfoRow>
          <InfoRow icon={<MapPin className="size-3" />}>{profile.location}</InfoRow>
          <InfoRow icon={<Mail className="size-3" />}>
            <a
              href={`mailto:${profile.email}`}
              className="transition-colors hover:text-foreground"
            >
              {profile.email}
            </a>
          </InfoRow>
          <InfoRow icon={<Link2 className="size-3" />}>
            <a
              href="https://github.com/r4khul"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              github.com/r4khul
            </a>
          </InfoRow>
          <InfoRow
            icon={
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
              </span>
            }
          >
            <span className="text-accent">open to work — 2026</span>
          </InfoRow>
        </div>
      </div>
    </section>
  );
}
