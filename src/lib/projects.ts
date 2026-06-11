import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "src", "content", "projects");

export type ProjectFrontmatter = {
  title: string;
  slug: string;
  order: number;
  description: string;
  type: string;
  status: string;
  stack: string[];
  links: { label: string; url: string }[];
  year: string;
  cover?: string;
};

export type Project = ProjectFrontmatter & { content: string };

function parseProject(filename: string): Project {
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  return { ...(data as ProjectFrontmatter), content };
}

export function getProjects(): Project[] {
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(parseProject)
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
