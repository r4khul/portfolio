import { paper } from "./memory-figures";

/**
 * The cricket set and its golden paper, each drawn about its own base, in the
 * scene's ink. Its colours become tones: the red bat solid ink, the blue ball
 * a mid tone, and the yellow stumps, bails and base the paper itself. `at`
 * positions a thing at x, y, turned and scaled.
 */
type At = { x?: number; y?: number; angle?: number; scale?: number };
const at = ({ x = 0, y = 0, angle = 0, scale = 1 }: At) => `translate(${x} ${y})${angle ? ` rotate(${angle})` : ""}${scale !== 1 ? ` scale(${scale})` : ""}`;

/** From the bat's toe to where the top hand grips it. */
export const GRIP = 64;

/** The bat in a hand: its grip at [x, y], turned `angle` from straight down (0), so its toe lands GRIP away. */
export const batIn = ([x, y]: readonly [number, number], angle: number) => {
  const radians = (angle * Math.PI) / 180;
  return { x: x - GRIP * Math.sin(radians), y: y + GRIP * Math.cos(radians), angle };
};

/** The bat, red plastic, its toe on the origin and its handle straight up. */
export function Bat(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-6.5-2Q-6.5 0-4.5 0h9Q6.5 0 6.5-2V-40Q6.5-44 2.5-46h-5Q-6.5-44-6.5-40Z" fill="currentColor" strokeWidth="1.2" />
      <path d="M-3.4-5V-40" stroke={paper} strokeWidth="1.1" opacity=".55" />
      <path d="M-2.2-46h4.4v-24h-4.4Z" fill="currentColor" strokeWidth="1" />
      <path d="M-2.2-52h4.4m-4.4 5h4.4m-4.4 5h4.4m-4.4 5h4.4" transform="translate(0 -10)" stroke={paper} strokeWidth=".7" opacity=".5" />
      <circle cx="0" cy="-71" r="2.6" fill="currentColor" strokeWidth="1" />
    </g>
  );
}

/** The ball, blue plastic, a mid tone, its seam moulded in. Centred. */
export function Ball(props: At) {
  return (
    <g transform={at(props)}>
      <circle r="3.8" fill="currentColor" fillOpacity=".5" strokeWidth="1.1" />
      <path d="M-1.6-3.4Q.8 0-1.6 3.4M1.8-3.3Q4 0 1.8 3.3" stroke={paper} strokeWidth=".6" opacity=".8" />
    </g>
  );
}

/** The yellow base the stumps stand in, as paper with its outline. Standing on the origin. */
export function Base(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-16 0h32l-3-5h-26Z" fill={paper} strokeWidth="1.2" />
      <path d="M-10-5v-1.5m10 1.5v-1.5m10 1.5v-1.5" strokeWidth="1" opacity=".6" />
    </g>
  );
}

/** One stump, yellow, standing on the origin. */
export function Stump(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-1.6 0V-55q0-1.6 1.6-1.6t1.6 1.6V0Z" fill={paper} strokeWidth="1.1" />
    </g>
  );
}

/** One bail, yellow, lying across two stump tops. Centred. */
export function Bail(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-4.2-1.3h8.4q1.3 0 1.3 1.3t-1.3 1.3h-8.4q-1.3 0-1.3-1.3t1.3-1.3Z" fill={paper} strokeWidth="1" />
    </g>
  );
}

/**
 * The wicket: the base, its three stumps, and the bails across their tops.
 * `stumps` stands only that many in the base (setting it up); `bails` leaves
 * them off. Standing on the origin.
 */
export function Wicket({ stumps = 3, bails = true, ...props }: At & { stumps?: number; bails?: boolean }) {
  return (
    <g transform={at(props)}>
      {[-8, 0, 8].slice(0, stumps).map((x) => <Stump key={x} x={x} y={-5} />)}
      <Base />
      {bails && stumps === 3 && <><Bail x={-4} y={-62.6} /><Bail x={4} y={-62.6} /></>}
    </g>
  );
}

/** Sheen on golden paper: a few bright streaks, and a glint or two. */
function Sheen({ d }: { d: string }) {
  return <path d={d} stroke={paper} strokeWidth="1.8" opacity=".75" />;
}
const SPARK = "M0-4.2q.6 3.6 4.2 4.2-3.6.6-4.2 4.2-.6-3.6-4.2-4.2 3.6-.6 4.2-4.2Z";

/**
 * The present: a tall box wrapped in golden paper, seen a little from its
 * right, standing on the origin. `torn` rips the paper down from the top, 0
 * to 1, showing the set packed inside: the bat's handle and the stump tops.
 * `glints` adds the shine around it.
 */
export function GoldenGift({ torn = 0, glints = false, ...props }: At & { torn?: number; glints?: boolean }) {
  const edge = -86 + torn * 58;
  const jag = Array.from({ length: 8 }, (_, i) => `L${(-14 + (i + 1) * 3.5).toFixed(1)} ${(edge + (i % 2 ? -3 : 3)).toFixed(1)}`).join("");
  return (
    <g transform={at(props)}>
      {/* where the paper has gone, the plain box, the set poking up out of its open top: the bat's handle and the stumps */}
      {torn > 0 && (
        <g>
          <path d="M-7.2-86v-12h4.4v12Z" fill="currentColor" strokeWidth="1" />
          <circle cx="-5" cy="-99.5" r="2.4" fill="currentColor" strokeWidth="1" />
          {[3, 7.5, 12].map((x) => <path key={x} d={`M${x - 1.4}-86v-7q0-1.4 1.4-1.4t1.4 1.4v7`} fill={paper} strokeWidth="1" />)}
          <path d={`M-14-86h28V${edge + 3}H-14Z`} fill={paper} strokeWidth="1.1" />
          <path d={`M14-86l8-5V${edge - 2}l-8 5Z`} fill={paper} strokeWidth="1.1" />
          <path d="M-14-86l8-5h28l-8 5" strokeWidth="1" opacity=".6" />
        </g>
      )}
      {/* the paper: the front, the shaded side, the folded top, each tinted over paper so nothing shows through */}
      {[[torn > 0 ? `M-14 0V${edge + 3}${jag}V0Z` : "M-14 0V-86h28V0Z", ".16"], [torn > 0 ? `M14 0V${edge}l8-5V-5Z` : "M14 0V-86l8-5V-5Z", ".34"]].map(([d, tint]) => (
        <g key={tint}>
          <path d={d} fill={paper} stroke="none" />
          <path d={d} fill="currentColor" fillOpacity={tint} strokeWidth="1.3" />
        </g>
      ))}
      {torn === 0 && <><path d="M-14-86l8-5h28l-8 5Z" fill={paper} stroke="none" /><path d="M-14-86l8-5h28l-8 5Z" fill="currentColor" fillOpacity=".08" strokeWidth="1.2" /></>}
      {torn === 0 && <path d="M-6-91l6 5m8-5-4 5" strokeWidth=".8" opacity=".5" />}
      <Sheen d={torn > 0 ? `M-14-14l18-9M-14-36l28-14` : "M-14-14l18-9M-14-36l28-14M-14-62l28-14"} />
      <path d={`M0 0V${torn > 0 ? edge + 4 : -86}`} strokeWidth=".7" opacity=".35" />
      {glints && (
        <g fill={paper} strokeWidth=".9">
          <path d={SPARK} transform="translate(-22 -70) scale(1.1)" />
          <path d={SPARK} transform="translate(28 -40) scale(.8)" />
          <path d={SPARK} transform="translate(-20 -18) scale(.7)" />
        </g>
      )}
    </g>
  );
}

/** A torn piece of the golden paper, crumpled where it fell: its folds, and the shine on it. Centred. */
export function Scrap({ wide = 1, ...props }: At & { wide?: number }) {
  const w = (x: number) => (x * wide).toFixed(1);
  return (
    <g transform={at(props)}>
      <path d={`M${w(-10)} 2L${w(-8)}-3L${w(-3)}-1.5L${w(-1)}-6L${w(4)}-3.5L${w(7)}-6.5L${w(10)}-1L${w(6)} 2.5L${w(1)} 1.5Z`} fill="currentColor" fillOpacity=".22" strokeWidth="1" />
      <path d={`M${w(-3)}-1.5L${w(-1)} 1.6M${w(4)}-3.5L${w(3)} 2M${w(-8)}-3L${w(-6)} 1.8`} strokeWidth=".6" opacity=".55" />
      <path d={`M${w(-6.5)}-1.8L${w(-2.5)}-3M${w(4.5)}-5L${w(7.5)}-2.5`} stroke={paper} strokeWidth="1.2" opacity=".85" />
    </g>
  );
}

/** Where each thing lies on the cover, by the wicket. */
export const STILL = {
  wicket: { x: 520, y: 400 },
  bat: { x: 556, y: 401, angle: -17 },
  ball: { x: 498, y: 396.5 },
  scraps: [{ x: 466, y: 402, angle: -8, wide: 1.2 }, { x: 588, y: 403, angle: 12 }, { x: 540, y: 405, angle: 4, wide: .8 }],
} as const;

/** The cover: the wicket standing, the bat leaning on it, the ball, and the golden paper around them. */
export function StillLife({ className = "" }: { className?: string }) {
  return (
    <g className={className}>
      <ellipse cx="524" cy="404" rx="86" ry="5" fill="currentColor" stroke="none" opacity=".05" />
      {STILL.scraps.map((scrap) => <Scrap key={scrap.x} {...scrap} />)}
      <Wicket {...STILL.wicket} />
      <Ball {...STILL.ball} />
      <Bat {...STILL.bat} />
    </g>
  );
}
