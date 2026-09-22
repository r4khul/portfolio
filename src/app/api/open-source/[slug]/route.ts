import { NextResponse } from "next/server";

const WATCHED_REPOSITORIES = {
  ente: {
    repository: "ente/ente",
    author: "r4khul",
  },
  "traccar-client": {
    repository: "traccar/traccar-client",
    author: "r4khul",
  },
  "lichess-mobile": {
    repository: "lichess-org/mobile",
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

const MAX_DESCRIPTION_LENGTH = 1_600;

function preview(body: string | null, status: "merged" | "review") {
  const markdown = body?.trim();
  if (markdown) {
    if (markdown.length <= MAX_DESCRIPTION_LENGTH) return markdown;

    const truncated = markdown.slice(0, MAX_DESCRIPTION_LENGTH).replace(/\s+\S*$/, "").trimEnd();
    return `${truncated}\n\n…`;
  }

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

  const watched = WATCHED_REPOSITORIES[slug];
  const endpoint = new URL("https://api.github.com/search/issues");
  endpoint.searchParams.set("q", `repo:${watched.repository} author:${watched.author} is:pr`);
  endpoint.searchParams.set("sort", "updated");
  endpoint.searchParams.set("order", "desc");
  endpoint.searchParams.set("per_page", "100");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Portfolio-App",
  };

  const token = process.env.GITHUB_PAT;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers,
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
