"use client";

import { ReactNode } from "react";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

interface ProjectLink {
  label: string;
  url: string;
  icon: ReactNode;
}

interface ProjectActionsProps {
  links: ProjectLink[];
}

export function ProjectActions({ links }: ProjectActionsProps) {
  const { playClick } = useAudioFeedback();

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClick}
          className="tactile inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[12.5px] font-medium group"
        >
          {link.icon}
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
}
