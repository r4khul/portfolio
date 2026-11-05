import { Head, Neck, Ponytail, capsule, joint, paper, place, type Mood, type Point, type Role } from "./memory-figures";

/**
 * The cast, drawn from one rig so each person stays the same person in every
 * scene: the same head, build and clothes, only posed differently.
 *
 * Every measurement comes from a standing height H. Bodies are in profile,
 * facing right, with the floor at y = 0 beneath the pelvis; `facing` -1
 * mirrors the whole person. `pose` sets the legs: standing, or sitting
 * cross-legged on the floor. Hands go where a scene points them.
 *
 * - me: a curly-haired kid in my striped T-shirt, shorts and slippers
 * - brother: a little taller, his dark T-shirt and striped track pants
 * - cousin / cousin-swept: Chithappa's sons, a pinstriped tee or a dark one
 * - chithappa: fit, full-sleeved shirt tucked into trousers, spectacles
 * - amma: a little short, in a saree with the pallu over her shoulder
 * - anna: the thin shopkeeper in his shirt, grey hair, spectacles, beard
 * - tenant: Anna, who rented one of our houses: tall, a little chubby, spectacles, a checked shirt and jeans
 * - akka: his wife, as tall, in a long kurti with a dupatta, over leggings
 * - vendor: the pani puri man in his vest
 * - clown: the McDonald's clown, sitting on his bench in his striped sleeves and big shoes
 *
 * `wear` dresses anyone differently for one scene: my school uniform, my hoodie.
 */
export type Who = "me" | "brother" | "cousin" | "cousin-swept" | "chithappa" | "amma" | "anna" | "tenant" | "akka" | "vendor" | "clown";
type Top = "stripe" | "solid" | "pin" | "pocket" | "full-shirt" | "shirt" | "blouse" | "check" | "kurti" | "hoodie" | "vest" | "jumpsuit";
type Bottom = "shorts" | "track" | "plain" | "trousers" | "saree" | "jumpsuit";
export type Wear = { top?: Top; bottom?: Bottom; shoes?: boolean };

type Build = {
  role: Role;
  /** Head heights in the standing height: lower is younger. */
  heads: number;
  /** Chest depth, side on. */
  depth: number;
  leg: number;
  arm: readonly [upper: number, fore: number];
  limb: number;
  top: Top;
  bottom: Bottom;
  shoes?: boolean;
  spectacles?: boolean;
};

const CAST: Record<Who, Build> = {
  me: { role: "narrator", heads: 4.7, depth: 0.16, leg: 0.41, arm: [0.175, 0.15], limb: 0.05, top: "stripe", bottom: "shorts" },
  brother: { role: "brother", heads: 5.6, depth: 0.145, leg: 0.47, arm: [0.185, 0.16], limb: 0.045, top: "solid", bottom: "track" },
  cousin: { role: "cousin", heads: 5.5, depth: 0.145, leg: 0.46, arm: [0.185, 0.16], limb: 0.045, top: "pin", bottom: "shorts" },
  "cousin-swept": { role: "cousin-swept", heads: 5.5, depth: 0.145, leg: 0.46, arm: [0.185, 0.16], limb: 0.045, top: "pocket", bottom: "plain" },
  chithappa: { role: "chithappa", heads: 6.4, depth: 0.135, leg: 0.48, arm: [0.19, 0.165], limb: 0.04, top: "full-shirt", bottom: "trousers", shoes: true, spectacles: true },
  amma: { role: "amma", heads: 6.1, depth: 0.145, leg: 0.47, arm: [0.18, 0.155], limb: 0.04, top: "blouse", bottom: "saree" },
  anna: { role: "anna", heads: 6.4, depth: 0.125, leg: 0.48, arm: [0.19, 0.165], limb: 0.038, top: "shirt", bottom: "trousers", spectacles: true },
  tenant: { role: "tenant", heads: 6.6, depth: 0.17, leg: 0.47, arm: [0.19, 0.165], limb: 0.046, top: "check", bottom: "plain", spectacles: true },
  akka: { role: "akka", heads: 6.4, depth: 0.16, leg: 0.47, arm: [0.185, 0.16], limb: 0.043, top: "kurti", bottom: "plain" },
  vendor: { role: "vendor", heads: 6.3, depth: 0.13, leg: 0.48, arm: [0.19, 0.165], limb: 0.04, top: "vest", bottom: "plain" },
  clown: { role: "clown", heads: 5.2, depth: 0.17, leg: 0.43, arm: [0.18, 0.16], limb: 0.05, top: "jumpsuit", bottom: "jumpsuit", shoes: true },
};

/** Standing heights, relative to each other. My brother is only a little taller than me. */
export const HEIGHT: Record<Who, number> = { me: 170, brother: 198, cousin: 194, "cousin-swept": 190, chithappa: 226, amma: 198, anna: 218, tenant: 238, akka: 224, vendor: 214, clown: 228 };

export function measure(who: Who, height = HEIGHT[who], wear: Wear = {}) {
  const build: Build = { ...CAST[who], ...wear };
  const k = height / build.heads / 71;
  return {
    build,
    H: height,
    /** head scale, for `Head` */
    k,
    /** pelvis to the shoulder line */
    torso: height * (1 - build.leg) - 82 * k,
    depth: build.depth * height,
    limb: build.limb * height,
    upper: build.arm[0] * height,
    fore: build.arm[1] * height,
    leg: build.leg * height,
  };
}
type Measure = ReturnType<typeof measure>;

const rotate = ([x, y]: Point, degrees: number): Point => {
  const r = (degrees * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};
const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];

/** Limb segments in two passes, every outline then every fill, so joints are seamless. */
function Limb({ parts, solid = false, line = 1.7 }: { parts: string[]; solid?: boolean; line?: number }) {
  return (
    <g>
      {parts.map((d, index) => <path key={`l${index}`} d={d} stroke={solid ? paper : "currentColor"} strokeWidth={line * 2} />)}
      {parts.map((d, index) => <path key={`f${index}`} d={d} fill={solid ? "currentColor" : paper} stroke="none" />)}
    </g>
  );
}

/** The shirt or blouse, upright in the torso's own frame: pelvis at the origin, shoulders at -torso. */
function Shirt({ m, seated }: { m: Measure; seated: boolean }) {
  const { torso: T, depth: d, H, build } = m;
  const tucked = build.top === "full-shirt" || build.top === "shirt";
  const kurti = build.top === "kurti";
  const hem = tucked ? -0.01 * H : kurti ? (seated ? 0.06 : 0.2) * H : build.top === "hoodie" ? 0.045 * H : 0.035 * H;
  // a kurti flares a little below the hips
  const flare = kurti ? 0.1 * d : 0;
  const chest = build.top === "blouse" || kurti ? 0.58 : 0.55;
  const shape = `M${-0.16 * d} ${-T - 1}C${-0.42 * d} ${-T} ${-0.55 * d} ${-T + 0.06 * H} ${-0.53 * d} ${-T + 0.13 * H}L${-0.49 * d} ${-0.06 * H}C${-0.5 * d} ${-0.01 * H} ${-0.53 * d - flare} ${hem * 0.5} ${-0.54 * d - flare} ${hem}L${0.53 * d + flare} ${hem}C${0.54 * d + flare} ${hem * 0.4} ${0.52 * d} ${-0.05 * H} ${0.52 * d} ${-T * 0.42}C${0.53 * d} ${-T * 0.7} ${chest * d} ${-T + 0.06 * H} ${0.4 * d} ${-T + 0.012 * H}C${0.3 * d} ${-T} ${0.22 * d} ${-T - 1} ${0.15 * d} ${-T - 1}Z`;
  const solid = build.top === "solid" || build.top === "pocket" || build.top === "hoodie";
  return (
    <g>
      {build.top === "hoodie" && (
        // the hood, bunched behind my neck
        <path d={`M${-0.1 * d} ${-T + 0.004 * H}C${-0.5 * d} ${-T - 0.035 * H} ${-0.78 * d} ${-T + 0.02 * H} ${-0.66 * d} ${-T + 0.1 * H}C${-0.6 * d} ${-T + 0.13 * H} ${-0.5 * d} ${-T + 0.12 * H} ${-0.4 * d} ${-T + 0.08 * H}Z`} fill="currentColor" stroke={paper} strokeWidth="1.4" />
      )}
      {kurti && (
        // the dupatta, over her shoulder and down her back
        <path d={`M${-0.3 * d} ${-T + 0.004 * H}C${-0.72 * d} ${-T + 0.06 * H} ${-0.82 * d} ${-0.1 * H} ${-0.8 * d} ${hem * 0.75}L${-0.62 * d} ${hem * 0.8}C${-0.64 * d} ${-0.08 * H} ${-0.56 * d} ${-T + 0.12 * H} ${-0.12 * d} ${-T + 0.004 * H}Z`} fill={paper} strokeWidth="1.4" />
      )}
      <path d={shape} fill={solid ? "currentColor" : paper} stroke={solid ? paper : "currentColor"} strokeWidth="1.6" />
      {build.top === "check" && (
        <path
          d={[...[-0.36, -0.18, 0, 0.18, 0.36].map((x) => `M${x * d} ${-T + 0.04 * H}V${hem - 2}`), ...Array.from({ length: Math.floor((T + hem - 0.06 * H) / (0.045 * H)) }, (_, i) => `M${-0.46 * d} ${-T + 0.07 * H + i * 0.045 * H}H${0.47 * d}`)].join("")}
          strokeWidth=".7"
          opacity=".3"
        />
      )}
      {kurti && (
        <g>
          {/* the printed border at her neck and hem, and the slit at her side */}
          <path d={`M${-0.52 * d - flare * 0.9} ${hem - 0.022 * H}H${0.52 * d + flare * 0.9}`} strokeWidth="2.4" strokeDasharray="1 3" opacity=".7" />
          <path d={`M${-0.5 * d} ${0.02 * H}V${hem - 1}`} strokeWidth=".9" opacity=".5" />
          <path d={`M${-0.04 * d} ${-T + 0.006 * H}q${0.2 * d} ${0.075 * H} ${0.4 * d} 0`} strokeWidth="2.2" strokeDasharray="1 2.6" opacity=".6" />
          <path d={`M${-0.3 * d} ${-T + 0.004 * H}C${-0.72 * d} ${-T + 0.06 * H} ${-0.82 * d} ${-0.1 * H} ${-0.8 * d} ${hem * 0.75}`} strokeWidth="1.8" strokeDasharray="1 3" opacity=".5" />
        </g>
      )}
      {build.top === "hoodie" && (
        <g stroke={paper}>
          {/* the pouch pocket, the drawstrings, the ribbed hem, and my shirt's collar peeking out */}
          <path d={`M${0.02 * d} ${hem - 0.012 * H}L${0.08 * d} ${-0.11 * H}H${0.46 * d}L${0.5 * d} ${hem - 0.012 * H}`} strokeWidth="1" opacity=".7" />
          <path d={`M${0.1 * d} ${-T + 0.012 * H}l${0.02 * d} ${0.07 * H}m${0.14 * d} ${-0.07 * H}l${-0.01 * d} ${0.065 * H}`} strokeWidth="1.1" opacity=".75" />
          <path d={`M${-0.52 * d} ${hem - 0.012 * H}H${0.52 * d}`} strokeWidth=".9" opacity=".6" />
          <path d={`M${0.02 * d} ${-T + 0.002 * H}l${0.12 * d} ${0.03 * H} ${0.12 * d} ${-0.03 * H}`} fill={paper} stroke="currentColor" strokeWidth="1" />
        </g>
      )}
      {build.top === "vest" && <path d={`M${-0.36 * d} ${-T + 0.01 * H}q${0.12 * d} ${0.07 * H} ${0.04 * d} ${0.12 * H}`} strokeWidth=".8" opacity=".45" />}
      {build.top === "jumpsuit" && <path d={`M${0.3 * d} ${-T + 0.03 * H}V${hem}M${-0.52 * d} ${-0.03 * H}H${0.53 * d}`} strokeWidth="1" opacity=".55" />}
      {build.top === "stripe" && (
        <path d={`M${-0.53 * d} ${-T + 0.36 * T}L${0.53 * d} ${-T + 0.34 * T}L${0.525 * d} ${-T + 0.47 * T}L${-0.52 * d} ${-T + 0.49 * T}Z`} fill="currentColor" stroke="none" />
      )}
      {build.top === "pin" && (
        <path d={[-0.3, -0.1, 0.1, 0.3].map((x) => `M${x * d} ${-T + 0.03 * H}V${hem - 2}`).join("")} strokeWidth=".8" opacity=".35" />
      )}
      {build.top === "pocket" && <path d={`M${0.14 * d} ${-T + 0.1 * H}h${0.28 * d}v${0.07 * H}h${-0.28 * d}Z`} stroke={paper} strokeWidth=".9" opacity=".7" />}
      {solid && <path d={`M${-0.1 * d} ${-T + 0.18 * T}q${0.1 * d} ${0.25 * T} ${0.02 * d} ${0.5 * T}`} stroke={paper} strokeWidth=".8" opacity=".45" />}
      {!solid && !tucked && build.top !== "blouse" && <path d={`M${-0.12 * d} ${-T + 0.62 * T}q${0.1 * d} ${0.18 * T} ${0.02 * d} ${0.32 * T}`} strokeWidth=".8" opacity=".35" />}
      {/* neckline */}
      {build.top !== "hoodie" && <path d={`M${-0.08 * d} ${-T}q${0.15 * d} ${(build.top === "vest" ? 0.08 : 0.05) * H} ${0.3 * d} 0`} stroke={solid ? paper : "currentColor"} strokeWidth="1.1" />}
      {build.top === "check" && (
        <g>
          <path d={`M${0.04 * d} ${-T + 2}l${0.12 * d} ${0.035 * H} ${0.12 * d} ${-0.035 * H}M${0.16 * d} ${-T + 0.035 * H}V${hem - 2}`} strokeWidth="1" />
          {[0.12, 0.3, 0.48, 0.66].map((t) => <circle key={t} cx={0.2 * d} cy={-T + t * T + 0.04 * H} r={0.005 * H} fill="currentColor" stroke="none" />)}
        </g>
      )}
      {tucked && (
        <g>
          <path d={`M${0.04 * d} ${-T + 2}l${0.12 * d} ${0.035 * H} ${0.12 * d} ${-0.035 * H}M${0.16 * d} ${-T + 0.035 * H}V${-0.03 * H}`} strokeWidth="1" />
          {[0.12, 0.26, 0.4, 0.54].map((t) => <circle key={t} cx={0.2 * d} cy={-T + t * T + 0.04 * H} r={0.006 * H} fill="currentColor" stroke="none" />)}
          {build.top === "full-shirt" && (
            <>
              <path d={`M${0.24 * d} ${-T + 0.09 * H}h${0.24 * d}v${0.055 * H}h${-0.24 * d}Z`} strokeWidth=".9" opacity=".6" />
              <path d={`M${0.33 * d} ${-T + 0.065 * H}v${0.05 * H}`} strokeWidth="1.6" />
            </>
          )}
          {build.bottom === "trousers" && (
            <>
              <path d={`M${-0.52 * d} ${-0.035 * H}H${0.53 * d}V${0.002 * H}H${-0.53 * d}Z`} fill="currentColor" stroke="none" />
              <path d={`M${0.18 * d} ${-0.031 * H}h${0.1 * d}v${0.026 * H}h${-0.1 * d}Z`} fill={paper} stroke="none" />
            </>
          )}
        </g>
      )}
    </g>
  );
}

type Hand = Point | "hang" | "pocket" | "lap" | "knee";
type Pose = "stand" | "sit" | "seat";

function handAt(hand: Hand, m: Measure, pose: Pose, pelvis: Point, shoulder: Point): Point {
  if (typeof hand !== "string") return add(pelvis, hand);
  switch (hand) {
    case "pocket":
      return add(pelvis, [0.42 * m.depth, -0.01 * m.H]);
    case "lap":
      return add(pelvis, pose === "seat" ? [0.16 * m.H, -0.035 * m.H] : [0.2 * m.H, -0.035 * m.H]);
    case "knee":
      return add(pelvis, pose === "seat" ? [0.23 * m.H, -0.035 * m.H] : [0.27 * m.H, -0.01 * m.H]);
    default:
      return pose !== "stand"
        ? add(pelvis, [0.12 * m.H, -0.01 * m.H])
        : add(shoulder, [0.035 * m.H, m.upper + m.fore - 0.012 * m.H]);
  }
}

function Arm({ m, shoulder, hand, far = false }: { m: Measure; shoulder: Point; hand: Point; far?: boolean }) {
  const { build, limb, upper, fore } = m;
  const elbow = joint(shoulder, hand, upper, fore, 1);
  const full = build.top === "full-shirt" || build.top === "hoodie" || build.top === "jumpsuit";
  const sleeveSolid = build.top === "solid" || build.top === "pocket";
  const cuff: Point = [shoulder[0] + (elbow[0] - shoulder[0]) * 0.48, shoulder[1] + (elbow[1] - shoulder[1]) * 0.48];
  const wrist: Point = [elbow[0] + (hand[0] - elbow[0]) * 0.86, elbow[1] + (hand[1] - elbow[1]) * 0.86];
  const midFore: Point = [elbow[0] + (hand[0] - elbow[0]) * 0.45, elbow[1] + (hand[1] - elbow[1]) * 0.45];
  return (
    <g opacity={far ? 0.6 : 1}>
      {full ? (
        <>
          <Limb solid={build.top === "hoodie"} parts={[capsule(shoulder, elbow, limb * 1.3, limb * 1.15), capsule(elbow, wrist, limb * 1.15, limb * 1)]} line={1.3} />
          {/* the clown's red and white stripes, as bands across his sleeve */}
          {build.top === "jumpsuit" && <path d={`M${shoulder[0]} ${shoulder[1]}L${elbow[0]} ${elbow[1]}L${wrist[0]} ${wrist[1]}`} strokeWidth={limb * 1.05} strokeDasharray={`${limb * 0.45} ${limb * 0.45}`} strokeLinecap="butt" opacity=".75" />}
          <path d={capsule(wrist, hand, limb * 0.75, limb * 0.7)} fill={paper} strokeWidth="1.3" />
          <path d={`M${wrist[0] - limb * 0.3} ${wrist[1] - limb * 0.55}l${limb * 0.15} ${limb * 1.1}`} stroke={build.top === "hoodie" ? paper : "currentColor"} strokeWidth="1" />
        </>
      ) : build.top === "kurti" ? (
        <>
          <Limb parts={[capsule(elbow, hand, limb * 0.85, limb * 0.72), capsule(shoulder, elbow, limb, limb * 0.86)]} line={1.25} />
          {/* three-quarter sleeves, with the same printed border */}
          <Limb parts={[capsule(shoulder, elbow, limb * 1.3, limb * 1.15), capsule(elbow, midFore, limb * 1.15, limb * 1.05)]} line={1.25} />
          <path d={`M${midFore[0]} ${midFore[1]}L${elbow[0] + (midFore[0] - elbow[0]) * 0.8} ${elbow[1] + (midFore[1] - elbow[1]) * 0.8}`} strokeWidth={limb * 1.05} strokeDasharray="1 2.6" strokeLinecap="butt" opacity=".55" />
        </>
      ) : build.top === "vest" ? (
        <Limb parts={[capsule(elbow, hand, limb * 0.85, limb * 0.72), capsule(shoulder, elbow, limb, limb * 0.86)]} line={1.25} />
      ) : (
        <>
          <Limb parts={[capsule(elbow, hand, limb * 0.85, limb * 0.72), capsule(shoulder, elbow, limb, limb * 0.86)]} line={1.25} />
          <path
            d={capsule(shoulder, cuff, limb * (build.top === "blouse" ? 1.35 : 1.42), limb * (build.top === "blouse" ? 1.25 : 1.3))}
            fill={sleeveSolid ? "currentColor" : paper}
            stroke={sleeveSolid ? paper : "currentColor"}
            strokeWidth="1.3"
          />
        </>
      )}
      <circle cx={hand[0]} cy={hand[1]} r={limb * 0.55} fill={paper} strokeWidth="1.3" />
    </g>
  );
}

function Slipper({ ankle, m, far, degrees = 0 }: { ankle: Point; m: Measure; far?: boolean; degrees?: number }) {
  const s = m.H / 200;
  if (m.build.shoes) {
    // the clown's shoes are twice the size of anyone's
    const big = m.build.role === "clown" ? 1.7 : 1;
    return <path transform={place(ankle, degrees, s * 0.82 * big)} d="M-8-3C-2-7 12-7 20-2L23 4H-10Z" fill="currentColor" stroke={paper} strokeWidth={1 / big} opacity={far ? 0.7 : 1} />;
  }
  return (
    <g transform={place(ankle, degrees, s)} opacity={far ? 0.6 : 1}>
      <path d="M-8-5C2-8 15-6 23 0L24 4H-10Z" fill={paper} strokeWidth="1.4" />
      <path d="M-12 4H27Q29 8 25 8H-11Z" fill={paper} strokeWidth="1.2" />
      <path d="M3 1L12-4" strokeWidth="2.6" />
    </g>
  );
}

/** How a seated person's legs hang: thigh down from level, shin forward of plumb, and the foot's tilt, in degrees. */
export type Seated = { thigh: number; shin: number; foot?: number };

/** Legs and whatever covers them, in the figure's frame. */
function Legs({ m, pose, pelvis, side, seated }: { m: Measure; pose: Pose; pelvis: Point; side: "near" | "far"; seated: Seated }) {
  const { H, depth: d, limb, build } = m;
  const far = side === "far";
  let hip: Point;
  let knee: Point;
  let ankle: Point;
  if (pose === "seat") {
    // on a chair, a bench or a bike: thighs along the seat, shins hanging from the knee
    hip = add(pelvis, [far ? -0.05 * d : 0.06 * d, -0.01 * H]);
    const offset: Point = far ? [-0.03 * H, -0.012 * H] : [0, 0];
    knee = add(add(hip, rotate([0.235 * H, 0], seated.thigh)), offset);
    ankle = add(knee, rotate([0, 0.225 * H], -seated.shin));
  } else if (pose === "stand") {
    hip = add(pelvis, [far ? -0.12 * d : 0.1 * d, -0.01 * H]);
    ankle = [far ? -0.15 * d : 0.12 * d, -0.03 * H];
    const reach = Math.hypot(ankle[0] - hip[0], ankle[1] - hip[1]);
    knee = joint(hip, ankle, reach * 0.505, reach * 0.505, -1);
  } else {
    // cross-legged on the floor: knees out in front, shins folded under
    hip = add(pelvis, [far ? -0.05 * d : 0.06 * d, -0.01 * H]);
    knee = add(pelvis, far ? [0.25 * H, -0.03 * H] : [0.29 * H, 0.025 * H]);
    ankle = add(pelvis, far ? [0.13 * H, 0.04 * H] : [0.06 * H, 0.05 * H]);
  }
  const thigh = capsule(hip, knee, limb * 1.55, limb * 1.15);
  const shin = capsule(knee, ankle, limb * 1.1, limb * 0.8);
  const covered = build.bottom === "track" || build.bottom === "plain" || build.bottom === "trousers";
  const shortsEnd: Point = [hip[0] + (knee[0] - hip[0]) * 0.5, hip[1] + (knee[1] - hip[1]) * 0.5];
  const sock: Point = [ankle[0] + (knee[0] - ankle[0]) * 0.32, ankle[1] + (knee[1] - ankle[1]) * 0.32];
  return (
    <g opacity={far ? 0.65 : 1}>
      {covered ? (
        <Limb solid parts={[shin, thigh]} line={0.9} />
      ) : build.bottom === "jumpsuit" ? (
        <>
          <Limb parts={[shin, thigh]} line={1.2} />
          {/* striped socks */}
          <path d={`M${ankle[0]} ${ankle[1]}L${sock[0]} ${sock[1]}`} strokeWidth={limb * 0.95} strokeDasharray={`${limb * 0.4} ${limb * 0.4}`} strokeLinecap="butt" opacity=".75" />
        </>
      ) : (
        <>
          <Limb parts={[shin, thigh]} line={1.2} />
          <path d={capsule(hip, shortsEnd, limb * 1.95, limb * 1.7)} fill="currentColor" stroke={paper} strokeWidth="1" />
        </>
      )}
      {build.bottom === "track" && (
        <path d={`M${hip[0]} ${hip[1] - limb * 0.4}L${knee[0]} ${knee[1] - limb * 0.35}L${ankle[0]} ${ankle[1] - limb * 0.25}`} stroke={paper} strokeWidth="1.1" />
      )}
      {build.bottom === "trousers" && pose === "stand" && <path d={`M${hip[0] + limb * 0.2} ${hip[1] + 4}L${ankle[0] + limb * 0.15} ${ankle[1] - 2}`} stroke={paper} strokeWidth=".6" opacity=".5" />}
      {pose === "stand" ? (
        <Slipper ankle={[ankle[0], -0.004 * H]} m={m} far={far} />
      ) : pose === "seat" ? (
        <Slipper ankle={ankle} m={m} far={far} degrees={seated.foot ?? 0} />
      ) : (
        // a sole turned out toward us, the way a sitting foot shows
        <path d={capsule(add(ankle, [-0.02 * H, 0.005 * H]), add(ankle, [0.035 * H, 0.012 * H]), limb * 0.95, limb * 0.85)} fill={paper} strokeWidth="1.2" />
      )}
    </g>
  );
}

/** Amma's saree: pleated in front, its pallu across her chest and down her back. */
function Saree({ m, pelvis, torsoTop }: { m: Measure; pelvis: Point; torsoTop: number }) {
  const { H, depth: d } = m;
  const [px, py] = pelvis;
  const waist = py - 0.09 * H;
  return (
    <g>
      <path d={`M${px - 0.5 * d} ${waist}C${px - 0.56 * d} ${py + 0.1 * H} ${px - 0.66 * d} ${-0.06 * H} ${px - 0.64 * d} ${-0.012 * H}H${px + 0.86 * d}C${px + 0.78 * d} ${-0.1 * H} ${px + 0.56 * d} ${py + 0.05 * H} ${px + 0.5 * d} ${waist}Z`} fill="currentColor" stroke={paper} strokeWidth="1.1" />
      <path d={[0.22, 0.36, 0.5].map((t) => `M${px + t * d} ${waist + 0.05 * H}L${px + (t + 0.22) * d} ${-0.02 * H}`).join("")} stroke={paper} strokeWidth=".8" opacity=".6" />
      <path d={`M${px - 0.62 * d} ${-0.04 * H}H${px + 0.82 * d}`} stroke={paper} strokeWidth="1.2" opacity=".8" />
      {/* the pallu */}
      <path d={`M${px + 0.48 * d} ${waist - 0.01 * H}L${px - 0.28 * d} ${torsoTop + 0.01 * H}C${px - 0.48 * d} ${torsoTop + 0.03 * H} ${px - 0.62 * d} ${torsoTop + 0.08 * H} ${px - 0.72 * d} ${py - 0.06 * H}L${px - 0.52 * d} ${py - 0.07 * H}C${px - 0.5 * d} ${torsoTop + 0.15 * H} ${px - 0.2 * d} ${torsoTop + 0.06 * H} ${px + 0.52 * d} ${waist + 0.05 * H}Z`} fill="currentColor" stroke={paper} strokeWidth="1.1" />
      <path d={`M${px + 0.46 * d} ${waist + 0.02 * H}L${px - 0.26 * d} ${torsoTop + 0.035 * H}`} stroke={paper} strokeWidth=".9" opacity=".75" />
      <path d={`M${px - 0.7 * d} ${py - 0.075 * H}l${0.18 * d} 0`} stroke={paper} strokeWidth="1.2" opacity=".75" />
    </g>
  );
}

export type PersonProps = {
  who: Who;
  x: number;
  y: number;
  facing?: 1 | -1;
  pose?: Pose;
  /** multiplies the person's standing height, for a scene's own scale */
  scale?: number;
  lean?: number;
  tilt?: number;
  mood?: Mood;
  near?: Hand;
  far?: Hand;
  /** draw the far arm, or leave it hidden behind the body */
  farArm?: boolean;
  /**
   * "body" leaves out the near arm and "arm" draws only it, so a scene can put a prop between them.
   * "far" draws only the far arm and leg and "core" everything else but the near arm, so a bike can go between.
   */
  part?: "all" | "body" | "arm" | "far" | "core";
  /** for the seated pose, with `y` the seat under them */
  seated?: Seated;
  wear?: Wear;
};

const SEATED: Seated = { thigh: 4, shin: 4 };

function pelvisOf(pose: Pose, m: Measure): Point {
  return pose === "stand" ? [0, -m.leg] : pose === "seat" ? [0, -0.03 * m.H] : [0, -0.06 * m.H];
}

/** Where a person's near and far hands land in the scene, to put what they hold there. */
export function handsOf({ who, x, y, facing = 1, pose = "stand", scale = 1, lean = 0, near = "hang", far = "hang", wear }: PersonProps): { near: Point; far: Point } {
  const m = measure(who, HEIGHT[who] * scale, wear);
  const pelvis = pelvisOf(pose, m);
  const shoulderNear = add(pelvis, rotate([-0.04 * m.depth, -m.torso + 0.045 * m.H], lean));
  const shoulderFar = add(shoulderNear, [-0.06 * m.depth, 0.01 * m.H]);
  const world = ([hx, hy]: Point): Point => [x + facing * hx, y + hy];
  return { near: world(handAt(near, m, pose, pelvis, shoulderNear)), far: world(handAt(far, m, pose, pelvis, shoulderFar)) };
}

export function Person({ who, x, y, facing = 1, pose = "stand", scale = 1, lean = 0, tilt = 0, mood = "calm", near = "hang", far = "hang", farArm = true, part = "all", seated = SEATED, wear }: PersonProps) {
  const m = measure(who, HEIGHT[who] * scale, wear);
  const { H, k, torso, depth: d } = m;
  const pelvis = pelvisOf(pose, m);
  const toWorld = (local: Point) => add(pelvis, rotate(local, lean));
  const shoulderNear = toWorld([-0.04 * d, -torso + 0.045 * H]);
  const shoulderFar = add(shoulderNear, [-0.06 * d, 0.01 * H]);
  const headAt = toWorld([2 * k, -torso - 44 * k]);
  const headTurn = lean * 0.4 + tilt;
  const saree = m.build.bottom === "saree";
  const kurti = m.build.top === "kurti";
  const nearArm = <Arm m={m} shoulder={shoulderNear} hand={handAt(near, m, pose, pelvis, shoulderNear)} />;
  if (part === "arm") return <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>{nearArm}</g>;
  const farSide = (
    <>
      {farArm && <Arm m={m} shoulder={shoulderFar} hand={handAt(far, m, pose, pelvis, shoulderFar)} far />}
      {!saree && <Legs m={m} pose={pose} pelvis={pelvis} side="far" seated={seated} />}
    </>
  );
  if (part === "far") return <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>{farSide}</g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>
      {part !== "core" && farSide}
      <Neck role={m.build.role} at={headAt} degrees={headTurn} scale={k} back={toWorld([-9 * k, -torso + 0.03 * H])} front={toWorld([0.05 * d + 9 * k, -torso + 0.03 * H])} />
      <g transform={place(headAt, headTurn, k)}>
        <Head role={m.build.role} mood={mood} spectacles={m.build.spectacles} />
      </g>
      {/* a kurti hangs over her legs */}
      {kurti && <Legs m={m} pose={pose} pelvis={pelvis} side="near" seated={seated} />}
      <g transform={place(pelvis, lean)}>
        <Shirt m={m} seated={pose !== "stand"} />
      </g>
      {m.build.role === "akka" && <g transform={place(headAt, headTurn, k)}><Ponytail /></g>}
      {saree ? <Saree m={m} pelvis={pelvis} torsoTop={pelvis[1] - torso} /> : !kurti && <Legs m={m} pose={pose} pelvis={pelvis} side="near" seated={seated} />}
      {part === "all" && nearArm}
    </g>
  );
}
