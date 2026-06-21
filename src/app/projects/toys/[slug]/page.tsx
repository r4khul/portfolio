import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Globe } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { getToy, getToys } from "@/lib/toys";
import { profile } from "@/data/profile";
import { MdxContent } from "@/components/mdx-content";
import { ProjectActions } from "@/components/project/project-actions";
import { BackButton } from "@/components/project/back-button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getToys().map((toy) => ({ slug: toy.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const toy = getToy(slug);
  if (!toy) return {};

  const images = toy.cover
    ? [{ url: toy.cover, width: 1200, height: 630, alt: toy.title }]
    : [];

  return {
    title: toy.title,
    description: toy.description,
    alternates: {
      canonical: `/projects/toys/${slug}`,
    },
    openGraph: {
      title: toy.title,
      description: toy.description,
      type: "article",
      url: `${profile.url}/projects/toys/${slug}`,
      siteName: profile.name,
      locale: "en_US",
      images: images.length > 0 ? images : [{ url: "/images/site/main-banner.avif", width: 1200, height: 630, alt: toy.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: toy.title,
      description: toy.description,
      creator: "@r4khul",
      images: toy.cover ? [toy.cover] : ["/images/site/main-banner.avif"],
    },
  };
}

const getLinkIcon = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized.includes("github")) {
    return <FaGithub className="size-3.5 text-muted transition-colors group-hover:text-foreground" />;
  }
  if (normalized.includes("live") || normalized.includes("site") || normalized.includes("demo")) {
    return <Globe className="size-3.5 text-muted transition-colors group-hover:text-foreground" />;
  }
  return <ArrowUpRight className="size-3 text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />;
};

export default async function ToyPage({ params }: Props) {
  const { slug } = await params;
  const toy = getToy(slug);
  if (!toy) notFound();

  return (
    <main>
      <div className="relative h-[141px] overflow-hidden sm:h-[246px]">
        {toy.cover ? (
          <Image
            src={toy.cover}
            alt={`${toy.title} cover`}
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
        <BackButton href="/projects#toys" label="all projects" />

        <header className="mt-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-wide text-faint uppercase">Toy · {toy.year}</span>
          </div>
          <h1 className="mt-3 font-serif text-[38px] leading-none tracking-tight sm:text-[48px]">
            {toy.title}
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
            {toy.description}
          </p>

          <ProjectActions links={toy.links.map((l) => ({ ...l, icon: getLinkIcon(l.label) }))} />

          <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {toy.stack.map((tech) => (
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
        <MdxContent source={toy.content} />
      </article>
    </main>
  );
}
