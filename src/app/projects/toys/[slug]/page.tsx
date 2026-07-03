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
import { ToyJsonLd } from "@/components/site/json-ld";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getToys().map((toy) => ({ slug: toy.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const toy = getToy(slug);
  if (!toy) return {};

  const ogImage = toy.cover
    ? { url: toy.cover, width: 1200, height: 630, alt: toy.title }
    : { url: "/images/site/main-banner.png", width: 1200, height: 630, alt: toy.title };

  const liveLink = toy.links.find((l) =>
    l.label.toLowerCase().includes("live") ||
    l.label.toLowerCase().includes("site")
  );

  return {
    title: toy.title,
    description: toy.description,
    authors: [{ name: profile.name, url: profile.url }],
    keywords: [
      toy.title,
      ...toy.stack,
      "toy project",
      "side project",
      profile.name,
      "rakhul",
    ],
    alternates: {
      canonical: `/projects/toys/${slug}`,
    },
    openGraph: {
      title: `${toy.title} — ${profile.name}`,
      description: toy.description,
      type: "article",
      url: `${profile.url}/projects/toys/${slug}`,
      siteName: profile.name,
      locale: "en_US",
      authors: [profile.name],
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${toy.title} — ${profile.name}`,
      description: toy.description,
      creator: "@r4khul",
      images: [ogImage.url],
    },
    ...(liveLink && {
      metadataBase: new URL(profile.url),
    }),
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

export default async function ToyPage({ params }: Props) {
  const { slug } = await params;
  const toy = getToy(slug);
  if (!toy) notFound();

  return (
    <main>
      <ToyJsonLd toy={toy} />
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
