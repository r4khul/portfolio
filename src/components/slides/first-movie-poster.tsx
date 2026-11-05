import { AvengerRide } from "./first-movie-avenger";
import { Burger, Clapboard, Turtle } from "./first-movie-props";
import { GROUND, PosterSky } from "./memory-poster";

/** City blocks across the skyline: [x, width, top]. */
const BLOCKS = [[24, 112, 430], [146, 92, 388], [248, 118, 456], [376, 102, 408], [1104, 96, 420]] as const;

function windowsOf(x: number, width: number, top: number) {
  let d = "";
  for (let y = top + 20; y < GROUND - 14; y += 22) {
    for (let wx = x + 12; wx + 8 < x + width - 6; wx += 18) d += `M${wx} ${y}h8`;
  }
  return d;
}

/** Chennai at night: apartment blocks, the mall with its cinema, an auto at the curb, and the lamp the ride passes under. */
function ChennaiNight() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <g opacity=".5">
        {[[690, 60, 1.4], [806, 48, 1.2], [930, 92, 1.6], [1150, 60, 1.3], [470, 110, 1], [292, 70, 1.2]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="currentColor" stroke="none" />)}
        <path d="M622 70a22 22 0 1 0 20 30a17 17 0 1 1-20-30Z" fill="currentColor" stroke="none" opacity=".6" />
      </g>
      <g opacity=".22" strokeWidth="1.3">
        {BLOCKS.map(([x, width, top]) => (
          <g key={x}>
            <path d={`M${x} ${GROUND}V${top}h${width}V${GROUND}M${x + width * 0.6} ${top}v-18h22v18M${x + 12} ${top}v-10`} />
            <path d={windowsOf(x, width, top)} strokeWidth="2" opacity=".5" />
          </g>
        ))}
        {/* the mall and its cinema, low and wide under the still life */}
        <path d={`M770 ${GROUND}V446h324v${GROUND - 446}M758 446h348v-32H758Z`} />
        <text x="932" y="437" textAnchor="middle" fontSize="17" letterSpacing="10" fill="currentColor" stroke="none">CINEMAS</text>
        <path d="M792 462v72m22-72v72m22-72v72m22-72v72m22-72v72m22-72v72m22-72v72m22-72v72m22-72v72m22-72v72m22-72v72m22-72v72M776 492h312" opacity=".6" />
        <path d="M886 520h96l14 12H872Z" />
        {/* an auto-rickshaw waiting at the curb */}
        <g transform={`translate(330 ${GROUND}) scale(.62)`}>
          <path d="M-80-14-74-60q2-10 14-10h20l10 30h104v26Z" />
          <path d="M-60-70q4-42 50-42h62q24 2 24 32v40M-58-72-40-108M-74-30H74" />
          <circle cx="-58" cy="-10" r="12" /><circle cx="50" cy="-10" r="14" />
        </g>
        {/* the street lamp, its light falling on the road */}
        <path d="M676 548V318q0-12-12-12h-44" strokeWidth="2.2" />
        <path d="M670 548h12M673 470h6M673 400h6" />
        <path d="M600 300q16-10 32 0l-3 6h-26Z" fill="currentColor" fillOpacity=".25" />
        <path d="M604 306h24" strokeWidth="3" opacity=".9" />
      </g>
      <path d="M606 308L494 548H738L626 308Z" fill="url(#poster-lamp)" stroke="none" />
      <ellipse cx="616" cy="550" rx="150" ry="14" fill="url(#poster-pool)" stroke="none" />
      <g opacity=".22" strokeWidth="1.3">
        {/* the road, with its lane marks */}
        <path d={`M0 ${GROUND}H1200M0 ${GROUND + 9}H1200`} />
        <path d={`M40 ${GROUND + 30}h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60m40 0h60`} opacity=".6" />
      </g>
    </g>
  );
}

/**
 * First Movie & a Burger's poster, on a 1200×630 Chennai night: the three of
 * us riding home under the lamp, and, up and to the right of it as the first
 * poster's console is, a small clapperboard raised behind the burger, with the
 * turtle beside them.
 *
 * Plain drawing only, for the page and the share-image renderer alike.
 */
export function MoviePosterArt() {
  return (
    <g>
      <PosterSky />
      <ChennaiNight />
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
