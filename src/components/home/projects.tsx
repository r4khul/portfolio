import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProjects } from "@/lib/projects";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function ProjectsSection() {
  const projects = getProjects();

  return (
    <Section id="projects" index="03" title="Projects">
      <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge sm:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.06} className="bg-background">
            <Link
              href={`/projects/${project.slug}`}
              className="group flex h-full flex-col p-5 transition-colors hover:bg-surface sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold tracking-tight">{project.title}</h3>
                <ArrowUpRight className="size-4 shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
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
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
