import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, GitCommit, GitMerge, GitPullRequest, Star, Users } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { getOssContribution, getOssContributions, profile } from "@/data/profile";
import { BackButton } from "@/components/project/back-button";
import { OpenSourceList } from "@/components/open-source/open-source-list";
import { Reveal } from "@/components/ui/reveal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getOssContributions().map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const contribution = getOssContribution(slug);
  if (!contribution) return {};

  const title = `${contribution.repo} — Open Source — ${profile.name}`;
  const description = `Merged pull requests, bug fixes, and feature contributions for ${contribution.repo}. ${contribution.context}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/open-source/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${profile.url}/open-source/${slug}`,
      siteName: profile.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/images/site/main-banner.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@r4khul",
      images: ["/images/site/main-banner.png"],
    },
  };
}

export default async function OpenSourceOrgPage({ params }: Props) {
  const { slug } = await params;
  const contribution = getOssContribution(slug);
  if (!contribution) notFound();

  const owner = contribution.repo.split("/")[0];
  const repoName = contribution.repo.split("/")[1] || contribution.repo;
  const avatarUrl = `https://github.com/${owner}.png`;

  const totalPrs = contribution.prs.length;
  const mergedPrs = contribution.prs.filter((pr) => pr.status !== "review").length;
  const reviewPrs = contribution.prs.filter((pr) => pr.status === "review").length;

  return (
    <main>
      <div className="bleed-line px-4 py-8 sm:px-8">
        <BackButton href="/open-source" label="all open source" />

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Image
              src={avatarUrl}
              alt={`${owner} logo`}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover shrink-0 border border-edge shadow-sm"
            />
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint font-medium">
                {owner}
              </span>
              <h1 className="font-serif text-[36px] leading-none tracking-tight sm:text-[46px]">
                {repoName}
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-muted font-sans">
            {contribution.context}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={contribution.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tactile inline-flex items-center gap-2 rounded-md border border-edge bg-surface px-3.5 py-1.5 font-mono text-[12px] font-medium text-foreground transition-colors hover:border-edge-strong"
            >
              <FaGithub className="size-3.5 text-muted" />
              View Repository on GitHub
              <ArrowUpRight className="size-3.5 text-faint" />
            </a>

            {contribution.stats?.users && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-background px-3 py-1.5 font-mono text-[12px] text-accent">
                <Users className="size-3.5" />
                {contribution.stats.users} active users
              </span>
            )}

            {contribution.stats?.stars && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-background px-3 py-1.5 font-mono text-[12px] text-accent">
                <Star className="size-3.5" />
                {contribution.stats.stars} stars
              </span>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Reveal delay={0.05} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint font-semibold truncate">
                Total PRs
              </span>
              <div className="mt-2 flex items-center gap-2 font-mono text-[22px] font-bold text-foreground sm:text-[24px]">
                <GitPullRequest className="size-4 shrink-0 text-muted" />
                {totalPrs}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint font-semibold truncate">
                Merged
              </span>
              <div className="mt-2 flex items-center gap-2 font-mono text-[22px] font-bold text-purple-600 dark:text-purple-400 sm:text-[24px]">
                <GitMerge className="size-4 shrink-0" />
                {mergedPrs}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint font-semibold truncate">
                In Review
              </span>
              <div className="mt-2 flex items-center gap-2 font-mono text-[22px] font-bold text-blue-600 dark:text-blue-400 sm:text-[24px]">
                <GitPullRequest className="size-4 shrink-0" />
                {reviewPrs}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint font-semibold truncate">
                Contributions
              </span>
              <div className="mt-2 flex items-center gap-2 font-mono text-[22px] font-bold text-emerald-600 dark:text-emerald-400 sm:text-[24px]">
                <GitCommit className="size-4 shrink-0" />
                {contribution.stats?.contributions || `${totalPrs}+`}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="bleed-line px-4 pt-6 pb-14 sm:px-8 sm:pt-8">
        <div className="mb-4 font-mono text-[12px] uppercase tracking-wider text-faint font-semibold">
          Pull Requests & Contributions ({totalPrs})
        </div>
        <OpenSourceList contributions={[contribution]} limitPrsPerCard={false} />
      </div>
    </main>
  );
}
