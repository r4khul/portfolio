"use client";

import { memo } from "react";
import Image from "next/image";
import { experience } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

// Parse markdown bold syntax (**text**) into React elements
function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span className="inline">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export const ExperienceSection = memo(() => {
  const { playClick } = useAudioFeedback();

  return (
    <Section id="experience" index="02" title="Experience">
      <div className="relative space-y-12">
        {experience.map((job) => (
          <div key={job.company}>
            <Reveal>
              <article className="relative pl-16">
                {/* Logo Avatar */}
                <div className="tactile absolute left-0 top-0 flex size-12 items-center justify-center overflow-hidden rounded-full shadow-sm transition duration-300 hover:scale-105 hover:shadow-md">
                  <Image
                    src={job.logo}
                    alt={`${job.company} logo`}
                    width={48}
                    height={48}
                    className="size-full rounded-full object-cover"
                  />
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold">
                    <a
                      href={job.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playClick}
                      className="hover:underline"
                    >
                      {job.company}
                    </a>
                  </h3>
                  <span className="font-mono text-[12px] text-faint">{job.period}</span>
                </div>
                <p className="mt-0.5 text-[13px] text-muted">
                  {job.title} · {job.location}
                </p>
                <p className="mt-4 max-w-prose text-[14px] leading-relaxed text-muted">
                  {job.summary}
                </p>
                <ul className="mt-4 space-y-2">
                  {job.highlights.map((point) => (
                    <li
                      key={point.slice(0, 32)}
                      className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted"
                    >
                      <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-faint" />
                      {parseBold(point)}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        ))}
      </div>
    </Section>
  );
});

ExperienceSection.displayName = 'ExperienceSection';
