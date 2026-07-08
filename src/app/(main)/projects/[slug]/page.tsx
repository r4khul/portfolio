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
      siteName: profile.name,
      locale: "en_US",
      images: images.length > 0 ? images : [
        {
          url: "/images/site/main-banner.png",
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      creator: "@r4khul",
      images: project.cover ? [project.cover] : ["/images/site/main-banner.png"],
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
  if (normalized.includes("pub.dev") || normalized.includes("pub") || normalized.includes("dart")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-3.5 text-muted transition-colors group-hover:text-foreground"
        aria-hidden="true"
      >
        <path d="M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 0 1 1.481-.315c.766.047 1.677.788 1.677.788L24 9.948v9.789h-4.263V24H9.789l-9-9C.303 14.5 0 13.795 0 13.105c0-.319.18-.818.316-1.105l3.789-7.895zm.679.679v11.787c.002.543.021 1.024.498 1.508L10.204 23h8.533v-4.263L4.784 4.784zm12.055-.678c-.899-.896-1.809-1.78-2.74-2.643-.302-.267-.567-.468-1.07-.462-.37.014-.87.195-.87.195L6.341 4.105l10.498.001z" />
      </svg>
    );
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
            sizes="(max-width: 768px) 100vw, 768px"
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
