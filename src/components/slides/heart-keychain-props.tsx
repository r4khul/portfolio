import { paper } from "./memory-figures";

/**
 * The things of that last day, each drawn about its own base or centre, in
 * the scene's ink. `at` positions one at x, y, turned and scaled.
 */
type At = { x?: number; y?: number; angle?: number; scale?: number };
const at = ({ x = 0, y = 0, angle = 0, scale = 1 }: At) => `translate(${x} ${y})${angle ? ` rotate(${angle})` : ""}${scale !== 1 ? ` scale(${scale})` : ""}`;
const mono = { fontFamily: "var(--font-geist-mono), monospace" } as const;
const script = { fontFamily: "var(--font-instrument-serif), Georgia, serif", fontStyle: "italic" } as const;

const HEART = "M0 24C-36 0-34-30-14-31C-6-31-1-25 0-20C1-25 6-31 14-31C34-30 36 0 0 24Z";
const TINY = "M0 2.6C-4.6-.4-4.2-4-1.8-4C-.8-4-.2-3.3 0-2.6C.2-3.3.8-4 1.8-4C4.2-4 4.6-.4 0 2.6Z";
/**
 * The tiny hearts inside, deep red and glittery, filling the heart nearly to
 * the top: its inside cut level at y -20.6, about 87% of it, which leaves a
 * little gap in each lobe. Every tiny heart below sits inside the plastic.
 */
const PILE = "M0 19.6C-21.4 5.4-27.2-11.3-23-20.6H-.8C-.4-19.8-.2-19 0-18.2C.2-19 .4-19.8.8-20.6H23C27.2-11.3 21.4 5.4 0 19.6Z";
/** The top of the pile, half above its level: [x, y, turn]. */
const TOP = [[-14.8, -19.2, 10], [-9.6, -19.2, -8], [-4.4, -18.6, 16], [3.8, -18, 6], [9, -19.2, -12], [14.2, -19.2, 12], [19.4, -19.2, -4]] as const;
/** Two loose in the gap, free to move when it is shaken. */
const LOOSE = [[-10.4, -23.8, -20], [10.4, -23.8, 24]] as const;
/** Hearts deeper in, scattered as they fell, a few catching the light, and glitter between them: [x, y, turn, size]. */
const DEEP = [[.8, -14.6, -12, .51], [-11.4, -14.5, 13, .5], [21.3, -14.3, 7, .5], [15.1, -13.9, 8, .71], [-20.4, -13.8, -6, .51], [-5.4, -12.9, -7, .75], [7.6, -11.5, 7, .78], [-16.4, -9.6, -13, .66], [20.6, -8.7, -24, .64], [.2, -6.6, -27, .58], [11.7, -6.4, 14, .5], [-10, -5.4, -7, .68], [-17.6, -2.4, -7, .51], [7.3, -2.3, -11, .73], [14.7, -2, 19, .65], [-5.1, -1.8, 15, .62], [.8, -.8, 24, .51], [-10.3, 2.4, 11, .75], [5.9, 4.1, -12, .65], [13.2, 4.5, -28, .63], [-.6, 5.2, -3, .63], [8.9, 9.5, -3, .63], [-5.3, 9.7, 12, .73], [2.7, 10.2, 19, .6], [.3, 15.5, 16, .6]] as const;
const GLITTER = [[-16.8, -17.8], [22.3, -17.2], [-21.4, -16.5], [-7.4, -16.3], [7.8, -16.3], [-3, -15.7], [11.4, -11.3], [-9.7, -9.8], [-2.6, -8.3], [15.4, -7], [-5.7, -5.6], [-19.2, -5.3], [-15.6, -4.9], [3.5, -2], [-2, .6], [-13.8, 1.1], [-7.2, 5.4], [-13.3, 5.8], [5.8, 7.8], [-10.3, 9.2], [4.1, 13.7], [-2.6, 14.2]] as const;
const tiny = ([x, y, turn]: readonly number[], scale: number) => `translate(${x} ${y}) rotate(${turn}) scale(${scale})`;
/** From the heart's centre to the middle of the split ring at the top of the chain. */
export const KEYRING = 98;

/**
 * The keychain: a small clear plastic heart, nearly full of tiny shining red
 * hearts, hanging on a short chain from a split ring. Centred on the heart.
 * Below the ring it swings as one (keychain-art__swing, about the ring), and
 * the hearts at the top of the pile can shift (keychain-art__shaken, __loose).
 */
export function HeartKeychain(props: At) {
  return (
    <g transform={at(props)}>
      {/* the split ring, two turns of wire */}
      <circle cx="0" cy={-KEYRING} r="12" strokeWidth="1.5" />
      <circle cx="1.2" cy={-KEYRING + 0.6} r="10.2" strokeWidth=".9" opacity=".6" />
      <path d={`M-3 ${-KEYRING + 11.5}l5 1`} strokeWidth="1.2" />
      <g className="keychain-art__swing" style={{ transformOrigin: `0 ${-KEYRING}px` }}>
        {/* the chain, its links turning as they go */}
        {[0, 1, 2, 3, 4, 5, 6].map((link) => {
          const y = -82 + link * 8.4;
          return link % 2
            ? <path key={link} d={`M0 ${y - 4}v8`} strokeWidth="2.2" />
            : <ellipse key={link} cx="0" cy={y} rx="2.6" ry="4.8" strokeWidth="1.3" />;
        })}
        <circle cx="0" cy="-25" r="3.2" fill={paper} strokeWidth="1.3" />
        {/* the heart, and the deep red pile in it */}
        <path d={HEART} fill={paper} strokeWidth="1.9" />
        <g fill="currentColor" stroke="none" opacity=".86">
          <path d={PILE} />
          <g className="keychain-art__shaken">{TOP.map((heart) => <path key={heart.join()} d={TINY} transform={tiny(heart, .75)} />)}</g>
          <g className="keychain-art__loose">{LOOSE.map((heart) => <path key={heart.join()} d={TINY} transform={tiny(heart, .7)} />)}</g>
        </g>
        <g fill={paper} stroke="none">
          {DEEP.map((heart, i) => <path key={heart.join()} d={TINY} transform={tiny(heart, heart[3])} opacity={i % 4 ? .3 : .8} />)}
          {GLITTER.map(([x, y], i) => <circle key={`${x}${y}`} cx={x} cy={y} r={i % 3 ? .5 : .85} />)}
        </g>
        {/* the clear plastic: its inner edge, and the light across it */}
        <path d={HEART} transform="translate(0 -1) scale(.86)" strokeWidth=".8" opacity=".35" />
        <path d="M-19.5-12q-2.5 8 1.5 16" stroke={paper} strokeWidth="1.8" opacity=".75" />
        <path d="M16-25.5q4 1 5.5 4.5" strokeWidth="1.2" opacity=".45" />
      </g>
    </g>
  );
}

/** The exam pad every school uses: a board with a clip, the answer sheet on it, half written. Centred. */
export function ExamPad(props: At) {
  const rows = Array.from({ length: 10 }, (_, i) => -22 + i * 9);
  return (
    <g transform={at(props)}>
      <path d="M-62-82h124q6 0 6 6v152q0 6-6 6h-124q-6 0-6-6v-152q0-6 6-6Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-54-68h108v140h-108Z" fill={paper} strokeWidth="1" />
      <text x="0" y="-52" textAnchor="middle" fontSize="6.5" letterSpacing="1.2" fill="currentColor" stroke="none" style={mono}>ANNUAL EXAMINATION</text>
      <path d="M-46-38h36m10 0h46" strokeWidth=".7" opacity=".5" />
      <path d={rows.map((y) => `M-46 ${y}h92`).join("")} strokeWidth=".6" opacity=".25" />
      <path d={rows.slice(0, 7).map((y, i) => `M-44 ${y - 2}q3-4 6 0t6 0t6 0t6 0t6 0t6 0${i % 3 ? "t6 0t6 0" : "t6 0t6 0t6 0t6 0"}`).join("")} strokeWidth=".9" opacity=".7" />
      <path d="M-22-90h44v12q0 4-4 4h-36q-4 0-4-4Z" fill={paper} strokeWidth="1.4" />
      <path d="M-12-95h24v6h-24Z" fill={paper} strokeWidth="1.2" />
    </g>
  );
}

/** A pencil, sharpened, lying along x. Centred. */
export function Pencil(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-50-4h84l14 4-14 4h-84Z" fill={paper} strokeWidth="1.3" />
      <path d="M-50 0h84" strokeWidth=".7" opacity=".4" />
      <path d="M-58-4h8v8h-8Z" fill="currentColor" stroke="none" />
      <path d="M34-4 48 0 34 4" fill={paper} strokeWidth="1.1" />
      <path d="M44-1.2 48 0 44 1.2Z" fill="currentColor" stroke="none" />
    </g>
  );
}

/** A toffee in its twisted wrapper. Centred. */
export function Toffee(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-8 0-15-5v10ZM8 0l7-5v10Z" fill={paper} strokeWidth="1" />
      <ellipse cx="0" cy="0" rx="9" ry="5.5" fill={paper} strokeWidth="1.2" />
      <path d="M-4-4v8m4-9v10m4-9v8" strokeWidth=".8" opacity=".5" />
    </g>
  );
}

/** A sheet of stickers: stars and hearts. Centred. */
export function Stickers(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-22-15h44v30h-44Z" fill={paper} strokeWidth="1.1" />
      <path d="M-12-5-10.2-.9-6-.6-9.2 2.1-8.2 6.3-12 4-15.8 6.3-14.8 2.1-18-.6-13.8-.9Z" fill="currentColor" stroke="none" />
      <circle cx="2" cy="-4" r="5" strokeWidth="1" />
      <path d={TINY} transform="translate(14 6) scale(1.4)" fill="currentColor" stroke="none" />
      <path d="M-4 8h8" strokeWidth="1" opacity=".5" />
    </g>
  );
}

/** My school bag, standing open, its front pocket unzipped. Standing on the origin. */
export function SchoolBag({ open = true, ...props }: At & { open?: boolean }) {
  return (
    <g transform={at(props)}>
      <path d="M-26-70q0-12 12-12h28q12 0 12 12V0h-52Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-18-82q0-14 18-14t18 14" strokeWidth="2.4" />
      <path d="M-22-30h44v26h-44Z" fill="currentColor" stroke={paper} strokeWidth="1.1" />
      <path d={open ? "M-22-30q22-10 44 0" : "M-22-30h44"} stroke={paper} strokeWidth="1.1" strokeDasharray="2 2" />
      {open && <path d="M-26-70q26-16 52 0" fill={paper} strokeWidth="1.2" />}
    </g>
  );
}

/**
 * A classroom desk with its bench, side on, facing right: the bench under the
 * child, the sloped desk top in front at their chest. The origin is the floor
 * under the bench.
 */
export function DeskBench(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-34-48h72v8h-72Z" fill={paper} strokeWidth="1.4" />
      <path d="M-28-40V0m60-40V0" strokeWidth="2.2" />
      <path d="M52-82 124-90v8L52-74Z" fill={paper} strokeWidth="1.4" />
      <path d="M60-60h60" strokeWidth="1.2" opacity=".6" />
      <path d="M58-76V0m60-12V0m0-80v68" strokeWidth="2.2" />
    </g>
  );
}

/** A blackboard on its frame, with chalk on it. `words` writes across it; left out, just old chalk marks. */
export function Blackboard({ words, ...props }: At & { words?: string }) {
  return (
    <g transform={at(props)}>
      <path d="M-110-64h220v128h-220Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-118-72h236v144h-236Z" strokeWidth="1.6" />
      <path d="M-104 70h40v4h-40Z" fill={paper} strokeWidth=".8" />
      {words ? (
        <text x="0" y="8" textAnchor="middle" fontSize="26" fill={paper} stroke="none" style={script}>{words}</text>
      ) : (
        <path d="M-80-30q10-6 20 0t20 0m20 0q8-6 16 0M-80 0q10-6 20 0m30 0q10-6 20 0t20 0" stroke={paper} strokeWidth="1.4" opacity=".5" />
      )}
    </g>
  );
}

/**
 * The classroom clock. `hour` and `minute` set its hands; a scene's stylesheet
 * can turn them about the centre (keychain-art__hour, __minute).
 */
export function WallClock({ x, y, hour, minute }: { x: number; y: number; hour: number; minute: number }) {
  const hand = (degrees: number, length: number) => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return `M${x} ${y}l${(Math.cos(radians) * length).toFixed(1)} ${(Math.sin(radians) * length).toFixed(1)}`;
  };
  const origin = { transformOrigin: `${x}px ${y}px` };
  return (
    <g strokeWidth=".9">
      <circle cx={x} cy={y} r="17" fill={paper} strokeWidth="1.6" /><circle cx={x} cy={y} r="14" opacity=".4" />
      <path d={Array.from({ length: 12 }, (_, i) => {
        const radians = (i * 30 * Math.PI) / 180;
        return `M${(x + Math.sin(radians) * 12).toFixed(1)} ${(y - Math.cos(radians) * 12).toFixed(1)}l${(Math.sin(radians) * (i % 3 ? 1.2 : 2.4)).toFixed(1)} ${(-Math.cos(radians) * (i % 3 ? 1.2 : 2.4)).toFixed(1)}`;
      }).join("")} />
      <path className="keychain-art__hour" style={origin} d={hand(hour * 30 + minute / 2, 7.5)} strokeWidth="1.8" />
      <path className="keychain-art__minute" style={origin} d={hand(minute * 6, 11)} strokeWidth="1.1" />
      <circle cx={x} cy={y} r="1.4" fill="currentColor" stroke="none" />
    </g>
  );
}

/** The bus home, side on, facing left: its windows, the door at the front, the route board. Standing on the origin. */
export function Bus({ window, ...props }: At & { window?: number }) {
  return (
    <g transform={at(props)}>
      <path d="M-200-24V-150q0-20 20-20h356q22 0 24 22l4 30v94Z" fill={paper} strokeWidth="2" />
      <path d="M-200-56h404M-200-62h404" strokeWidth="1.2" opacity=".6" />
      <path d="M-196-150h40v16h-40Z" fill="currentColor" stroke="none" opacity=".7" />
      {[-140, -82, -24, 34, 92, 150].map((x) => (
        <path key={x} d={`M${x} -150h50v62h-50Z`} fill={x === window ? paper : "currentColor"} fillOpacity={x === window ? 1 : 0.08} strokeWidth="1.3" />
      ))}
      <path d="M-192-136h32v66h-32Z" fill="currentColor" fillOpacity=".05" strokeWidth="1.3" />
      <path d="M-176-136v66" strokeWidth=".8" opacity=".6" />
      <circle cx="-136" cy="-22" r="24" strokeWidth="9" /><circle cx="-136" cy="-22" r="8" fill={paper} strokeWidth="1.5" />
      <circle cx="140" cy="-22" r="24" strokeWidth="9" /><circle cx="140" cy="-22" r="8" fill={paper} strokeWidth="1.5" />
      <path d="M-200-30h12m380 0h16" strokeWidth="2.4" />
    </g>
  );
}

/**
 * A classroom door off the corridor, its section board above it. `sections`
 * are the boards of the years, stacked; the scene shows one at a time
 * (keychain-art__year--0, --1, …). Standing on the origin.
 */
export function ClassDoor({ sections, ...props }: At & { sections: readonly string[] }) {
  return (
    <g transform={at(props)}>
      <path d="M-42 0v-196h84V0M-34 0v-188h68V0" strokeWidth="1.4" opacity=".5" />
      <path d="M-30-232h60v24h-60Z" fill={paper} strokeWidth="1.2" />
      {sections.map((section, i) => (
        <text key={section} className={`keychain-art__year keychain-art__year--${i}`} x="0" y="-215" textAnchor="middle" fontSize="11" letterSpacing="1.5" fill="currentColor" stroke="none" style={mono}>{section}</text>
      ))}
    </g>
  );
}

/** A few textbooks, stacked, held flat. Centred on their middle. */
export function Books(props: At) {
  return (
    <g transform={at(props)}>
      <path d="M-15-8h30v5h-30ZM-13-3h27v5h-27ZM-16 2h31v6h-31Z" fill={paper} strokeWidth="1.1" />
      <path d="M-11-5.5h22M-9 -.5h20M-12 5h24" strokeWidth=".6" opacity=".4" />
    </g>
  );
}

/** Where each thing lies on the cover, in the cover's own frame. */
export const STILL = {
  pad: { x: 560, y: 296, angle: -8, scale: 1.25 },
  pencil: { x: 590, y: 398, angle: -4, scale: 1.05 },
  keychain: { x: 708, y: 304, angle: 24, scale: 1.15 },
} as const;

/** The cover: the exam pad from the last paper, a pencil, and the heart keychain beside them. */
export function StillLife() {
  return <>
    <ellipse cx="620" cy="406" rx="190" ry="12" fill="currentColor" stroke="none" opacity=".05" />
    <g className="keychain-art__pad"><ExamPad {...STILL.pad} /></g>
    <g className="keychain-art__pencil"><Pencil {...STILL.pencil} /></g>
    <g className="keychain-art__keychain"><HeartKeychain {...STILL.keychain} /></g>
  </>;
}
