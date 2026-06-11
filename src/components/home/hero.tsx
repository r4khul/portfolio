import Image from "next/image";
import {
  CalendarClock,
  MapPin,
  Mail,
  Calendar,
} from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import { SiLeetcode } from "react-icons/si";
import { profile, socials } from "@/data/profile";
import { LocalTime } from "@/components/site/local-time";
import { ResumeButton } from "@/components/ui/resume-button";
import { OpenToWorkBadge } from "@/components/ui/open-to-work-badge";

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
          className="object-cover object-[95%_center] sm:object-center"
          aria-hidden
        />
      </div>

      <div className="bleed-line relative pb-8 sm:pb-10">
        <div className="px-4 sm:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            <div className="flex flex-col items-start gap-3">
              <div className="relative z-10 -mt-12 shrink-0 sm:-mt-16">
                <div className="size-24 overflow-hidden rounded-full border-4 border-background bg-background sm:size-32 shadow-sm">
                  <Image
                    src="/images/site/pfp.png"
                    alt="Rakhul Prakash S B"
                    width={128}
                    height={128}
                    priority
                    className="size-full object-cover"
                  />
                </div>
              </div>

              {/* Mobile-only badges (below PFP, before Name) */}
              <div className="flex items-center gap-2.5 sm:hidden mt-1 mb-2">
                <OpenToWorkBadge />
                <div className="flex items-center gap-1 text-muted font-mono text-[11px]">
                  <MapPin className="size-3" />
                  <span>India</span>
                </div>
              </div>
            </div>

            {/* Web-only Status (Top Right) */}
            <div className="hidden sm:flex flex-col items-end gap-3 pb-2">
              <OpenToWorkBadge />
            </div>
          </div>

          <div className="mt-2 sm:mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-[34px] leading-none tracking-tight sm:text-5xl">
                Rakhul Prakash S B
              </h1>
              
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] text-muted">
                <span className="font-medium text-foreground">{profile.role}</span>
                <span className="hidden sm:inline text-edge-strong">•</span>
                <div className="hidden sm:flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  <span>India</span>
                </div>
                <span className="text-edge-strong">•</span>
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" />
                  <LocalTime timezone={profile.timezone} />
                </div>
              </div>

              {/* Social Icons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {socials.map((social) => {
                  const Icon =
                    social.label === "GitHub" ? FaGithub :
                    social.label === "X / Twitter" ? FaXTwitter :
                    social.label === "LinkedIn" ? FaLinkedin :
                    SiLeetcode;
                  
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tactile flex size-10 items-center justify-center rounded-lg text-faint transition-all hover:-translate-y-0.5 hover:text-foreground hover:shadow-sm"
                      aria-label={social.label}
                    >
                      <Icon className="size-4.5" />
                    </a>
                  );
                })}

                <ResumeButton href={profile.resume} />
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="tactile flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-faint transition-all hover:-translate-y-0.5 hover:text-foreground"
              >
                <Mail className="size-4.5" />
                <span className="font-sans text-[14px] font-medium tracking-wide">
                  Email Me
                </span>
              </a>
              <a
                href={profile.cal}
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-primary flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <Calendar className="size-4.5" />
                <span className="font-sans text-[14px] font-medium tracking-wide">
                  Schedule Call
                </span>
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
