import { ArrowUpRight, GitMerge } from "lucide-react";
import { openSource } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function OpenSourceSection() {
  return (
    <Section id="open-source" index="05" title="Open Source">
      <div className="space-y-3">
        {openSource.map((contribution, i) => (
          <Reveal key={contribution.repo} delay={i * 0.05}>
            <article className="rounded-lg border border-edge p-4 transition-colors hover:border-edge-strong sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-mono text-[13.5px] font-semibold">
                  <a
                    href={contribution.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {contribution.repo}
                    <ArrowUpRight className="size-3 text-faint" />
                  </a>
                </h3>
                <span className="font-mono text-[11px] text-accent">
                  {contribution.users}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-faint">{contribution.context}</p>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Merged pull requests">
                {contribution.prs.map((pr) => (
                  <li key={pr.url}>
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tactile inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-muted"
                    >
                      <GitMerge className="size-3 text-purple-400" />
                      {pr.title} · merged
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
