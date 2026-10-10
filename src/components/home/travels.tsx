import { Section } from "@/components/ui/section";
import { AtlasPreview } from "@/components/home/travel/atlas-preview";
import { homePlace, nativePlace, nowPlace } from "@/data/travel";

export function TravelsSection() {
  return (
    <Section id="travels" index="08" title="Travels">
      <p className="mb-6 max-w-prose text-[15px] leading-relaxed text-muted">
        Born and raised in {homePlace.name}
        {nativePlace ? <>, roots in {nativePlace.name}</> : null}
        {nowPlace ? <>, working out of {nowPlace.name} for now</> : null}. A small map of where
        the road has taken me so far.
      </p>
      <AtlasPreview />
    </Section>
  );
}
