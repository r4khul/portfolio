import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { ExperienceSection } from "@/components/home/experience";
import { ProjectsSection } from "@/components/home/projects";
import { SkillsSection } from "@/components/home/skills";
import { OpenSourceSection } from "@/components/home/open-source";
import { BlogsSection } from "@/components/home/blogs";
import { ContactSection } from "@/components/home/contact";
import { getProjects } from "@/lib/projects";

export default function Home() {
  const projects = getProjects();

  return (
    <main>
      <Hero />
      <About />
      <ExperienceSection />
      <SkillsSection />
      <ProjectsSection projects={projects} />
      <OpenSourceSection />
      <BlogsSection />
      <ContactSection />
    </main>
  );
}
