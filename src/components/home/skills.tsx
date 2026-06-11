import { skills } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function SkillsSection() {
  return (
    <Section id="skills" index="04" title="Stack">
      <div className="space-y-5">
        {skills.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.04}>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              <h3 className="w-44 shrink-0 pt-0.5 font-mono text-[11px] tracking-widest text-faint uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-edge bg-surface px-2 py-1 font-mono text-[12px] text-muted transition-colors hover:border-edge-strong hover:text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
