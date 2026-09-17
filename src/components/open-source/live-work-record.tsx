"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GitMerge, GitPullRequest, Radio } from "lucide-react";
import { type OssContribution, type OssPr } from "@/data/profile";
import { OpenSourceList } from "@/components/open-source/open-source-list";
import { Reveal } from "@/components/ui/reveal";

type WatchedPullRequest = OssPr & {
  updatedAt: string;
};

type WatcherResponse = {
  pullRequests: WatchedPullRequest[];
  syncedAt: string;
};

type WatchState = "loading" | "live" | "fallback";

const REFRESH_INTERVAL = 15 * 60 * 1000;

export function LiveWorkRecord({ contribution }: { contribution: OssContribution }) {
  const [pullRequests, setPullRequests] = useState(contribution.prs);
  const [watchState, setWatchState] = useState<WatchState>("loading");
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const sync = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/open-source/${contribution.slug}`, { signal });
      if (!response.ok) throw new Error("Watcher response was not successful.");

      const data = (await response.json()) as WatcherResponse;
      const savedByUrl = new Map(contribution.prs.map((pr) => [pr.url, pr]));
      const freshPullRequests = data.pullRequests.map((pr) => ({
        ...pr,
        // Keep the hand-written impact note when a saved PR already has one.
        description: savedByUrl.get(pr.url)?.description || pr.description,
      }));

      setPullRequests(freshPullRequests);
      setSyncedAt(data.syncedAt);
      setWatchState("live");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setWatchState("fallback");
    }
  }, [contribution.prs, contribution.slug]);

  useEffect(() => {
    const controller = new AbortController();
    const initialSync = window.setTimeout(() => void sync(controller.signal), 0);

    const interval = window.setInterval(() => void sync(), REFRESH_INTERVAL);
    return () => {
      controller.abort();
      window.clearTimeout(initialSync);
      window.clearInterval(interval);
    };
  }, [sync]);

  const liveContribution = useMemo(
    () => ({ ...contribution, prs: pullRequests }),
    [contribution, pullRequests],
  );
  const mergedPullRequests = pullRequests.filter((pr) => pr.status !== "review").length;
  const reviewPullRequests = pullRequests.length - mergedPullRequests;
  const lastSyncedLabel = syncedAt
    ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(syncedAt))
    : null;

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Reveal delay={0.05} className="h-full">
          <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-faint">Tracked PRs</span>
            <div className="mt-2 flex items-center gap-2 font-mono text-[22px] font-bold text-foreground sm:text-[24px]">
              <GitPullRequest className="size-4 shrink-0 text-muted" />
              {pullRequests.length}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="h-full">
          <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-faint">Merged</span>
            <div className="mt-2 flex items-center gap-2 font-mono text-[22px] font-bold text-purple-600 dark:text-purple-400 sm:text-[24px]">
              <GitMerge className="size-4 shrink-0" />
              {mergedPullRequests}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="h-full">
          <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-faint">Under review</span>
            <div className="mt-2 flex items-center gap-2 font-mono text-[22px] font-bold text-blue-600 dark:text-blue-400 sm:text-[24px]">
              <GitPullRequest className="size-4 shrink-0" />
              {reviewPullRequests}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2} className="h-full">
          <div className="flex h-full flex-col justify-between rounded-lg border border-edge bg-surface/50 p-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-faint">GitHub watcher</span>
            <div className="mt-2 flex items-center gap-2 font-mono text-[13px] font-semibold text-foreground">
              <Radio className={`size-3.5 ${watchState === "live" ? "animate-pulse text-emerald-500" : "text-faint"}`} />
              {watchState === "live" ? "live" : watchState === "loading" ? "syncing" : "saved"}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[12px] font-semibold uppercase tracking-wider text-faint">
          Pull Requests & Contributions ({pullRequests.length})
        </div>
        <p className="inline-flex items-center gap-1.5 font-mono text-[10px] text-faint">
          <Radio className={`size-3 ${watchState === "live" ? "text-emerald-500" : "text-faint"}`} />
          {watchState === "live"
            ? `Watching GitHub. Updated ${lastSyncedLabel || "now"}.`
            : watchState === "loading"
              ? "Checking GitHub for new work."
              : "Showing the saved record until GitHub is available."}
        </p>
      </div>
      <div className="mt-4">
        <OpenSourceList contributions={[liveContribution]} limitPrsPerCard={false} />
      </div>
    </>
  );
}
