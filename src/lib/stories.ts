import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getCategorySlug } from "./blog-utils";

const STORIES_DIR = path.join(process.cwd(), "src", "content", "stories");

export type StoryFrontmatter = {
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  number?: number;
  tags?: string[];
  cover?: string;
};

export type Story = StoryFrontmatter & { content: string };

function parseStory(filePath: string): Story {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { ...(data as StoryFrontmatter), content };
}

function findMdxFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdxFiles(fullPath));
    } else if (entry.name.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }
  return results;
}

export function getStories(): Story[] {
  if (!fs.existsSync(STORIES_DIR)) return [];
  return findMdxFiles(STORIES_DIR)
    .map(parseStory)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getStory(slug: string): Story | undefined {
  return getStories().find((s) => s.slug === slug);
}

export function getSeriesNeighbors(slug: string): { prev?: Story; next?: Story } {
  const story = getStory(slug);
  if (!story?.category || typeof story.number !== "number") return {};

  const series = getStories()
    .filter((s) => s.category === story.category && typeof s.number === "number")
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  const index = series.findIndex((s) => s.slug === slug);
  if (index === -1) return {};

  return {
    prev: series[index - 1],
    next: series[index + 1],
  };
}

export function getStoryCategories(): string[] {
  const stories = getStories();
  return [...new Set(stories.map((s) => s.category))];
}

export { getCategorySlug } from "./blog-utils";

export function getStoriesByCategorySlug(slug: string): Story[] {
  return getStories().filter((s) => getCategorySlug(s.category) === slug);
}

export { getReadingTime } from "./reading-time";
