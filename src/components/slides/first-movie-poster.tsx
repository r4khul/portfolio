import { AvengerRide } from "./first-movie-avenger";
import { StillLife } from "./first-movie-props";
import { GROUND, PosterNight } from "./memory-poster";

/**
 * My First Movie & a Burger's poster, on the same 1200×630 night street as
 * the first memory's: the three of us riding home under the lamp, and the
 * ticket, the burger and the turtle standing in front.
 *
 * Plain drawing only, for the page and the share-image renderer alike.
 */
export function MoviePosterArt() {
  return (
    <g>
      <PosterNight />
      <g opacity=".62" transform={`translate(604 ${GROUND}) scale(.62)`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <AvengerRide x={0} y={0} home />
      </g>
      <g transform="translate(20 24) scale(1.4)" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <StillLife />
      </g>
    </g>
  );
}
