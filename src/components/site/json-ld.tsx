import { profile, experience, education } from "@/data/profile";
import { Project } from "@/lib/projects";
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
    <script
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(projectData) }}
    />
  );
}

export function BlogPostJsonLd({ blog }: { blog: Blog }) {
  const blogData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description,
    author: {
      "@type": "Person",
      name: profile.name,
    },
    datePublished: blog.date,
    url: `${profile.url}/blog/${blog.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogData) }}
    />
  );
}
