"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  GitMerge,
  GitPullRequest,
  Search,
  Filter,
  Users,
  Star
} from "lucide-react";
import { openSource, type OssContribution, type OssPr } from "@/data/profile";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

interface OpenSourceListProps {
  contributions?: OssContribution[];
  limitPrsPerCard?: boolean;
}

export function OpenSourceList({
  contributions = openSource,
  limitPrsPerCard = true,
}: OpenSourceListProps) {
  const { playClick } = useAudioFeedback();
  const [expandedPrs, setExpandedPrs] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "merged" | "review">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const togglePr = (prUrl: string) => {
    playClick();
    setExpandedPrs((prev) => ({
      ...prev,
      [prUrl]: !prev[prUrl],
    }));
  };

  // Filter contributions and PRs based on user search and filter tab
  const filteredContributions = useMemo(() => {
    return contributions
      .map((item) => {
        const matchingPrs = item.prs.filter((pr) => {
          const isReview = pr.status === "review";
          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "merged" && !isReview) ||
            (statusFilter === "review" && isReview);

          const query = searchQuery.toLowerCase().trim();
          const matchesQuery =
            !query ||
            pr.title.toLowerCase().includes(query) ||
            pr.fullTitle.toLowerCase().includes(query) ||
            pr.description.toLowerCase().includes(query) ||
            item.repo.toLowerCase().includes(query);

          return matchesStatus && matchesQuery;
        });

        return { ...item, prs: matchingPrs };
      })
      .filter((item) => item.prs.length > 0);
  }, [contributions, statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint select-none" />
          <input
            type="text"
            placeholder="Search PRs, repos, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-edge bg-background py-1.5 pl-9 pr-3 text-[13px] text-foreground placeholder:text-faint focus:border-edge-strong focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" aria-label="Status filter">
          <Filter className="size-3.5 text-faint shrink-0 mr-1 hidden sm:block" />
          {(["all", "merged", "review"] as const).map((filterKey) => {
            const isActive = statusFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => {
                  playClick();
                  setStatusFilter(filterKey);
                }}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] capitalize transition-colors select-none ${
                  isActive
                    ? "bg-foreground text-background font-medium"
                    : "border border-edge bg-background text-muted hover:border-edge-strong hover:text-foreground"
                }`}
              >
                {filterKey}
              </button>
            );
          })}
        </div>
      </div>

      {filteredContributions.length === 0 ? (
        <div className="rounded-lg border border-edge bg-surface p-8 text-center">
          <p className="text-[14px] text-muted">No pull requests matching your filter.</p>
          <button
            onClick={() => {
              playClick();
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="mt-3 font-mono text-[12px] text-accent hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredContributions.map((contribution, repoIndex) => {
            const owner = contribution.repo.split("/")[0];
            const avatarUrl = `https://github.com/${owner}.png`;
            const hasMorePrs = limitPrsPerCard && contribution.prs.length > 4;
            const visiblePrs = hasMorePrs ? contribution.prs.slice(0, 4) : contribution.prs;
            const remainingCount = contribution.prs.length - visiblePrs.length;

            return (
              <Reveal key={contribution.repo} delay={repoIndex * 0.05}>
                <section className="rounded-lg border border-edge bg-background overflow-hidden">
                  {/* Repository Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge bg-surface/50 px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-3">
                      <Image
                        src={avatarUrl}
                        alt={`${owner} logo`}
                        width={24}
                        height={24}
                        className="size-6 rounded-full object-cover shrink-0 border border-edge"
                      />
                      <div>
                        <h2 className="font-mono text-[14px] font-semibold tracking-tight">
                          <Link
                            href={`/open-source/${contribution.slug}`}
                            onClick={playClick}
                            className="inline-flex items-center gap-1.5 hover:underline"
                          >
                            {contribution.repo}
                          </Link>
                          <a
                            href={contribution.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={playClick}
                            className="ml-1.5 inline-flex items-center text-faint hover:text-foreground"
                            title="Open on GitHub"
                          >
                            <ArrowUpRight className="size-3" />
                          </a>
                        </h2>
                        <p className="text-[12px] text-faint">{contribution.context}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contribution.stats?.users && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-edge bg-background px-2.5 py-0.5 font-mono text-[11px] text-accent">
                          <Users className="size-3" />
                          {contribution.stats.users}
                        </span>
                      )}
                      {contribution.stats?.stars && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-edge bg-background px-2.5 py-0.5 font-mono text-[11px] text-accent">
                          <Star className="size-3" />
                          {contribution.stats.stars}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pull Requests List */}
                  <div className="divide-y divide-edge">
                    {visiblePrs.map((pr) => {
                      const isExpanded = !!expandedPrs[pr.url];
                      const isReview = pr.status === "review";

                      return (
                        <div key={pr.url} className="group transition-colors hover:bg-surface/40">
                          {/* Row Item Header */}
                          <div
                            onClick={() => togglePr(pr.url)}
                            className="flex cursor-pointer items-start justify-between gap-3 p-4 sm:px-5 sm:py-4"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Status Badge */}
                              <span className="mt-0.5 inline-flex items-center gap-1 shrink-0 rounded px-2 py-0.5 font-mono text-[10.5px]">
                                {isReview ? (
                                  <span className="inline-flex items-center gap-1 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-blue-600 dark:text-blue-300">
                                    <GitPullRequest className="size-3" />
                                    review
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-purple-600 dark:text-purple-300">
                                    <GitMerge className="size-3" />
                                    merged
                                  </span>
                                )}
                              </span>

                              {/* PR Details Summary */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                  <span className="font-mono text-[12px] font-medium text-muted shrink-0">
                                    {pr.title}
                                  </span>
                                  <h3 className="text-[13.5px] font-medium text-foreground tracking-tight line-clamp-1 sm:line-clamp-none">
                                    {pr.fullTitle}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            {/* Actions & Accordion Toggle */}
                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                              <a
                                href={pr.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playClick();
                                }}
                                className="rounded p-1 text-faint transition-colors hover:bg-surface hover:text-foreground"
                                title="Open on GitHub"
                              >
                                <ArrowUpRight className="size-4" />
                              </a>
                              <button
                                type="button"
                                aria-label="Toggle details"
                                className="rounded p-1 text-faint transition-colors hover:bg-surface hover:text-foreground"
                              >
                                <ChevronDown
                                  className={`size-4 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180 text-foreground" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Accordion / Dropdown Expanded Content */}
                          {isExpanded && (
                            <div className="border-t border-edge/60 bg-surface/70 px-4 py-4 sm:px-5 sm:py-4.5">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-[11px] uppercase tracking-wider text-faint font-semibold">
                                    Overview & Impact
                                  </span>
                                  <span className="font-mono text-[11px] text-muted">
                                    {contribution.repo}
                                  </span>
                                </div>
                                <p className="text-[13.5px] leading-relaxed text-muted font-sans">
                                  {pr.description}
                                </p>
                                <div className="pt-2">
                                  <a
                                    href={pr.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={playClick}
                                    className="tactile inline-flex items-center gap-1.5 rounded border border-edge bg-background px-3 py-1.5 font-mono text-[11.5px] text-foreground hover:border-edge-strong"
                                  >
                                    View Pull Request on GitHub
                                    <ArrowUpRight className="size-3.5 text-faint" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Bottom Footer Bar for Repos with > 4 PRs */}
                  {hasMorePrs && (
                    <div className="border-t border-edge bg-surface/40 px-4 py-3 sm:px-5">
                      <Link
                        href={`/open-source/${contribution.slug}`}
                        onClick={playClick}
                        className="group flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <span className="rounded border border-edge bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                            +{remainingCount} more
                          </span>
                          <span>View all {contribution.prs.length} pull requests</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground group-hover:underline">
                          View organization page
                          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </Link>
                    </div>
                  )}
                </section>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

