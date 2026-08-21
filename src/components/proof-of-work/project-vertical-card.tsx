import Image from "next/image";
import { Project } from "@/lib/projects";
import { BentoCard } from "./bento-grid";
import { AnimatedActionButton } from "./animated-action-button";

interface ProjectVerticalCardProps {
  project: Project;
  className?: string;
}

export function ProjectVerticalCard({ project, className }: ProjectVerticalCardProps) {
  return (
    <BentoCard className={`tactile group p-0 overflow-hidden flex flex-col h-full ${className || ""}`}>
      
      {/* Visual / Image area */}
      <div className="relative h-[250px] w-full bg-surface overflow-hidden border-b border-edge shrink-0">
        {project.cover ? (
          <Image
            src={project.cover}
            alt={`${project.title} cover`}
            fill
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority
          />
        ) : (
          <div className="hatch size-full" aria-hidden />
        )}
      </div>

      {/* Content area */}
      <div className="relative z-20 flex flex-1 flex-col p-6 md:p-8 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
              {project.type}
            </span>
          </div>
          
          <h2 className="text-3xl font-serif tracking-tight mb-4">
            {project.title}
          </h2>
          
          <p className="text-[14px] text-muted line-clamp-4 leading-relaxed mb-6">
            {project.description}
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-edge/50">
          <AnimatedActionButton href={`/projects/${project.slug}`} className="w-full">
            View Case Study
          </AnimatedActionButton>
        </div>
      </div>
    </BentoCard>
  );
}
