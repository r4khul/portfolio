"use client";

import { memo } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { WipProject } from "@/data/wip-projects";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

interface WipProjectCardProps {
  project: WipProject;
}

export const WipProjectCard = memo(({ project }: WipProjectCardProps) => {
  const { playClick } = useAudioFeedback();

  return (
    <a
      href={project.repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={playClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-edge bg-background transition-colors hover:bg-surface sm:flex-row sm:items-stretch"
    >
      <div className="flex w-full flex-col justify-between p-4 sm:w-[60%] sm:p-5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14.5px] font-semibold tracking-tight text-foreground truncate">
              {project.title}
            </h3>
            <ArrowUpRight className="size-3.5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>

          <p className="mt-0.5 font-mono text-[10px] tracking-wide text-faint uppercase">
            {project.type} · {project.year}
          </p>

          <p className="mt-2 text-[13px] leading-relaxed text-muted line-clamp-2">
            {project.description}
          </p>
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px] text-muted"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      {project.cover ? (
        <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-surface/50 border-t border-edge sm:aspect-auto sm:w-[40%] sm:border-t-0 sm:border-l">
          <Image
            src={project.cover}
            alt={`${project.title} cover`}
            fill
            sizes="(min-width: 640px) 40vw, 100vw"
            className="object-cover object-left transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden border-t border-edge dotgrid sm:aspect-auto sm:w-[40%] sm:border-t-0 sm:border-l" />
      )}
    </a>
  );
});

WipProjectCard.displayName = "WipProjectCard";
