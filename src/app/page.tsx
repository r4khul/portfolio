import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { ExperienceSection } from "@/components/home/experience";
import { ProjectsSection } from "@/components/home/projects";
import { SkillsSection } from "@/components/home/skills";
import { OpenSourceSection } from "@/components/home/open-source";
import { ContactSection } from "@/components/home/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <OpenSourceSection />
      <ContactSection />
    </main>
  );
}
