import { education } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function EducationSection() {
  return (
    <Section id="education" index="06" title="Education">
      <Reveal>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-semibold">
            <a
              href={education.schoolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {education.school}
            </a>
          </h3>
          <span className="font-mono text-[12px] text-faint">{education.period}</span>
        </div>
        <p className="mt-1 text-[13.5px] text-muted">
          {education.degree} · {education.university}
        </p>
        <p className="mt-2 font-mono text-[12px] text-muted">
          CGPA <span className="text-foreground">{education.cgpa}</span>
        </p>
      </Reveal>
    </Section>
  );
}
