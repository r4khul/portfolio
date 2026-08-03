"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GitMerge, GitPullRequest, Users, Star } from "lucide-react";
import { openSource } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

export const OpenSourceSection = memo(() => {
  const { playClick } = useAudioFeedback();

  return (
    <Section
      id="open-source"
      index="05"
      title="Open Source"
      action={
        <Link
          href="/open-source"
          onClick={playClick}
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          all contributions
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      }
    >
      <div className="space-y-3">
        {openSource.map((contribution, i) => {
          const owner = contribution.repo.split("/")[0];
          const avatarUrl = `https://github.com/${owner}.png`;
          return (
            <Reveal key={contribution.repo} delay={i * 0.05}>
              <article className="rounded-lg border border-edge p-4 transition-colors hover:border-edge-strong sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-mono text-[13.5px] font-semibold">
                    <a
                      href={contribution.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playClick}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <Image
                        src={avatarUrl}
                        alt={`${owner} avatar`}
                        width={20}
                        height={20}
                        className="size-5 rounded-full object-cover shrink-0"
                      />
                      {contribution.repo}
                      <ArrowUpRight className="size-3 text-faint" />
                    </a>
                  </h3>
                  <div className="flex items-center gap-2.5 font-mono text-[11px] text-accent">
                    {contribution.stats?.users && (
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {contribution.stats.users}
                      </span>
                    )}
                    {contribution.stats?.stars && (
                      <span className="flex items-center gap-1">
                        <Star className="size-3" />
                        {contribution.stats.stars}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-[12.5px] text-faint">{contribution.context}</p>
                <ul className="mt-3 flex overflow-x-auto gap-2 scrollbar-none pb-0.5" aria-label="Pull requests">
                  {contribution.prs.map((pr) => {
                    const isReview = pr.status === "review";
                    return (
                      <li key={pr.url} className="shrink-0">
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={playClick}
                          className="tactile inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-muted whitespace-nowrap"
                        >
                          {isReview ? (
                            <GitPullRequest className="size-3 text-blue-500 dark:text-blue-400 shrink-0" />
                          ) : (
                            <GitMerge className="size-3 text-purple-400 shrink-0" />
                          )}
                          {pr.title} · {isReview ? "under review" : "merged"}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
});

OpenSourceSection.displayName = 'OpenSourceSection';
