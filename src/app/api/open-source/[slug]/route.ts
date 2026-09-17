import { NextResponse } from "next/server";

const WATCHED_REPOSITORIES = {
  ente: {
    repository: "ente-io/ente",
    author: "r4khul",
  },
} as const;

type WatchedSlug = keyof typeof WATCHED_REPOSITORIES;

type GitHubSearchItem = {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  body: string | null;
  updated_at: string;
  pull_request?: {
    merged_at: string | null;
  };
};

type GitHubSearchResponse = {
  items: GitHubSearchItem[];
};

function isWatchedSlug(slug: string): slug is WatchedSlug {
  return slug in WATCHED_REPOSITORIES;
}

function preview(body: string | null, status: "merged" | "review") {
  const text = body?.replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 500);

  return status === "merged"
    ? "Merged contribution. Open the pull request on GitHub for the full change set."
    : "Open pull request, currently under review.";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!isWatchedSlug(slug)) {
    return NextResponse.json({ error: "No watcher is configured for this project." }, { status: 404 });
  }

  const token = process.env.GITHUB_PAT;
  if (!token) {
    return NextResponse.json({ error: "GitHub watcher is not configured." }, { status: 503 });
  }

  const watched = WATCHED_REPOSITORIES[slug];
  const endpoint = new URL("https://api.github.com/search/issues");
  endpoint.searchParams.set("q", `repo:${watched.repository} author:${watched.author} is:pr`);
  endpoint.searchParams.set("sort", "updated");
  endpoint.searchParams.set("order", "desc");
  endpoint.searchParams.set("per_page", "100");

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2026-03-10",
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      console.error("GitHub contribution watcher failed:", response.status);
      return NextResponse.json({ error: "GitHub watcher could not load contributions." }, { status: 502 });
    }

    const result = (await response.json()) as GitHubSearchResponse;
    const pullRequests = result.items
      // Closed PRs are deliberately excluded unless GitHub marks them as merged.
      .filter((item) => item.state === "open" || Boolean(item.pull_request?.merged_at))
      .map((item) => {
        const status = item.state === "open" ? "review" : "merged";

        return {
          title: `PR #${item.number}`,
          fullTitle: item.title,
          url: item.html_url,
          status,
          description: preview(item.body, status),
          updatedAt: item.updated_at,
        };
      });

    return NextResponse.json(
      {
        pullRequests,
        syncedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("GitHub contribution watcher failed:", error);
    return NextResponse.json({ error: "GitHub watcher could not load contributions." }, { status: 502 });
  }
}
