import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Pin } from "lucide-react";
import { getProjects } from "@/lib/projects";
import { getToys } from "@/lib/toys";
import { profile } from "@/data/profile";
import { BackButton } from "@/components/project/back-button";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A collection of tools, apps, and experiments I've built, focusing on mobile engineering and performance.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: `Projects — ${profile.name}`,
    description:
      "A collection of tools, apps, and experiments I've built, focusing on mobile engineering and performance.",
    url: `${profile.url}/projects`,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/site/main-banner.png",
        width: 1200,
        height: 630,
        alt: `Projects — ${profile.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Projects — ${profile.name}`,
    description: "A collection of tools, apps, and experiments I've built, focusing on mobile engineering and performance.",
    creator: "@r4khul",
    images: ["/images/site/main-banner.png"],
  },
};

export default function ProjectsPage() {
  const projects = getProjects();
  const toys = getToys();

  return (
    <main>
      <div className="bleed-line px-4 py-8 sm:px-8">
        <BackButton href="/#projects" label="home" />
        <header className="mt-6">
          <h1 className="font-serif text-[38px] leading-none tracking-tight sm:text-[48px]">
            Projects
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            A collection of tools, apps, and experiments I've built, focusing on
            mobile engineering, architecture, and shipping software people actually use.
          </p>
        </header>
      </div>

      <div className="bleed-line px-4 pt-8 pb-14 sm:px-8 sm:pt-10">
        <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge sm:grid-cols-2">
          {projects.map((project, index) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group flex h-full flex-col bg-background transition-colors hover:bg-surface"
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
          ))}
        </div>
      </div>

      {toys.length > 0 && (
        <div id="toys" className="bleed-line px-4 pt-8 pb-14 sm:px-8 scroll-mt-4">
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-[11px] tracking-widest text-faint select-none">→</span>
            <div>
              <h2 className="font-serif text-[26px] leading-none tracking-tight sm:text-[28px]">
                Toys
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                Simple tools built to scratch a specific itch.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-edge bg-edge divide-y divide-edge">
            {toys.map((toy) => (
              <Link
                key={toy.slug}
                href={`/projects/toys/${toy.slug}`}
                className="group flex flex-col gap-4 bg-background p-4 transition-colors hover:bg-surface sm:flex-row sm:items-start sm:gap-5 sm:p-5"
              >
                {toy.cover && (
                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-md border border-edge sm:w-[200px]">
                    <Image
                      src={toy.cover}
                      alt={`${toy.title} thumbnail`}
                      fill
                      sizes="(min-width: 640px) 200px, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[14.5px] font-semibold tracking-tight">{toy.title}</h3>
                    <ArrowUpRight className="size-3.5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-muted">{toy.description}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tech stack">
                    {toy.stack.slice(0, 5).map((tech) => (
                      <li
                        key={tech}
                        className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10.5px] text-muted"
                      >
                        {tech}
                      </li>
                    ))}
                    {toy.stack.length > 5 && (
                      <li className="px-1 py-0.5 font-mono text-[10.5px] text-faint">
                        +{toy.stack.length - 5}
                      </li>
                    )}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
