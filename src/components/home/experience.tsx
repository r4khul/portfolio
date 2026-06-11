import { experience } from "@/data/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function ExperienceSection() {
  return (
    <Section id="experience" index="02" title="Experience">
      <ol className="space-y-10">
        {experience.map((job) => (
          <li key={job.company}>
            <Reveal>
              <article className="relative border-l border-edge pl-6">
                <span
                  aria-hidden
                  className={`absolute top-1.5 -left-[5px] size-2.5 rounded-full border-2 border-background ${
                    job.status === "active" ? "bg-accent" : "bg-faint"
                  }`}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold">
                    <a
                      href={job.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {job.company}
                    </a>
                    {job.status === "active" && (
                      <span className="ml-2 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                        active
                      </span>
                    )}
                  </h3>
                  <span className="font-mono text-[12px] text-faint">{job.period}</span>
                </div>
                <p className="mt-0.5 text-[13px] text-muted">
                  {job.title} · {job.location}
                </p>
                <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-muted">
                  {job.summary}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {job.highlights.map((point) => (
                    <li
                      key={point.slice(0, 32)}
                      className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted"
                    >
                      <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-faint" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
