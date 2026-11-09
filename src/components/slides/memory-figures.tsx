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
 * - tenant: Anna, who rented one of our houses: tall, clean-shaven, in spectacles
 * - akka: his wife, her long hair tied back in a low ponytail, small earrings
 * - vendor: the pani puri man, a thick moustache
 * - clown: the McDonald's clown on his bench: a mop of curls, a round nose, a painted smile
 * - girl: the girl I sat beside in sixth standard, her hair in two plaits tied with ribbons
 * - teacher: our class teacher, her hair in a neat bun, in spectacles
 */
export const paper = "var(--background)";

export type Point = readonly [x: number, y: number];
export type Role = "narrator" | "brother" | "cousin" | "cousin-swept" | "chithappa" | "anna" | "amma" | "tenant" | "akka" | "vendor" | "clown" | "girl" | "teacher" | "adult";
export type Mood = "calm" | "excited" | "awe" | "down" | "sad" | "focus" | "worried" | "soft" | "talk" | "smile" | "scared" | "asleep";

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

/** Where each head's outline ends at the neck, behind and in front, in head units. */
const NECK_ENDS: Record<"kid" | "man" | "amma", readonly [Point, Point]> = { kid: [[-12, 40], [8, 42]], man: [[-13, 46], [7, 48]], amma: [[-12, 44], [8, 45]] };
const lady = (role: Role) => role === "amma" || role === "akka" || role === "teacher";
const child = (role: Role) => role === "narrator" || role === "girl";
const neckEnds = (role: Role) => NECK_ENDS[child(role) ? "kid" : lady(role) ? "amma" : "man"];

/**
 * The neck under a head placed with `place(at, degrees, scale)`. Its sides
 * carry on from the ends of the head's outline down to `back` and `front`,
 * which sit inside the shirt, so it bends with the head instead of breaking.
 * Draw it, then the head, then the shirt: they cover its two ends.
 * `mirror` matches a head flipped in place to look the other way.
 */
export function Neck({ role = "adult", at, degrees = 0, scale = 1, mirror = false, back, front }: { role?: Role; at: Point; degrees?: number; scale?: number; mirror?: boolean; back: Point; front: Point }) {
  const radians = (degrees * Math.PI) / 180;
  const [behind, ahead] = neckEnds(role).map(([ex, y]): Point => [ex * (mirror ? -1 : 1), y]).map(([x, y]): Point => [
    at[0] + (x * Math.cos(radians) - y * Math.sin(radians)) * scale,
    at[1] + (x * Math.sin(radians) + y * Math.cos(radians)) * scale,
  ]);
  // flipped, the head's back is on the other side, so its outline meets the other bottom corner
  const d = [behind, ...(mirror ? [front, back] : [back, front]), ahead].map(([x, y], index) => `${index ? "L" : "M"}${r1(x)} ${r1(y)}`).join("");
  return (
    <g>
      <path d={d} fill={paper} strokeWidth={2.2 * scale} />
      <path d={d} fill="currentColor" stroke="none" opacity=".06" />
    </g>
  );
}

const KID_SKIN =
  "M-12 40C-14 32-22 26-27 16C-36-2-30-28-8-34C12-39 26-26 28-12C29-8 30-5 29-2C31 2 34 5 35 7C34 10 31 10 29 11C30 13 31 15 29 17C30 19 30 21 28 22C27 27 24 31 17 33C12 34 9 35 8 42";
const MAN_SKIN =
  "M-13 46C-16 36-24 28-28 18C-36-2-30-30-6-36C14-40 28-28 29-14C30-10 31-6 30-3C33 2 37 7 38 10C37 13 33 13 30 14C31 16 32 18 30 20C31 22 31 24 29 25C28 31 25 36 17 38C11 39 8 40 7 48";
const AMMA_SKIN =
  "M-12 44C-15 34-23 26-27 16C-35-2-30-30-6-35C14-39 27-27 28-13C29-9 30-6 29-3C31 1 34 5 35 8C34 11 31 11 29 12C30 14 31 16 29 18C30 20 30 22 28 23C27 29 24 33 17 35C12 36 9 37 8 45";

const HAIR: Record<Role, string> = {
  narrator: "M-24 14L-32.9 0.0Q-39.4 -2.8 -36.3 -8.7Q-43.1 -13.0 -36.8 -18.0Q-40.5 -23.6 -34.5 -27.0Q-37.6 -34.1 -29.3 -35.0Q-29.2 -41.7 -21.9 -41.3Q-20.5 -49.1 -12.8 -45.4Q-8.7 -51.1 -2.8 -47.0Q3.1 -52.9 7.3 -45.9Q14.1 -48.5 16.5 -42.1Q24.8 -43.9 24.3 -36.1Q31.3 -34.8 29.8 -28.4Q37.5 -25.6 32.7 -19.5Q37 -12 31 -13Q28 -9 24 -13Q21 -9 17 -13Q14 -10 10 -14Q6 -17 2 -13C-1 -9 -2 -4 -2 1L-6 4L-12 -3C-16 3 -20 10 -24 14Z",
  brother: "M-26 16C-38-6-34-36-8-41C16-46 34-34 33-18C31-12 26-12 24-16C22-10 16-8 12-12C8-8 4-8 2-10C-1-6-1-2-1 2L-6 6L-12-2C-16 4-20 12-26 16Z",
  cousin: "M-27 14C-38-6-32-34-8-38C14-42 30-31 31-15C26-14 22-12 18-10L19-14C12-10 6-9 0-10C-2-6-2-2-2 1L-6 4L-12-3C-16 3-20 9-27 14Z",
  "cousin-swept": "M-27 14C-38-6-32-34-8-38C16-43 33-31 32-16C27-18 20-19 13-17C6-15 0-12-2-6L-2 1L-6 4L-12-3C-16 3-20 9-27 14Z",
  chithappa: "M-27 15C-37-4-31-33-8-38C13-42 28-32 30-19C22-20 12-19 4-16C-1-13-3-7-3 0L-7 5L-12-2C-16 4-20 10-27 15Z",
  anna: "M-27 14C-37-6-31-33-7-37C14-41 28-30 29-17C22-18 14-16 6-15C0-12-2-6-2 0L-6 4L-12-3C-16 3-20 9-27 14Z",
  adult: "M-27 15C-37-4-31-31-9-37C12-41 26-31 28-19C18-20 8-18 2-14C-2-10-3-5-3 0L-7 5L-12-2C-16 4-20 10-27 15Z",
  amma: "M-27 12C-36-6-30-32-6-37C12-40 26-31 28-18C20-22 8-22 0-16C-4-12-4-6-3-1L-6 6L-12 0C-16 6-20 10-27 12Z",
  tenant: "M-27 15C-38-6-32-35-8-40C14-44 30-33 31-18C24-22 14-22 6-19C0-16-2-10-2-3L-6 4L-12-2C-16 4-20 10-27 15Z",
  akka: "M-29 16C-38-6-31-34-6-38C14-41 28-31 29-17C22-23 10-25 1-19C-4-15-4-8-3-1L-6 6L-12 1C-17 8-22 13-29 16Z",
  vendor: "M-27 14C-36-6-31-32-9-37C12-41 26-31 28-19C18-19 8-17 2-13C-2-9-3-4-3 1L-7 5L-12-2C-16 4-20 10-27 14Z",
  girl: "M-27 16C-38-4-32-36-8-40C14-44 30-32 30-17C24-22 14-24 6-20C0-16-2-10-2-3L-6 4L-12-2C-16 4-21 11-27 16Z",
  teacher: "M-27 12C-36-6-30-32-6-37C12-40 26-31 28-18C20-22 8-22 0-16C-4-12-4-6-3-1L-6 6L-12 0C-16 6-20 10-27 12Z",
  clown: "M-24 18L-38 8Q-50 4-46-8Q-56-16-46-26Q-50-38-36-40Q-34-52-20-48Q-12-58 0-50Q12-56 20-46Q32-48 32-36Q42-32 36-22Q40-14 32-12Q26-14 22-17Q16-13 10-17Q4-14-1-9L-3 0L-7 5L-12-1C-16 6-20 13-24 18Z",
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
  tenant: [
    { d: "M-20-29C-8-38 8-39 22-31", width: 1.6, opacity: 0.55 },
    { d: "M4-38C10-30 14-26 20-22", width: 1.1, opacity: 0.45 },
  ],
  akka: [
    { d: "M-2-38C-6-28-6-20-2-14", width: 1.3, opacity: 0.6 },
    { d: "M-24-22C-16-32-6-35 2-35M8-35C16-33 22-28 26-22", width: 1.2, opacity: 0.45 },
  ],
  vendor: [{ d: "M-21-26C-12-34 4-37 18-32", width: 1.4, opacity: 0.5 }],
  girl: [{ d: "M-4-40C-8-30-8-22-4-16M-24-24C-16-33-8-36-2-36", width: 1.3, opacity: 0.55 }],
  teacher: [{ d: "M-22-24C-12-33 4-36 18-30", width: 1.6, opacity: 0.55 }],
  clown: [{ d: "M-40-14q4-4 8 0M-30-34q4-4 8 0M-10-44q4-4 8 0M12-40q4-3 8 1M24-26q3-3 6 0M-38 2q3-4 7-1", width: 1.3, opacity: 0.55 }],
};

/** Small, tight eyes read better than big ones at the sizes these heads are drawn. */
function Eye({ x, y, mood, size }: { x: number; y: number; mood: Mood; size: number }) {
  if (mood === "soft") return <path d={`M${x - 4.5} ${y + 1}q4.5-4.5 9 0`} strokeWidth={1.9} />;
  if (mood === "asleep") return <path d={`M${x - 4.5} ${y}q4.5 3 9 0`} strokeWidth={1.7} />;
  if (mood === "down" || mood === "sad") {
    return (
      <g strokeWidth={1.9}>
        <path d={`M${x - 4.5} ${y}q4.5 3.6 9 0`} />
        <path d={`M${x - 3} ${y + 2}l-1.6 2.2m4.4-1.4-.8 2.5`} strokeWidth={1} opacity=".7" />
      </g>
    );
  }
  const wide = mood === "awe" || mood === "excited" || mood === "scared";
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
    case "scared":
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
    case "scared":
      return <path d={`M${x - 3} ${y + 3}q2-5 5 0q-2 2-5 0Z`} fill="currentColor" strokeWidth={1.2} />;
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
  const kid = child(role);
  const amma = role === "amma";
  const woman = lady(role);
  const skin = kid ? KID_SKIN : woman ? AMMA_SKIN : MAN_SKIN;
  const eye: Point = kid ? [19, -2] : woman ? [19, -3] : [20, -1];
  const mouth: Point = kid ? [28, 19] : woman ? [28, 20] : [29, 22];
  const [behind, ahead] = neckEnds(role);
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {(amma || role === "teacher") && (
        <g>
          <circle cx="-31" cy="-4" r="11.5" fill="currentColor" stroke="none" />
          {/* jasmine strung around Amma's bun */}
          {amma && [-112, -76, -40, -4, 32, 68].map((a) => {
            const [bx, by] = polar([-31, -4], 12.5, a);
            return <circle key={a} cx={r1(bx)} cy={r1(by)} r="3.1" fill={paper} strokeWidth="1.1" />;
          })}
        </g>
      )}
      <path d={skin} fill={paper} strokeWidth="2.2" />
      {/* tone under the skull and down the back of the neck, meeting the Neck's */}
      <path d={`M-27 16C-22 26-14 32 ${behind[0]} ${behind[1]}L${ahead[0]} ${ahead[1]}C${ahead[0] + 1} ${ahead[1] - 6} 4 30-4 30C-14 30-20 24-27 16Z`} fill="currentColor" stroke="none" opacity=".06" />
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
      {/* the soft double chin of a man who likes his food */}
      {role === "tenant" && <path d="M12 39q8 3 15-2" strokeWidth="1.1" opacity=".45" />}
      {role === "vendor" && <path d="M24 14C28 11 35 11 38 15C35 18 29 18 24 17Z" fill="currentColor" stroke="none" />}
      {role === "clown" && (
        // the painted smile, wide and fixed, and the round nose
        <g>
          <path d="M10 17C16 30 30 30 37 15C31 20 18 22 10 17Z" fill={paper} strokeWidth="1.6" />
          <path d="M14 20C20 25 28 25 33 19" strokeWidth="1.2" />
          <circle cx="37" cy="7" r="6" fill="currentColor" stroke="none" />
          <path d={`M${eye[0]} ${eye[1] - 9}l-3-6m6 6 3-6`} strokeWidth="1.2" opacity=".7" />
        </g>
      )}
      {role === "brother" && <path d="M27 17q3-2 5 1" strokeWidth="1.4" opacity=".45" />}
      {amma && <circle cx="25" cy="-12" r="1.9" fill="currentColor" stroke="none" />}
      {woman && <circle cx="-6" cy="13" r={amma ? 2.6 : 2} fill={paper} strokeWidth="1.2" />}
      {role === "narrator" && <path d="M11 11l3-2m1 4 3-2" strokeWidth="1" opacity=".35" />}
      {role === "girl" && (
        // a small stud in her ear, and lashes
        <g>
          <circle cx="-6" cy="13" r="1.5" fill="currentColor" stroke="none" />
          <path d={`M${eye[0] + 2} ${eye[1] - 4}l3-3m-1 5 3-2`} strokeWidth="1" opacity=".7" />
        </g>
      )}
      <Eye x={eye[0]} y={eye[1]} mood={mood} size={kid ? 1 : 0.92} />
      <path d={brow(mood, eye[0], eye[1] - 8)} strokeWidth="2.1" fill="none" />
      {spectacles && (
        <g strokeWidth="1.4" fill="none">
          <rect x={eye[0] - 7} y={eye[1] - 6} width="15" height="11" rx="3.5" />
          <path d={`M${eye[0] - 7} ${eye[1] - 2}L-8 -4`} />
        </g>
      )}
      {role !== "clown" && <Mouth mood={mood} x={mouth[0]} y={mouth[1]} />}
    </g>
  );
}

/** One of the girl's two plaits, braided down her back and tied with a ribbon. Drawn after her shirt, in the head's frame. */
export function Plait() {
  return (
    <g>
      <path d="M-22 12C-28 26-30 44-29 62C-28 70-26 76-24 80C-22 74-20 66-20 58C-20 42-17 26-12 15Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-27 28l4 3m-5 7 5 3m-5 7 5 3m-5 7 5 3m-5 7 5 2" stroke={paper} strokeWidth="1" opacity=".55" />
      {/* the ribbon at its end, in a bow */}
      <path d="M-24 80c-10-4-14 4-8 8 3 2 6-1 8-8Zm0 0c6-8 14-4 10 3-2 4-7 2-10-3Z" fill={paper} strokeWidth="1.2" />
      <path d="M-24 80l-4 12m4-12 3 12" strokeWidth="1.3" />
    </g>
  );
}

/** Akka's low ponytail, hanging down her back. Drawn after her kurti, in the head's frame. */
export function Ponytail() {
  return (
    <g>
      <path d="M-24 10C-30 22-34 40-34 58C-34 70-30 80-26 86C-24 76-24 64-22 52C-20 38-16 24-12 14Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-28 30C-29 44-29 58-27 72" stroke={paper} strokeWidth="1" opacity=".45" />
      <path d="M-27 12q4 4 10 1" stroke={paper} strokeWidth="2.4" />
    </g>
  );
}
