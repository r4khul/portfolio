import { Section } from "@/components/ui/section";
import { AtlasPreview } from "@/components/home/travel/atlas-preview";
import { CityLink } from "@/components/home/travel/city-glyphs";
import { homePlace, nativePlace, nowPlace } from "@/data/travel";

export function TravelsSection() {
  return (
    <Section id="travels" index="08" title="Travels">
      <p className="mb-6 max-w-prose text-[15px] leading-[1.8] text-muted">
        Born and raised in <CityLink id={homePlace.id}>{homePlace.name}</CityLink>
        {nativePlace ? (
          <>
            , roots in <CityLink id={nativePlace.id}>{nativePlace.name}</CityLink>
          </>
        ) : null}
        {nowPlace ? (
          <>
            , and working out of <CityLink id={nowPlace.id}>{nowPlace.name}</CityLink> for now
          </>
        ) : null}
        . A small map of where the road has taken me so far.
      </p>
      <AtlasPreview />
    </Section>
  );
}
