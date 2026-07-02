import Script from "next/script";
import { profile, experience, education } from "@/data/profile";
import { Project } from "@/lib/projects";
import { Toy } from "@/lib/toys";
import { Blog } from "@/lib/blogs";

export function JsonLd() {
  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: profile.url,
    sameAs: [
      "https://github.com/r4khul",
      "https://x.com/r4khul",
      "https://www.linkedin.com/in/rakhul/",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: education.school,
      url: education.schoolUrl,
    },
    knowsAbout: [
      "Flutter",
      "Dart",
      "Mobile Development",
      "Android Development",
      "iOS Development",
      "Firebase",
      "React.js",
    ],
    image: `${profile.url}/images/site/pfp.png`,
    description: profile.about.join(" "),
  };

  return (
    <Script
      id="json-ld-person"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personData) }}
    />
  );
}

export function ProjectJsonLd({ project }: { project: Project }) {
  const projectData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description,
    applicationCategory: "MobileApplication",
    operatingSystem: "Android, iOS",
    author: {
      "@type": "Person",
      name: profile.name,
    },
    image: project.cover ? `${profile.url}${project.cover}` : undefined,
    url: `${profile.url}/projects/${project.slug}`,
  };

  return (
    <Script
      id="json-ld-project"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(projectData) }}
    />
  );
}

export function ToyJsonLd({ toy }: { toy: Toy }) {
  const toyData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: toy.title,
    description: toy.description,
    applicationCategory: "UtilityApplication",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    author: {
      "@type": "Person",
      name: profile.name,
      url: profile.url,
    },
    image: toy.cover ? `${profile.url}${toy.cover}` : undefined,
    url: `${profile.url}/projects/toys/${toy.slug}`,
    sameAs: toy.links
      .filter((l) => l.url.startsWith("http"))
      .map((l) => l.url),
  };

  return (
    <Script
      id="json-ld-toy"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(toyData) }}
    />
  );
}

export function BlogPostJsonLd({ blog }: { blog: Blog }) {
  const blogData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description,
    image: blog.cover ? `${profile.url}${blog.cover}` : `${profile.url}/images/site/main-banner.png`,
    author: {
      "@type": "Person",
      name: profile.name,
    },
    datePublished: blog.date,
    url: `${profile.url}/blogs/${blog.slug}`,
  };

  return (
    <Script
      id="json-ld-blog"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogData) }}
    />
  );
}
