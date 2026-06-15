"use client";

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
import { GitHubContributionGraph } from "@/components/home/github-graph";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

export function Hero() {
  const { playClick } = useAudioFeedback();

  return (
    <section aria-label="Intro">
      {/* Cover banner */}
      <Reveal>
        <div className="relative h-40 overflow-hidden sm:h-52">
          <Image
            src="/images/site/pfp-banner.avif"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover object-[90%_center] sm:object-center"
            aria-hidden
          />
        </div>
      </Reveal>

      <div className="bleed-line relative pb-8 sm:pb-10">
        <div className="px-4 sm:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            <div className="flex flex-col items-start gap-3">
              <Reveal delay={0.1}>
                <div className="relative z-10 -mt-12 shrink-0 sm:-mt-16">
                  <div className="size-24 overflow-hidden rounded-full border-4 border-background bg-background sm:size-32 shadow-sm">
                    <Image
                      src="/images/site/pfp.avif"
                      alt="Rakhul Prakash S B"
                      width={128}
                      height={128}
                      priority
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              </Reveal>

              {/* Mobile-only badges (below PFP, before Name) */}
              <Reveal delay={0.15} className="sm:hidden">
                <div className="flex items-center gap-2.5 mt-1 mb-2">
                  <OpenToWorkBadge />
                  <div className="flex items-center gap-1 text-muted font-mono text-[11px]">
                    <MapPin className="size-3" />
                    <span>India</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Web-only Status (Top Right) */}
            <Reveal delay={0.2} className="hidden sm:flex">
              <div className="flex flex-col items-end gap-3 pb-2">
                <OpenToWorkBadge />
              </div>
            </Reveal>
          </div>

          <div className="mt-2 sm:mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <Reveal delay={0.25}>
                <h1 className="truncate font-serif text-[34px] leading-none tracking-tight sm:text-5xl">
                  Rakhul Prakash S B
                </h1>
              </Reveal>
              
              <Reveal delay={0.3}>
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
              </Reveal>

              {/* Social Icons */}
              <Reveal delay={0.35}>
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
                        onClick={playClick}
                        className="tactile flex size-10 items-center justify-center rounded-lg text-faint transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-sm"
                        aria-label={social.label}
                      >
                        <Icon className="size-4.5" />
                      </a>
                    );
                  })}

                  <ResumeButton href={profile.resume} />
                </div>
              </Reveal>
            </div>

            {/* Primary Actions */}
            <Reveal delay={0.4}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  onClick={playClick}
                  className="tactile flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-faint transition hover:-translate-y-0.5 hover:text-foreground"
                >
                  <Mail className="size-4.5" />
                  <span className="font-sans text-[14px] font-medium tracking-wide">
                    Email Me
                  </span>
                </a>
                <button
                  type="button"
                  data-cal-namespace="meet"
                  data-cal-link="r4khul/meet"
                  data-cal-config={JSON.stringify({
                    layout: "month_view",
                    useSlotsViewOnSmallScreen: "true",
                  })}
                  onClick={playClick}
                  className="tactile-primary flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 cursor-pointer transition hover:-translate-y-0.5 shadow-sm"
                >
                  <Calendar className="size-4.5" />
                  <span className="font-sans text-[14px] font-medium tracking-wide">
                    Schedule Call
                  </span>
                </button>
              </div>
            </Reveal>
          </div>
          
          <Reveal delay={0.5}>
            <GitHubContributionGraph />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
