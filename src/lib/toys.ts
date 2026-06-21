import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const TOYS_DIR = path.join(process.cwd(), "src", "content", "toys");

export type ToyFrontmatter = {
  title: string;
  slug: string;
  description: string;
  stack: string[];
  links: { label: string; url: string }[];
  year: string;
  cover?: string;
};

export type Toy = ToyFrontmatter & { content: string };

function parseToy(filename: string): Toy {
  const raw = fs.readFileSync(path.join(TOYS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  return { ...(data as ToyFrontmatter), content };
}

export function getToys(): Toy[] {
  return fs
    .readdirSync(TOYS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(parseToy);
}

export function getToy(slug: string): Toy | undefined {
  return getToys().find((t) => t.slug === slug);
}
