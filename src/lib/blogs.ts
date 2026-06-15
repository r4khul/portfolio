import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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

export function getBlogs(): Blog[] {
  if (!fs.existsSync(BLOGS_DIR)) return [];
  return findMdxFiles(BLOGS_DIR)
    .map(parseBlog)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlog(slug: string): Blog | undefined {
  return getBlogs().find((b) => b.slug === slug);
}

export function getBlogCategories(): string[] {
  const blogs = getBlogs();
  return [...new Set(blogs.map((b) => b.category))];
}

export { getReadingTime } from "./reading-time";
