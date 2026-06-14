import { memo } from "react";
import { profile } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

// Parse markdown bold syntax (**text**) into React elements
function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export const About = memo(() => {
  return (
    <Section id="about" index="01" title="About">
      <Reveal>
        <div className="max-w-prose space-y-4 text-[15px] leading-relaxed text-muted">
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{parseBold(paragraph)}</p>
          ))}
        </div>
      </Reveal>
    </Section>
  );
});

About.displayName = 'About';
