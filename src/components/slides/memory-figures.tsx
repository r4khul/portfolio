/**
 * Shared drawing for the memory's people, in the site's ink: currentColor
 * lines and solids, paper (the page background) for skin and highlights.
 *
 * Heads face right with the origin at the centre of the skull, about 30
 * units in radius, all on one construction:
 *
 * - narrator: me, a round kid's skull and a mop of loose curls
 * - brother: the one with the bicycle, a few years older, a neat wave of hair
 * - cousin / cousin-swept: Chithappa's two sons, straight shiny hair
 * - chithappa: late thirties, a full hairline, always in spectacles
 * - anna: the shopkeeper, thin, grey through his dark hair, a short beard
 * - amma: hair drawn back into a bun with jasmine, a pottu, an earring
 */
export const paper = "var(--background)";

export type Point = readonly [x: number, y: number];
export type Role = "narrator" | "brother" | "cousin" | "cousin-swept" | "chithappa" | "anna" | "amma" | "adult";
export type Mood = "calm" | "excited" | "awe" | "down" | "sad" | "focus" | "worried" | "soft" | "talk" | "smile";

const r1 = (value: number) => Math.round(value * 10) / 10;

export const polar = ([x, y]: Point, length: number, degrees: number): Point => {
  const radians = (degrees * Math.PI) / 180;
  return [x + Math.cos(radians) * length, y + Math.sin(radians) * length];
};

/**
 * Two-bone reach: where the knee (or elbow) sits when a limb of lengths `a`
 * and `b` joins `root` to `tip`. `bend` 1 puts the joint on the clockwise
 * side of the root→tip line (an elbow dropping below a reaching arm), -1 on
 * the other (a knee rising in front of a rider facing right).
 */
export function joint(root: Point, tip: Point, a: number, b: number, bend: 1 | -1 = 1): Point {
  const dx = tip[0] - root[0];
  const dy = tip[1] - root[1];
  const length = Math.hypot(dx, dy) || 1;
  const reach = Math.min(length, a + b - 0.01);
  const along = (a * a - b * b + reach * reach) / (2 * reach);
  const out = Math.sqrt(Math.max(0, a * a - along * along));
  const ux = dx / length;
  const uy = dy / length;
  return [root[0] + ux * along - uy * out * bend, root[1] + uy * along + ux * out * bend];
}

/** A tapered capsule from `p` (width `w1`) to `q` (width `w2`): one limb segment. */
export function capsule(p: Point, q: Point, w1: number, w2: number): string {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const a = w1 / 2;
  const b = w2 / 2;
  // Both caps sweep counter-clockwise, so each end bulges outward.
  return `M${r1(p[0] + nx * a)} ${r1(p[1] + ny * a)}L${r1(q[0] + nx * b)} ${r1(q[1] + ny * b)}A${r1(b)} ${r1(b)} 0 0 0 ${r1(q[0] - nx * b)} ${r1(q[1] - ny * b)}L${r1(p[0] - nx * a)} ${r1(p[1] - ny * a)}A${r1(a)} ${r1(a)} 0 0 0 ${r1(p[0] + nx * a)} ${r1(p[1] + ny * a)}Z`;
}

export const place = ([x, y]: Point, degrees = 0, scale = 1) =>
  `translate(${r1(x)} ${r1(y)})${degrees ? ` rotate(${r1(degrees)})` : ""}${scale !== 1 ? ` scale(${scale})` : ""}`;

const KID_SKIN =
  "M-12 40C-14 32-22 26-27 16C-36-2-30-28-8-34C12-39 26-26 28-12C29-8 30-5 29-2C31 2 34 5 35 7C34 10 31 10 29 11C30 13 31 15 29 17C30 19 30 21 28 22C27 27 24 31 17 33C12 34 9 35 8 42Z";
const MAN_SKIN =
  "M-13 46C-16 36-24 28-28 18C-36-2-30-30-6-36C14-40 28-28 29-14C30-10 31-6 30-3C33 2 37 7 38 10C37 13 33 13 30 14C31 16 32 18 30 20C31 22 31 24 29 25C28 31 25 36 17 38C11 39 8 40 7 48Z";
const AMMA_SKIN =
  "M-12 44C-15 34-23 26-27 16C-35-2-30-30-6-35C14-39 27-27 28-13C29-9 30-6 29-3C31 1 34 5 35 8C34 11 31 11 29 12C30 14 31 16 29 18C30 20 30 22 28 23C27 29 24 33 17 35C12 36 9 37 8 45Z";

const HAIR: Record<Role, string> = {
  narrator: "M-24 14L-32.9 0.0Q-39.4 -2.8 -36.3 -8.7Q-43.1 -13.0 -36.8 -18.0Q-40.5 -23.6 -34.5 -27.0Q-37.6 -34.1 -29.3 -35.0Q-29.2 -41.7 -21.9 -41.3Q-20.5 -49.1 -12.8 -45.4Q-8.7 -51.1 -2.8 -47.0Q3.1 -52.9 7.3 -45.9Q14.1 -48.5 16.5 -42.1Q24.8 -43.9 24.3 -36.1Q31.3 -34.8 29.8 -28.4Q37.5 -25.6 32.7 -19.5Q37 -12 31 -13Q28 -9 24 -13Q21 -9 17 -13Q14 -10 10 -14Q6 -17 2 -13C-1 -9 -2 -4 -2 1L-6 4L-12 -3C-16 3 -20 10 -24 14Z",
  brother: "M-26 16C-38-6-34-36-8-41C16-46 34-34 33-18C31-12 26-12 24-16C22-10 16-8 12-12C8-8 4-8 2-10C-1-6-1-2-1 2L-6 6L-12-2C-16 4-20 12-26 16Z",
  cousin: "M-27 14C-38-6-32-34-8-38C14-42 30-31 31-15C26-14 22-12 18-10L19-14C12-10 6-9 0-10C-2-6-2-2-2 1L-6 4L-12-3C-16 3-20 9-27 14Z",
  "cousin-swept": "M-27 14C-38-6-32-34-8-38C16-43 33-31 32-16C27-18 20-19 13-17C6-15 0-12-2-6L-2 1L-6 4L-12-3C-16 3-20 9-27 14Z",
  chithappa: "M-27 15C-37-4-31-33-8-38C13-42 28-32 30-19C22-20 12-19 4-16C-1-13-3-7-3 0L-7 5L-12-2C-16 4-20 10-27 15Z",
  anna: "M-27 14C-37-6-31-33-7-37C14-41 28-30 29-17C22-18 14-16 6-15C0-12-2-6-2 0L-6 4L-12-3C-16 3-20 9-27 14Z",
  adult: "M-27 15C-37-4-31-31-9-37C12-41 26-31 28-19C18-20 8-18 2-14C-2-10-3-5-3 0L-7 5L-12-2C-16 4-20 10-27 15Z",
  amma: "M-27 12C-36-6-30-32-6-37C12-40 26-31 28-18C20-22 8-22 0-16C-4-12-4-6-3-1L-6 6L-12 0C-16 6-20 10-27 12Z",
};

/** Paper lines laid over the hair: curl, shine, a parting or grey. */
const HAIR_DETAIL: Partial<Record<Role, { d: string; width: number; opacity: number }[]>> = {
  narrator: [{ d: "M-22-24q3-4 7-1M-8-36q3-4 7-1M8-33q4-3 7 1M-28-8q2-4 6-2M19-21q3-2 5 1M-12-18q3-3 6 0M4-20q3-3 6 0M-24 4q2-3 5-1M26-11q2-3 5-1", width: 1.2, opacity: 0.55 }],
  brother: [
    { d: "M-21-27C-12-36 4-39 18-34", width: 1.6, opacity: 0.55 },
    { d: "M8-31c8 0 16 4 20 10", width: 1.1, opacity: 0.45 },
  ],
  cousin: [
    { d: "M-24-20C-14-31 4-34 20-28", width: 2, opacity: 0.65 },
    { d: "M-20-11C-11-19 2-22 13-19", width: 1.2, opacity: 0.45 },
  ],
  "cousin-swept": [
    { d: "M-24-22C-12-33 8-35 24-25", width: 2, opacity: 0.65 },
    { d: "M-14-12C-4-18 8-20 18-18", width: 1.2, opacity: 0.45 },
  ],
  chithappa: [
    { d: "M-8-37C-2-30 4-25 10-21", width: 1.3, opacity: 0.7 },
    { d: "M-24-18C-16-29-2-33 10-31", width: 1.2, opacity: 0.45 },
  ],
  anna: [{ d: "M-22-20l8-6M-14-31l9-3M-27-6l6-7M1-35l8 1M13-30l7 3M-18-12l7-5M-6-24l8-2", width: 1.2, opacity: 0.7 }],
  adult: [{ d: "M-21-26C-12-35 4-38 18-33", width: 1.6, opacity: 0.55 }],
  amma: [{ d: "M-22-24C-12-33 4-36 18-30", width: 1.6, opacity: 0.55 }],
};

/** Small, tight eyes read better than big ones at the sizes these heads are drawn. */
function Eye({ x, y, mood, size }: { x: number; y: number; mood: Mood; size: number }) {
  if (mood === "soft") return <path d={`M${x - 4.5} ${y + 1}q4.5-4.5 9 0`} strokeWidth={1.9} />;
  if (mood === "down" || mood === "sad") {
    return (
      <g strokeWidth={1.9}>
        <path d={`M${x - 4.5} ${y}q4.5 3.6 9 0`} />
        <path d={`M${x - 3} ${y + 2}l-1.6 2.2m4.4-1.4-.8 2.5`} strokeWidth={1} opacity=".7" />
      </g>
    );
  }
  const wide = mood === "awe" || mood === "excited";
  const ry = (wide ? 4.8 : mood === "focus" ? 3.2 : 4) * size;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={3 * size} ry={ry} fill="currentColor" stroke="none" />
      <circle cx={x + size} cy={y - ry * 0.38} r={1.15 * size} fill={paper} stroke="none" />
      {mood === "focus" && <path d={`M${x - 4.5} ${y - 3.6}h8.5`} strokeWidth={2} />}
    </g>
  );
}

function brow(mood: Mood, x: number, y: number) {
  switch (mood) {
    case "excited":
    case "awe":
      return `M${x - 6} ${y - 4}q6-5 13-1`;
    case "sad":
    case "worried":
      return `M${x - 7} ${y + 1}q6-1 12-6`;
    case "down":
      return `M${x - 6} ${y + 1}q6-2 12-3`;
    case "focus":
      return `M${x - 7} ${y - 1}q7-2 13 2`;
    default:
      return `M${x - 6} ${y - 1}q6-3 13 0`;
  }
}

function Mouth({ mood, x, y }: { mood: Mood; x: number; y: number }) {
  switch (mood) {
    case "excited":
      return <path d={`M${x - 5} ${y - 3}c4 0 7 1 7 3c-1 5-5 6-8 2Z`} fill="currentColor" strokeWidth={1.4} />;
    case "awe":
      return <ellipse cx={x} cy={y + 1} rx={2.4} ry={3.6} fill="currentColor" strokeWidth={1.2} />;
    case "talk":
      return <path d={`M${x - 4} ${y - 1}q3 4 6 0`} fill="currentColor" strokeWidth={1.3} />;
    case "sad":
    case "down":
    case "worried":
      return <path d={`M${x - 4} ${y + 1}q2-2 5 0`} strokeWidth={1.7} />;
    case "soft":
    case "smile":
      return <path d={`M${x - 4} ${y - 0.5}q2.5 2.5 5.5 0`} strokeWidth={1.7} />;
    default:
      return <path d={`M${x - 4} ${y}h5`} strokeWidth={1.7} />;
  }
}

/**
 * One head. Grown-ups get their own details: Chithappa's moustache and
 * spectacles, Amma's bun with a string of jasmine, her pottu and earring.
 */
export function Head({ role = "adult", mood = "calm", spectacles = false }: { role?: Role; mood?: Mood; spectacles?: boolean }) {
  const kid = role === "narrator";
  const amma = role === "amma";
  const skin = kid ? KID_SKIN : amma ? AMMA_SKIN : MAN_SKIN;
  const eye: Point = kid ? [19, -2] : amma ? [19, -3] : [20, -1];
  const mouth: Point = kid ? [28, 19] : amma ? [28, 20] : [29, 22];
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {amma && (
        <g>
          <circle cx="-31" cy="-4" r="11.5" fill="currentColor" stroke="none" />
          {/* jasmine strung around the bun */}
          {[-112, -76, -40, -4, 32, 68].map((a) => {
            const [bx, by] = polar([-31, -4], 12.5, a);
            return <circle key={a} cx={r1(bx)} cy={r1(by)} r="3.1" fill={paper} strokeWidth="1.1" />;
          })}
        </g>
      )}
      <path d={skin} fill={paper} strokeWidth="2.2" />
      {/* tone under the skull and down the back of the neck */}
      <path d="M-27 16C-22 26-14 32-12 40L8 42C9 36 4 30-4 30C-14 30-20 24-27 16Z" fill="currentColor" stroke="none" opacity=".06" />
      <path d="M-9-1C-4-8 5-4 3 4C2 10-4 12-8 9Z" fill={paper} strokeWidth="1.7" />
      <path d="M-4 1q3 2 0 5" strokeWidth="1.1" opacity=".7" />
      <path d={HAIR[role]} fill="currentColor" stroke="none" />
      {HAIR_DETAIL[role]?.map(({ d, width, opacity }) => <path key={d} d={d} stroke={paper} strokeWidth={width} opacity={opacity} />)}
      {role === "anna" && (
        // a short, greying beard along the jaw, and a thin moustache
        <g stroke="none" fill="currentColor">
          <path d="M30 21C31 25 30 29 27 32C24 36 19 38 13 39C8 39 3 37 0 33C-3 29-5 23-5 15L-1 14C-1 22 1 27 5 30C9 33 14 34 19 32C23 30 26 26 26 22Z" opacity=".32" />
          <path d="M25 15C29 13 34 13 37 16C33 17 29 17 25 16.5Z" opacity=".7" />
          {[[22, 30], [17, 34], [11, 35], [5, 32], [1, 26], [26, 25]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={dx} cy={dy} r=".9" fill={paper} opacity=".7" />)}
        </g>
      )}
      {role === "brother" && <path d="M27 17q3-2 5 1" strokeWidth="1.4" opacity=".45" />}
      {amma && <circle cx="25" cy="-12" r="1.9" fill="currentColor" stroke="none" />}
      {amma && <circle cx="-6" cy="13" r="2.6" fill={paper} strokeWidth="1.2" />}
      {kid && <path d="M11 11l3-2m1 4 3-2" strokeWidth="1" opacity=".35" />}
      <Eye x={eye[0]} y={eye[1]} mood={mood} size={kid ? 1 : 0.92} />
      <path d={brow(mood, eye[0], eye[1] - 8)} strokeWidth="2.1" fill="none" />
      {spectacles && (
        <g strokeWidth="1.4" fill="none">
          <rect x={eye[0] - 7} y={eye[1] - 6} width="15" height="11" rx="3.5" />
          <path d={`M${eye[0] - 7} ${eye[1] - 2}L-8 -4`} />
        </g>
      )}
      <Mouth mood={mood} x={mouth[0]} y={mouth[1]} />
    </g>
  );
}
