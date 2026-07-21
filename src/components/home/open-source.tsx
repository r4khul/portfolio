"use client";

import { memo } from "react";
import Image from "next/image";
import { ArrowUpRight, GitMerge, GitPullRequest } from "lucide-react";
import { openSource } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

export const OpenSourceSection = memo(() => {
  const { playClick } = useAudioFeedback();

  return (
    <Section id="open-source" index="05" title="Open Source">
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
                  <span className="font-mono text-[11px] text-accent">
                    {contribution.users}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] text-faint">{contribution.context}</p>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Pull requests">
                  {contribution.prs.map((pr) => {
                    const isReview = pr.status === "review";
                    return (
                      <li key={pr.url}>
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={playClick}
                          className="tactile inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-muted"
                        >
                          {isReview ? (
                            <GitPullRequest className="size-3 text-blue-500 dark:text-blue-400" />
                          ) : (
                            <GitMerge className="size-3 text-purple-400" />
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
