import { memo } from "react";
import type { IconType } from "react-icons";
import { FaJava } from "react-icons/fa6";
import { SiC, SiCplusplus, SiDart, SiJavascript, SiPython } from "react-icons/si";
import { skills } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const languageIcons: Record<string, IconType> = {
  Dart: SiDart,
  JavaScript: SiJavascript,
  C: SiC,
  "C++": SiCplusplus,
  Java: FaJava,
  Python: SiPython,
};

export const SkillsSection = memo(() => {
  return (
    <Section id="skills" index="03" title="Skills">
      <div className="space-y-5">
        {skills.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.04}>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              <h3 className="w-44 shrink-0 pt-0.5 font-mono text-[11px] tracking-widest text-faint uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => {
                  const Icon = group.label === "Languages" ? languageIcons[item] : undefined;
                  return (
                    <li
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-surface px-2 py-1 font-mono text-[12px] text-muted transition-colors hover:border-edge-strong hover:text-foreground"
                    >
                      {Icon && <Icon aria-hidden="true" focusable="false" className="size-3.5 shrink-0" />}
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
});

SkillsSection.displayName = 'SkillsSection';
