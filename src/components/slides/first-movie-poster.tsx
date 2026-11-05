import { AvengerRide } from "./first-movie-avenger";
import { Burger, Clapboard, Turtle } from "./first-movie-props";
import { GROUND, PosterNight } from "./memory-poster";

/**
 * First Movie & a Burger's poster, on the same 1200×630 night street as the
 * first memory's: the three of us riding home under the lamp, and, up and to
 * the right of it as the first poster's console is, a small clapperboard
 * raised behind the burger, with the turtle beside them.
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
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="912" cy="374" rx="190" ry="16" fill="url(#poster-shade)" stroke="none" />
        <Clapboard x={796} y={296} angle={-6} scale={1.12} />
        <Burger x={914} y={372} scale={1.38} />
        <Turtle x={1036} y={374} scale={1.12} />
      </g>
    </g>
  );
}
