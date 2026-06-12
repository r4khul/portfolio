import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { profile } from "@/data/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects().map((project) => ({
    url: `${profile.url}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: profile.url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...projects,
  ];
}
