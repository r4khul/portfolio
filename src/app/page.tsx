import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { ExperienceSection } from "@/components/home/experience";
import { ProjectsSection } from "@/components/home/projects";
import { SkillsSection } from "@/components/home/skills";
import { OpenSourceSection } from "@/components/home/open-source";
import { BlogsSection } from "@/components/home/blogs";
import { StoriesSection } from "@/components/home/stories";
import { ContactSection } from "@/components/home/contact";
import { getProjects } from "@/lib/projects";
import { getBlogs } from "@/lib/blogs";
import { getStories } from "@/lib/stories";

export default function Home() {
  const projects = getProjects();
  const blogs = getBlogs();
  const stories = getStories();

  return (
    <main>
      <Hero />
      <About />
      <ExperienceSection />
      <SkillsSection />
      <ProjectsSection projects={projects} />
      <OpenSourceSection />
      <BlogsSection blogs={blogs} />
      <StoriesSection stories={stories} />
      <ContactSection />
    </main>
  );
}
