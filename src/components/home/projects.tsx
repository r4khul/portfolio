"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Pin } from "lucide-react";
import type { Project } from "@/lib/projects";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection = memo(({ projects }: ProjectsSectionProps) => {
  const { playClick } = useAudioFeedback();

  return (
    <Section
      id="projects"
      index="04"
      title="Projects"
      action={
        <Link
          href="/projects"
          onClick={playClick}
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          all projects
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      }
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge sm:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.06} className="bg-background">
            <Link
              href={`/projects/${project.slug}`}
              onClick={playClick}
              className="group flex h-full flex-col transition-colors hover:bg-surface"
            >
              <div className="relative aspect-[5/2.4] overflow-hidden border-b border-edge">
                {project.cover ? (
                  <Image
                    src={project.cover}
                    alt={`${project.title} cover`}
                    fill
                    sizes="(min-width: 640px) 360px, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="dotgrid size-full" aria-hidden />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold tracking-tight">
                    {project.title}
                  </h3>
                  {project.slug === "unfilter" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--contrib-4)]/30 bg-[var(--contrib-4)]/5 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-[var(--contrib-4)] font-mono uppercase">
                      <Pin className="size-2.5 fill-[var(--contrib-4)] rotate-45" />
                      pinned
                    </span>
                  )}
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </div>
              <p className="mt-1 font-mono text-[10.5px] tracking-wide text-faint uppercase">
                {project.type} · {project.status}
              </p>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-muted">
                {project.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
                {project.stack.slice(0, 5).map((tech) => (
                  <li
                    key={tech}
                    className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10.5px] text-muted"
                  >
                    {tech}
                  </li>
                ))}
                {project.stack.length > 5 && (
                  <li className="px-1 py-0.5 font-mono text-[10.5px] text-faint">
                    +{project.stack.length - 5}
                  </li>
                )}
              </ul>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

    </Section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';
