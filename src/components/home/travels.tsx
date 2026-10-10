import { Section } from "@/components/ui/section";
import { TravelAtlas } from "@/components/home/travel/travel-atlas";

export function TravelsSection() {
  return (
    <Section
      id="travels"
      index="08"
      title="Travels"
      action={
        <span className="font-mono text-[11px] tracking-widest text-faint uppercase select-none">
          Atlas
        </span>
      }
    >
      <p className="mb-6 max-w-prose text-[15px] leading-relaxed text-muted">
        Every place I&apos;ve been, drawn on a map built from scratch, one pixel at a time.
        Hover to inspect, drag to pan, click a city to fly there.
      </p>
      <TravelAtlas />
    </Section>
  );
}
