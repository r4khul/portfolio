import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function ContactSection() {
  return (
    <Section id="contact" index="07" title="Contact">
      <Reveal>
        <div className="hatch rounded-lg border border-edge p-6 sm:p-8">
          <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
            Let&apos;s build something that ships.
          </h3>
          <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-muted">
            Open to mobile engineering roles and freelance work. The fastest way to
            reach me is email — or grab a slot directly on my calendar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
            >
              Email me
            </a>
            <a
              href={profile.cal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-edge-strong bg-background px-4 py-2 text-[13px] font-medium transition-colors hover:bg-surface"
            >
              Book a call <ArrowUpRight className="size-3.5 text-faint" />
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
