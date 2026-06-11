import type { Metadata } from "next";
import Image from "next/image";
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
      <div className="relative h-[141px] overflow-hidden sm:h-[246px]">
        {project.cover ? (
          <Image
            src={project.cover}
            alt={`${project.title} cover`}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="dotgrid size-full" />
        )}
      </div>

      <div className="bleed-line px-4 py-8 sm:px-8">
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />{" "}
          all projects
        </Link>

        <header className="mt-6">
          <p className="font-mono text-[11px] tracking-wide text-faint uppercase">
            {project.type} · {project.status}
          </p>
          <h1 className="mt-3 font-serif text-[38px] leading-none tracking-tight sm:text-[48px]">
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
                className="tactile inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium"
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
