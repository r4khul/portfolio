import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function ContactSection() {
  return (
    <Section id="contact" index="07" title="Contact">
      <Reveal>
        <div className="hatch rounded-lg border border-edge p-6 sm:p-8">
          <h3 className="font-serif text-[28px] leading-[1.1] tracking-tight sm:text-[34px]">
            Let&apos;s build something <em className="italic">that ships.</em>
          </h3>
          <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-muted">
            Open to mobile engineering roles and freelance work. The fastest way to
            reach me is email — or grab a slot directly on my calendar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="tactile-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium"
            >
              Email me
            </a>
            <a
              href={profile.cal}
              target="_blank"
              rel="noopener noreferrer"
              className="tactile inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium"
            >
              Book a call <ArrowUpRight className="size-3.5 text-faint" />
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
