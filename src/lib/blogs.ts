import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { getCategorySlug } from "./blog-utils";

const BLOGS_DIR = path.join(process.cwd(), "src", "content", "blog");

export type BlogFrontmatter = {
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  number?: number;
  tags?: string[];
  cover?: string;
};

export type Blog = BlogFrontmatter & { content: string };

function parseBlog(filePath: string): Blog {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { ...(data as BlogFrontmatter), content };
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

let cachedBlogs: Blog[] | null = null;
let lastBlogsCacheTime = 0;
const BLOGS_CACHE_TTL_DEV = 2000; // 2 seconds TTL in dev

function loadBlogsRaw(): Blog[] {
  if (!fs.existsSync(BLOGS_DIR)) return [];
  return findMdxFiles(BLOGS_DIR)
    .map(parseBlog)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getBlogs = cache((): Blog[] => {
  const now = Date.now();
  const isProd = process.env.NODE_ENV === "production";

  if (cachedBlogs && (isProd || now - lastBlogsCacheTime < BLOGS_CACHE_TTL_DEV)) {
    return cachedBlogs;
  }

  cachedBlogs = loadBlogsRaw();
  lastBlogsCacheTime = now;
  return cachedBlogs;
});

export function getBlog(slug: string): Blog | undefined {
  return getBlogs().find((b) => b.slug === slug);
}

export function getSeriesNeighbors(slug: string): { prev?: Blog; next?: Blog } {
  const blog = getBlog(slug);
  if (!blog?.category || typeof blog.number !== "number") return {};

  const series = getBlogs()
    .filter((b) => b.category === blog.category && typeof b.number === "number")
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  const index = series.findIndex((b) => b.slug === slug);
  if (index === -1) return {};

  return {
    prev: series[index - 1],
    next: series[index + 1],
  };
}

export function getBlogCategories(): string[] {
  const blogs = getBlogs();
  return [...new Set(blogs.map((b) => b.category))];
}

export { getCategorySlug } from "./blog-utils";

export function getBlogsByCategorySlug(slug: string): Blog[] {
  return getBlogs().filter((b) => getCategorySlug(b.category) === slug);
}

export { getReadingTime } from "./reading-time";
