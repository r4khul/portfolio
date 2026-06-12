import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Pin, Play } from "lucide-react";
import { FaGithub, FaGooglePlay } from "react-icons/fa";
import { getProject, getProjects } from "@/lib/projects";
import { profile } from "@/data/profile";
import { MdxContent } from "@/components/mdx-content";
import { GithubStats } from "@/components/project/github-stats";
import { ProjectJsonLd } from "@/components/site/json-ld";
import { ProjectActions } from "@/components/project/project-actions";
import { BackButton } from "@/components/project/back-button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const images = project.cover
    ? [
        {
          url: project.cover,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ]
    : [];

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `/projects/${slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      url: `${profile.url}/projects/${slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: project.cover ? [project.cover] : [],
    },
  };
}

const getLinkIcon = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized.includes("github")) {
    return <FaGithub className="size-3.5 text-muted transition-colors group-hover:text-foreground" />;
  }
  if (normalized.includes("play store") || normalized.includes("google play")) {
    return <FaGooglePlay className="size-3.5 text-muted transition-colors group-hover:text-foreground" />;
  }
  if (normalized.includes("video") || normalized.includes("demo")) {
    return <Play className="size-3.5 text-muted fill-muted/10 transition group-hover:text-foreground group-hover:fill-foreground/10" />;
  }
  return <ArrowUpRight className="size-3 text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main>
      <ProjectJsonLd project={project} />
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
        <BackButton href="/#projects" />

        <header className="mt-6">
          <p className="font-mono text-[11px] tracking-wide text-faint uppercase">
            {project.type} · {project.status}
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <h1 className="font-serif text-[38px] leading-none tracking-tight sm:text-[48px]">
              {project.title}
            </h1>
            {project.slug === "unfilter" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--contrib-4)]/30 bg-[var(--contrib-4)]/10 px-2 py-0.5 text-[10.5px] font-semibold tracking-wider text-[var(--contrib-4)] font-mono uppercase align-middle">
                <Pin className="size-3 fill-[var(--contrib-4)] rotate-45" />
                pinned
              </span>
            )}
          </div>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            {project.description}
          </p>

          <ProjectActions links={project.links.map(l => ({ ...l, icon: getLinkIcon(l.label) }))} />

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

        {project.slug === "unfilter" && (
          <GithubStats repo="r4khul/unfilter" />
        )}
      </div>

      <article className="bleed-line px-4 py-10 sm:px-8">
        <MdxContent source={project.content} />
      </article>
    </main>
  );
}
