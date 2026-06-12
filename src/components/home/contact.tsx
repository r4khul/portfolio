"use client";

import { ArrowUpRight, Mail, Calendar } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

export function ContactSection() {
  const { playClick } = useAudioFeedback();

  return (
    <Section id="contact" index="07" title="Contact">
      <Reveal>
        <div className="hatch rounded-lg border border-edge p-6 sm:p-8">
          <h3 className="font-serif text-[28px] leading-[1.1] tracking-tight sm:text-[34px]">
            Let&apos;s build something <em className="italic">that ships.</em>
          </h3>
          <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-muted">
            Open to mobile engineering roles and freelance work. The fastest way to
            reach me is email, or grab a slot directly on my calendar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              onClick={playClick}
              className="tactile-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium"
            >
              <Mail className="size-3.5" />
              Email me
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
              className="tactile inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer"
            >
              <Calendar className="size-3.5" />
              <span>Book a call</span>
              <ArrowUpRight className="size-3.5 text-faint ml-0.5" />
            </button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
