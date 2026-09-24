import { NextResponse } from "next/server";

type ContributionDay = { date: string; count: number };

function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
}

function parseGitHubCalendar(html: string): {
  contributions: ContributionDay[];
  totalContributions: number;
} {
  const labels = new Map<string, number>();

  for (const match of html.matchAll(/<tool-tip\b[^>]*>[\s\S]*?<\/tool-tip>/g)) {
    const tag = match[0];
    const id = attribute(tag, "for");
    const label = tag.replace(/<[^>]+>/g, "").trim();
    const count = label.match(/^([\d,]+) contributions?\b/);

    if (id && (count || /^No contributions\b/.test(label))) {
      labels.set(id, count ? Number(count[1].replaceAll(",", "")) : 0);
    }
  }

  const contributions: ContributionDay[] = [];
  const dates = new Set<string>();

  for (const match of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = match[0];
    const date = attribute(tag, "data-date");
    if (!date) continue;

    const id = attribute(tag, "id");
    const count = id === undefined ? undefined : labels.get(id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || count === undefined || dates.has(date)) {
      throw new Error("GitHub contribution calendar has an invalid day");
    }

    dates.add(date);
    contributions.push({ date, count });
  }

  const heading = html.match(/<h2\b[^>]*\bid="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/);
  const headingText = heading?.[1].replace(/<[^>]+>/g, "").trim();
  const headingCount = headingText?.match(/^([\d,]+)\s+contributions?\b/);
  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);

  if (
    contributions.length < 365 ||
    contributions.length > 371 ||
    !headingCount ||
    totalContributions !== Number(headingCount[1].replaceAll(",", ""))
  ) {
    throw new Error("GitHub contribution calendar is incomplete");
  }

  contributions.sort((a, b) => a.date.localeCompare(b.date));
  return { contributions, totalContributions };
}

export async function GET() {
  try {
    // GitHub's public profile calendar includes the visible private contribution
    // counts and uses the same day boundaries visitors see on github.com.
    const response = await fetch("https://github.com/users/r4khul/contributions", {
      headers: { Accept: "text/html" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`GitHub calendar request failed: ${response.status}`);
    }

    return NextResponse.json(parseGitHubCalendar(await response.text()));
  } catch (error) {
    console.error("Failed to load GitHub contribution calendar:", error);
    return NextResponse.json({ error: "GitHub contributions are unavailable" }, { status: 502 });
  }
}
