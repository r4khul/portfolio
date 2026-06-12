"use client";

import { useEffect, useState } from "react";
import { GitCommit, Tag } from "lucide-react";

type ReleaseData = {
  tagName: string;
  name: string;
  publishedAt: string;
} | null;

type CommitData = {
  sha: string;
  message: string;
  author: string;
  date: string;
} | null;

export function GithubStats({ repo }: { repo: string }) {
  const [release, setRelease] = useState<ReleaseData>(null);
  const [commit, setCommit] = useState<CommitData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [releaseRes, commitsRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
            next: { revalidate: 3600 } // cache for 1 hour if server-called, but standard client fetch works
          }),
          fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
            next: { revalidate: 3600 }
          }),
        ]);

        if (releaseRes.ok) {
          const data = await releaseRes.json();
          setRelease({
            tagName: data.tag_name,
            name: data.name || data.tag_name,
            publishedAt: data.published_at,
          });
        }

        if (commitsRes.ok) {
          const data = await commitsRes.json();
          if (data && data.length > 0) {
            setCommit({
              sha: data[0].sha.substring(0, 7),
              message: data[0].commit.message.split("\n")[0],
              author: data[0].commit.author.name,
              date: data[0].commit.author.date,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch Github stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [repo]);

  if (loading) {
    return (
      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-edge bg-edge sm:grid-cols-2">
        <div className="bg-background p-5 flex flex-col gap-4 animate-pulse">
          <div className="h-3 w-24 bg-edge rounded"></div>
          <div className="h-7 w-32 bg-edge rounded"></div>
          <div className="h-4 w-20 bg-edge rounded mt-2"></div>
        </div>
        <div className="bg-background p-5 flex flex-col gap-4 animate-pulse">
          <div className="h-3 w-20 bg-edge rounded"></div>
          <div className="h-7 w-48 bg-edge rounded"></div>
          <div className="h-4 w-28 bg-edge rounded mt-2"></div>
        </div>
      </div>
    );
  }

  if (!release && !commit) return null;

  return (
    <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-edge bg-edge sm:grid-cols-2">
      {release && (
        <div className="bg-background p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="font-mono text-[9px] tracking-[0.2em] text-faint uppercase select-none">
              Latest Release
            </span>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-medium tracking-tight text-foreground">
                {release.tagName}
              </span>
              {release.name !== release.tagName && (
                <span className="text-xs text-muted truncate max-w-[150px]">
                  {release.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-faint">
            <Tag className="size-3.5 text-muted" strokeWidth={1.5} />
            <span>
              {new Date(release.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

      {commit && (
        <div className="bg-background p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="font-mono text-[9px] tracking-[0.2em] text-faint uppercase select-none">
              Last Commit
            </span>
            <p className="mt-2.5 text-[13px] leading-snug text-muted line-clamp-2 font-sans font-medium">
              "{commit.message}"
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-faint">
            <div className="flex items-center gap-1.5">
              <GitCommit className="size-3.5 text-muted" strokeWidth={1.5} />
              <span className="bg-surface border border-edge px-1.5 py-0.5 rounded text-[10px] text-muted">
                {commit.sha}
              </span>
            </div>
            <div className="truncate max-w-[120px] text-muted">{commit.author}</div>
          </div>
        </div>
      )}
    </div>
  );
}
