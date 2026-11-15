import { Ball, Bat, GoldenGift, Scrap, Wicket, batIn } from "./cricket-set-props";
import { Person, handsOf, type PersonProps } from "./memory-people";
import { GROUND, PosterSky } from "./memory-poster";

/** The two of us playing, as in the lane: the wicket, me at it with the bat, him bowling to me underarm. Ground at 0, the wicket on the origin. */
const ME: PersonProps = { who: "me", x: 42, y: 0, scale: 0.82, mood: "excited", lean: 10, tilt: 4, near: [16, -6], far: [12, -4] };
const ANNA: PersonProps = { who: "relative", facing: -1, x: 250, y: 0, scale: 0.86, mood: "smile", lean: 8, near: [44, 4], far: "hang" };
function Playing() {
  const grip = handsOf(ME).near;
  const release = handsOf(ANNA).near;
  return (
    <>
      <Scrap x={-40} y={2} angle={-8} wide={1.2} />
      <Scrap x={300} y={3} angle={10} />
      <Wicket />
      <Person {...ME} part="body" />
      <Bat {...batIn(grip, -14)} />
      <Person {...ME} part="arm" />
      <Person {...ANNA} />
      <path d={`M${release[0]} ${release[1]}Q${(release[0] + 126) / 2} ${release[1] - 18} 126 -44`} strokeWidth="1" strokeDasharray="2 4" opacity=".45" />
      <Ball x={122} y={-44} />
    </>
  );
}

/** Our lane at dusk: the neighbours' houses with their water tanks, our gate in the compound wall, a palm, the lamp's light on the lane. */
function LaneEvening() {
  const house = (x: number, width: number, top: number) =>
    `M${x} ${GROUND}V${top}h${width}V${GROUND}M${x - 6} ${top}h${width + 12}v-8h${-width - 12}ZM${x + width * 0.58} ${top - 8}v-22q0-6 14-6t14 6v22M${x + 22} ${top + 40}h46v46h-46Zm23 0v46`;
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <g opacity=".5">
        {[[690, 60, 1.4], [806, 48, 1.2], [930, 92, 1.6], [1150, 60, 1.3], [470, 110, 1], [292, 70, 1.2]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="currentColor" stroke="none" />)}
        <path d="M622 70a22 22 0 1 0 20 30a17 17 0 1 1-20-30Z" fill="currentColor" stroke="none" opacity=".6" />
      </g>
      <g opacity=".22" strokeWidth="1.3">
        <path d={`${house(760, 170, 430)}${house(960, 150, 470)}${house(1130, 120, 420)}`} />
        {/* our compound wall, its gate open between two pillars */}
        <path d={`M240 ${GROUND}v-40h170v40M240 ${GROUND - 40}h170M470 ${GROUND}v-40h250v40M470 ${GROUND - 40}h250`} />
        <path d={`M410 ${GROUND}v-74h16v74M454 ${GROUND}v-74h16v74M406 ${GROUND - 74}h24M450 ${GROUND - 74}h24`} />
        <path d={`M426 ${GROUND - 4}v-56l10-6v56ZM454 ${GROUND - 4}v-56l-10-6v56Z`} />
        {/* a coconut palm over the wall */}
        <path d={`M170 ${GROUND}Q186 450 178 360`} strokeWidth="2.2" />
        <path d="M178 362q-40-36-86-8m86 8q-30-34-58-44m58 44q8-40 40-56m-40 56q46-30 86-4m-86 4q50 2 80 34m-80-34q-38 8-66 42" />
        {/* the street lamp, its light falling on the lane */}
        <path d="M676 548V318q0-12-12-12h-44" strokeWidth="2.2" />
        <path d="M670 548h12M673 470h6M673 400h6" />
        <path d="M600 300q16-10 32 0l-3 6h-26Z" fill="currentColor" fillOpacity=".25" />
        <path d="M604 306h24" strokeWidth="3" opacity=".9" />
      </g>
      <path d="M606 308L494 548H738L626 308Z" fill="url(#poster-lamp)" stroke="none" />
      <ellipse cx="616" cy="550" rx="150" ry="14" fill="url(#poster-pool)" stroke="none" />
      <g opacity=".22" strokeWidth="1.3">
        <path d={`M0 ${GROUND}H1200M0 ${GROUND + 9}H1200`} />
        <path d={`M40 ${GROUND + 30}h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60`} opacity=".6" />
      </g>
    </g>
  );
}

/**
 * Early Birthday & a Cricket Set's poster, on a 1200×630 dusk in our lane:
 * the gate, the houses, and the two of us playing under the lamp, the golden
 * paper at our feet; up and to the right as on the other posters, the present
 * itself, still wrapped.
 *
 * Plain drawing only, for the page and the share-image renderer alike.
 */
export function CricketPosterArt() {
  return (
    <g>
      <PosterSky />
      <LaneEvening />
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <g transform={`translate(560 ${GROUND}) scale(1.15)`}><Playing /></g>
        <ellipse cx="1004" cy="350" rx="90" ry="10" fill="url(#poster-shade)" stroke="none" />
        <GoldenGift x={1000} y={348} scale={1.9} glints />
      </g>
    </g>
  );
}
