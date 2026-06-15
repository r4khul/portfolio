import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { getBlogs } from "@/lib/blogs";
import { profile } from "@/data/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects().map((project) => ({
    url: `${profile.url}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogs = getBlogs().map((blog) => ({
    url: `${profile.url}/blogs/${blog.slug}`,
    lastModified: new Date(blog.date),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: profile.url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${profile.url}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...projects,
    ...blogs,
  ];
}
