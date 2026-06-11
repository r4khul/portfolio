import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProject, getProjects } from "@/lib/projects";
import { MdxContent } from "@/components/mdx-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main>
      {/* Cover */}
      <div className="dotgrid relative h-28 sm:h-36">
        <span
          aria-hidden
          className="absolute right-4 bottom-2 font-mono text-[10px] tracking-widest text-faint select-none sm:right-8"
        >
          CASE STUDY — {project.year}
        </span>
      </div>

      <div className="bleed-line px-4 py-8 sm:px-8">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> all projects
        </Link>

        <header className="mt-6">
          <p className="font-mono text-[11px] tracking-wide text-faint uppercase">
            {project.type} · {project.status}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            {project.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-edge-strong px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-surface"
              >
                {link.label} <ArrowUpRight className="size-3 text-faint" />
              </a>
            ))}
          </div>

          <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded border border-edge bg-surface px-2 py-0.5 font-mono text-[11px] text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        </header>
      </div>

      <article className="bleed-line px-4 py-10 sm:px-8">
        <MdxContent source={project.content} />
      </article>
    </main>
  );
}
