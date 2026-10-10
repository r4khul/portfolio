import { Section } from "@/components/ui/section";
import { AtlasPreview } from "@/components/home/travel/atlas-preview";

export function TravelsSection() {
  return (
    <Section id="travels" index="08" title="Travels">
      <p className="mb-6 max-w-prose text-[15px] leading-relaxed text-muted">
        Every line starts at home. A small map of where the road has taken me so far.
      </p>
      <AtlasPreview />
    </Section>
  );
}
