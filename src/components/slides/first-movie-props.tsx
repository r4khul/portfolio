import { capsule, paper } from "./memory-figures";

/**
 * The things of that night, each drawn about its own base or centre, in the
 * scene's ink. `place` positions one at x, y, turned and scaled.
 */
type At = { x?: number; y?: number; angle?: number; scale?: number };
const at = ({ x = 0, y = 0, angle = 0, scale = 1 }: At) => `translate(${x} ${y})${angle ? ` rotate(${angle})` : ""}${scale !== 1 ? ` scale(${scale})` : ""}`;
const mono = { fontFamily: "var(--font-geist-mono), monospace" } as const;

/** A cinema ticket: a stub torn along its perforation. Centred. */
export function Ticket(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-65-29H27a7 7 0 0 0 14 0H65V29H41a7 7 0 0 0-14 0H-65Z" fill={paper} strokeWidth="1.6" />
      <path d="M34-19v38" strokeWidth="1.1" strokeDasharray="2 3" opacity=".6" />
      <path d="M-58-22H21V22H-58Z" strokeWidth=".8" opacity=".35" />
      <path d="M-46-8h48M-46 1h56M-46 10h40" strokeWidth="1.4" opacity=".45" />
      <path d="M45-14h14m-14 6h10m-10 22h14" strokeWidth=".8" opacity=".4" />
      <circle cx="52" cy="3" r="4.5" fill="currentColor" stroke="none" opacity=".75" />
    </g>
  );
}

const SEEDS = [[-22, -60, -20], [-7, -66, 10], [10, -63, -15], [25, -56, 25], [-33, -49, 30], [-1, -55, -5], [15, -48, 15], [34, -44, -25], [-15, -45, 5]] as const;

/** My first burger, side on: sesame bun, lettuce, melting cheese, the patty. Its base is the origin. */
export function Burger(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-48 0H48Q53-2 52-9L50-17H-50L-52-9Q-53-2-48 0Z" fill={paper} strokeWidth="1.6" />
      <path d="M-53-17H53Q57-19 56-24Q55-30 50-30H-50Q-55-30-56-24Q-57-19-53-17Z" fill="currentColor" stroke={paper} strokeWidth="1" />
      <path d="M-44-23h6m6 1h5m8-1h6m7 1h5m9-1h6" stroke={paper} strokeWidth="1" opacity=".45" />
      <path d="M-55-30H55L51-24L47-27L43-18L39-27H-33L-37-21L-41-27H-55Z" fill={paper} strokeWidth="1.2" />
      <path d="M-54-33q5-6 10-1t10 0t10 0t10 0t10 0t10 0t10 0t10 0t10 0t10 0t10 0" strokeWidth="2.4" />
      <path d="M-52-34C-52-62-28-74 0-74S52-62 52-34Z" fill={paper} strokeWidth="1.8" />
      <path d="M-38-54q12-12 30-14" strokeWidth="1" opacity=".35" />
      {SEEDS.map(([sx, sy, turn]) => <ellipse key={`${sx}${sy}`} cx={sx} cy={sy} rx="2.6" ry="1.2" transform={`rotate(${turn} ${sx} ${sy})`} fill="currentColor" stroke="none" opacity=".7" />)}
    </g>
  );
}

/** The Happy Meal's toy: one Ninja Turtle, shell on his back and his mask's tails flying. Standing on the origin. */
export function Turtle(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-6-60C-22-58-26-34-20-20C-16-14-8-14-6-18Z" fill="currentColor" stroke={paper} strokeWidth="1" />
      <path d="M-17-50l5 6-3 8m-3 7 6 4" stroke={paper} strokeWidth=".8" opacity=".6" />
      <path d={capsule([-2, -22], [-4, -3], 10, 9)} fill={paper} strokeWidth="1.3" />
      <path d={capsule([6, -22], [9, -3], 10, 9)} fill={paper} strokeWidth="1.3" />
      <path d="M-11 0h12q1-5-4-6h-5Zm11 0h13q1-5-4-6h-6Z" fill="currentColor" stroke="none" />
      <path d="M-8-58C4-62 14-54 14-40C14-28 10-20 0-20C-8-20-10-30-10-40Z" fill={paper} strokeWidth="1.4" />
      <path d="M3-51h8M2-44h11M2-37h11M3-30h8" strokeWidth=".7" opacity=".45" />
      <path d="M-10-24h24" strokeWidth="2.8" />
      <path d={capsule([1, -54], [17, -38], 9, 8)} fill={paper} strokeWidth="1.3" />
      <circle cx="17" cy="-38" r="4" fill={paper} strokeWidth="1.2" />
      <circle cx="2" cy="-70" r="11" fill={paper} strokeWidth="1.5" />
      <path d="M-9-74H13V-66H-9Z" fill="currentColor" stroke="none" />
      <circle cx="8" cy="-70" r="1.8" fill={paper} stroke="none" />
      <path d="M-9-71q-9 1-14 8m14-5q-7 5-9 12" strokeWidth="2" />
      <path d="M6-63q4 2 7-1" strokeWidth="1" />
    </g>
  );
}

/** A soft-drink cup with its lid, a wave printed round it, and a straw. Its base is the origin. */
export function Cup({ straw = true, ...props }: At & { straw?: boolean }) {
  return (
    <g transform={at(props)}>
      {straw && (
        <>
          <path d="M4-62L10-96H19" strokeWidth="5.4" />
          <path d="M4-62L10-96H19" stroke={paper} strokeWidth="2.6" />
        </>
      )}
      <path d="M-15 0H15L21-58H-21Z" fill={paper} strokeWidth="1.5" />
      <path d="M-19-40q10-8 19 0t19 0M-18-31q9-7 18 0t18 0" strokeWidth="1" opacity=".45" />
      <path d="M-24-58H24V-64H-24Z" fill={paper} strokeWidth="1.4" />
      <path d="M-20-64q20-9 40 0" fill={paper} strokeWidth="1.2" />
      <path d="M-12-18q-1 4 1 5m19-14q-1 4 1 5" strokeWidth=".9" opacity=".5" />
    </g>
  );
}

/** The slim 250 ml can none of us knew was a Red Bull. Its base is the origin. */
export function Can(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-13-2V-56Q-13-61-9-63H9Q13-61 13-56V-2Q13 0 11 0H-11Q-13 0-13-2Z" fill={paper} strokeWidth="1.5" />
      <path d="M-9-63q9-3 18 0M-2-65h7" strokeWidth="1.1" />
      <path d="M-13-50h26M-13-7h26" strokeWidth=".8" opacity=".5" />
      <path d="M-13-31-6.5-24 0-31l6.5 7 6.5-7M-13-24l6.5 7L0-24l6.5 7 6.5-7" strokeWidth=".8" opacity=".5" />
      <circle cx="0" cy="-40" r="5" fill="currentColor" stroke="none" opacity=".6" />
    </g>
  );
}

/** A striped tub of popcorn, heaped over. Its base is the origin. */
export function Popcorn(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-25-46q-4-11 7-13q2-11 13-6q6-9 15-1q11-3 12 8q9 2 3 12Z" fill={paper} strokeWidth="1.3" />
      <path d="M-14-56q3 3 6 1m8-6q2 3 6 2m4 6q3 2 6 0" strokeWidth=".9" opacity=".5" />
      <path d="M-17 0H17L25-48H-25Z" fill={paper} strokeWidth="1.5" />
      <path d="M-8.5 0-12.5-48M0 0V-48M8.5 0l4-48" strokeWidth="4" opacity=".65" />
    </g>
  );
}

/** Anna's Asus phone, on its side, with a match of FIFA on the screen. Centred. */
export function Phone(props: At) {
  return (
    <g transform={at(props)}>
      <rect x="-38" y="-20" width="76" height="40" rx="6" fill="currentColor" stroke={paper} strokeWidth="1" />
      <rect x="-31" y="-16" width="62" height="32" rx="1.5" fill={paper} stroke="none" />
      <path d="M-24-16v32m14-32v32m14-32v32m14-32v32" strokeWidth="5" opacity=".06" />
      <g strokeWidth=".7" opacity=".7">
        <path d="M-29-14h58v28h-58ZM0-14v28M-29-6h7v12h-7M29-6h-7v12h7" />
        <circle cx="0" cy="0" r="5" />
      </g>
      <circle cx="-9" cy="-4" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="-15" cy="6" r="1.6" fill={paper} strokeWidth=".7" />
      <circle cx="5" cy="-6" r="1.6" fill={paper} strokeWidth=".7" />
      <circle cx="-3" cy="0" r="1" fill="currentColor" stroke="none" />
      <text x="-27" y="-9" fontSize="4.5" fill="currentColor" stroke="none" style={mono}>1-0</text>
    </g>
  );
}

const COINS = [[-4, 0, 1], [4, 0.6, 0], [0, -1.6, 0], [0, 2.4, 1], [-9, 2.6, 0], [10, -1.6, 1], [-18, -3, 1], [21, 4, 0], [-28, 5, 0]] as const;

/** The carrom board on the floor, seen from where we sat: pockets, centre circle, coins and the striker. Centred on its top. */
export function Carrom(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-70 14H70V20H-70Z" fill="currentColor" stroke={paper} strokeWidth="1" />
      <path d="M-56-12H56L70 14H-70Z" fill={paper} strokeWidth="1.5" />
      <path d="M-49-8H49L61 10H-61Z" strokeWidth=".9" />
      {[[-46, -6.4, 3.4, 1.5], [46, -6.4, 3.4, 1.5], [-57.6, 8, 4.4, 1.9], [57.6, 8, 4.4, 1.9]].map(([cx, cy, rx, ry]) => (
        <ellipse key={cx * cy} cx={cx} cy={cy} rx={rx} ry={ry} fill="currentColor" stroke="none" />
      ))}
      <ellipse cx="0" cy="1" rx="12" ry="4" strokeWidth=".8" opacity=".6" />
      <path d="M-36-4.6H36M-36-3.2H36M-45 6.2H45M-45 7.8H45" strokeWidth=".6" opacity=".45" />
      {COINS.map(([cx, cy, dark]) => (
        <ellipse key={`${cx}${cy}`} cx={cx} cy={cy} rx="2.7" ry="1.15" fill={dark ? "currentColor" : paper} strokeWidth=".7" />
      ))}
      <ellipse cx="6" cy="7" rx="3.8" ry="1.6" fill={paper} strokeWidth="1" />
    </g>
  );
}

/** The other games, stacked by the wall: Monopoly's long box, the folded Ludo board, a die. Standing on the origin. */
export function Games(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-40-10h74l6-6h-74Z" fill={paper} strokeWidth="1.1" />
      <path d="M-40-10h74v10h-74Z" fill={paper} strokeWidth="1.2" />
      <path d="M40-16v10l-6 6" strokeWidth="1.1" />
      <path d="M-32-5h22m6 0h10" strokeWidth="2.2" opacity=".55" />
      <path d="M-34-16h68l5-5h-68Z" fill={paper} strokeWidth="1" />
      <path d="M-30-20l7-0 3-3h-7Zm38 0h7l3-3h-7Z" fill="currentColor" stroke="none" opacity=".6" />
      <g transform="translate(48 0)">
        <path d="M0 0h12v-12H0Zm0-12 4-4h12l-4 4m4-4v12l-4 4" fill={paper} strokeWidth="1.1" />
        <circle cx="3.5" cy="-8.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="6" cy="-6" r="1" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="-3.5" r="1" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

/** An open exercise notebook, ruled, with a pencil across it. Centred. */
export function Notebook({ writing = true, ...props }: At & { writing?: boolean }) {
  return (
    <g transform={at(props)}>
      <path d="M-34 4 0 8 34 4 30-8 0-5-30-8Z" fill={paper} strokeWidth="1.2" />
      <path d="M0 8V-5" strokeWidth=".9" opacity=".6" />
      <path d="M-27-5.5-4-3M-28-2.5-3 0M-29 .5-2 3M4-3l23-2.5M3 0l25-2.5M2 3l27-2.5" strokeWidth=".6" opacity=".45" />
      {writing && <path d="M-25-4.5q3-2 5 0t5 0t5 0M-26-1.5q3-2 5 0t5 0" strokeWidth=".9" opacity=".8" />}
      <path d="M8 2 30-10" strokeWidth="2.4" />
      <path d="m8 2 2.4-.2-1-2" fill="currentColor" strokeWidth=".8" />
    </g>
  );
}

/**
 * A wall clock. `hour` and `minute` set its hands; `turning` hands them to the
 * stylesheet, which runs them from four towards six as the scene scrolls.
 */
export function Clock({ x, y, hour, minute, turning = false }: { x: number; y: number; hour: number; minute: number; turning?: boolean }) {
  const hand = (degrees: number, length: number) => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return `M${x} ${y}l${(Math.cos(radians) * length).toFixed(1)} ${(Math.sin(radians) * length).toFixed(1)}`;
  };
  const origin = { transformOrigin: `${x}px ${y}px` };
  return (
    <g opacity=".42" strokeWidth=".9">
      <circle cx={x} cy={y} r="22" fill={paper} /><circle cx={x} cy={y} r="18.5" opacity=".5" />
      <path d={Array.from({ length: 12 }, (_, i) => {
        const radians = (i * 30 * Math.PI) / 180;
        return `M${(x + Math.sin(radians) * 15.5).toFixed(1)} ${(y - Math.cos(radians) * 15.5).toFixed(1)}l${(Math.sin(radians) * (i % 3 ? 1.5 : 3)).toFixed(1)} ${(-Math.cos(radians) * (i % 3 ? 1.5 : 3)).toFixed(1)}`;
      }).join("")} />
      <path className={turning ? "movie-art__hour" : undefined} style={turning ? origin : undefined} d={hand(hour * 30 + minute / 2, 10)} strokeWidth="1.8" />
      <path className={turning ? "movie-art__minute" : undefined} style={turning ? origin : undefined} d={hand(minute * 6, 15)} strokeWidth="1.1" />
      <circle cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />
    </g>
  );
}

const STRIPES = [0, 1, 2, 3, 4, 5].map((i) => `M${-58 + i * 20} 0l8-12h10l-8 12Z`).join("");

/** One stick of the clapperboard, striped, lying along its bottom edge at the origin. */
function Stick() {
  return <>
    <path d="M-62 0V-12H62V0Z" fill={paper} strokeWidth="1.3" />
    <path d={STRIPES} fill="currentColor" stroke="none" />
  </>;
}

/** The film's clapperboard: a chalk slate, its striped clapper open on the hinge. Standing on the origin. */
export function Clapboard({ open = 16, ...props }: At & { open?: number }) {
  const chalk = { fill: paper, stroke: "none" } as const;
  return (
    <g transform={at(props)}>
      <path d="M-62-2V-74q0-4 4-4H58q4 0 4 4V-2q0 4-4 4H-58q-4 0-4-4Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-56-52H56M-56-27H56M-18-52V-27M18-52V-27" stroke={paper} strokeWidth=".9" opacity=".7" />
      <g {...chalk} fontSize="6" letterSpacing=".8" opacity=".75" style={mono}>
        <text x="-54" y="-68">PROD.</text>
        <text x="-54" y="-44">SCENE</text>
        <text x="-14" y="-44">TAKE</text>
        <text x="22" y="-44">ROLL</text>
        <text x="-54" y="-18">DATE</text>
      </g>
      <g {...chalk} fontSize="13" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontStyle: "italic" }}>
        <text x="-26" y="-60">a first movie</text>
        <text x="-36" y="-31">1</text>
        <text x="2" y="-31">1</text>
        <text x="38" y="-31">A</text>
        <text x="-20" y="-7">2015</text>
      </g>
      <g transform="translate(0 -78)"><Stick /></g>
      <g transform={`rotate(${-open} -62 -90) translate(0 -90)`}><Stick /></g>
      <circle cx="-62" cy="-90" r="3.4" fill={paper} strokeWidth="1.3" />
    </g>
  );
}

/** Where each thing stands on the cover, in the cover's own frame. */
export const STILL = {
  clapboard: { x: 530, y: 352, angle: -5, scale: 1.15 },
  burger: { x: 652, y: 352, angle: 0, scale: 1.3 },
  turtle: { x: 760, y: 354, angle: 0, scale: 1.05 },
} as const;

/** The cover: the clapperboard, the burger, and the Ninja Turtle that came in the box. */
export function StillLife() {
  return <>
    <ellipse cx="646" cy="354" rx="196" ry="13" fill="currentColor" stroke="none" opacity=".05" />
    <g className="movie-art__clapboard"><Clapboard {...STILL.clapboard} /></g>
    <g className="movie-art__burger"><Burger {...STILL.burger} /></g>
    <g className="movie-art__turtle"><Turtle {...STILL.turtle} /></g>
  </>;
}
