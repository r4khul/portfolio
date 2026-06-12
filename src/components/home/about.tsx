import { memo } from "react";
import { profile } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export const About = memo(() => {
  return (
    <Section id="about" index="01" title="About">
      <Reveal>
        <div className="max-w-prose space-y-4 text-[15px] leading-relaxed text-muted">
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </Reveal>
    </Section>
  );
});

About.displayName = 'About';
