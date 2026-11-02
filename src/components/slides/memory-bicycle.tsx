import { Head, capsule, joint, paper, place, polar, type Mood, type Point } from "./memory-figures";
import { HELD_ANGLES, Pouch, heldSleeve } from "./memory-props";

/**
 * His bicycle, side on: an old black roadster with a full chain guard and
 * the flat metal carrier I sat on. Local units put the ground between the
 * wheels at the origin, facing right, with 100-unit wheels (28 inches, so a
 * unit is about 3.5mm). The art places it at 1200×440 scale.
 *
 * Three paces:
 * - rush: the ride there. He leans into the pedals; I grip his shirt, grinning.
 * - ride: the ride home, facing back the way we came. Upright and slow, my
 *   head down, the ice tubes hanging from my hand. He looks back at me once.
 * - reflection: the same slow ride, remembered. My head rests on his back.
 *
 * Wheels, cranks and legs carry `data-bike` hooks; `pedalBicycle` turns them
 * with the scene's scroll progress.
 */
export type Pace = "rush" | "ride" | "reflection";

const REAR: Point = [-162, -100];
const FRONT: Point = [162, -100];
const WHEEL = 100;
const CRANK: Point = [-32, -80];
const CRANK_ARM = 46;
const GEAR = 2.6;
// He was only three or four years older than me: a low saddle, a boy's
// legs, and a torso a tenth shorter than a grown man's would be.
const HIP: Point = [-96, -248];
const THIGH = 106;
const SHIN = 117;
const TORSO = 0.9;

const LEAN: Record<Pace, number> = { rush: 30, ride: 12, reflection: 14 };
/** Crank revolutions across the scene: frantic there, unhurried home. */
const TURNS: Record<Pace, number> = { rush: 7, ride: 2.4, reflection: 1.6 };
/** The stretch of the ride home when he looks back over his shoulder. */
const GLANCE: readonly [number, number] = [0.5, 0.78];

const turn = ([x, y]: Point, degrees: number): Point => {
  const radians = (degrees * Math.PI) / 180;
  return [x * Math.cos(radians) - y * Math.sin(radians), x * Math.sin(radians) + y * Math.cos(radians)];
};
const fromHip = (pace: Pace, local: Point): Point => {
  const [x, y] = turn([local[0] * TORSO, local[1] * TORSO], LEAN[pace]);
  return [HIP[0] + x, HIP[1] + y];
};
const pedal = (degrees: number) => polar(CRANK, CRANK_ARM, degrees);

function leg(degrees: number) {
  const ball = pedal(degrees);
  const ankle: Point = [ball[0] - 13, ball[1] - 11];
  const knee = joint(HIP, ankle, THIGH, SHIN, -1);
  return { thigh: capsule(HIP, knee, 35, 27), shin: capsule(knee, ankle, 26, 19), knee, ankle };
}

const stripe = (knee: Point, ankle: Point) =>
  `M${HIP[0] + 6} ${HIP[1] - 4}L${(knee[0] + 3).toFixed(1)} ${(knee[1] - 9).toFixed(1)}L${(ankle[0] + 2).toFixed(1)} ${(ankle[1] - 9).toFixed(1)}`;

/** Called every frame with the scene's progress; writes only what moved. */
const hooks = new WeakMap<ParentNode, { bike: SVGGElement | null; parts: Map<string, Element[]> }>();

export function pedalBicycle(root: ParentNode, progress: number) {
  let found = hooks.get(root);
  if (!found) {
    const bike = root.querySelector<SVGGElement>("[data-bike-pace]");
    const parts = new Map<string, Element[]>();
    bike?.querySelectorAll<SVGElement>("[data-bike]").forEach((el) => {
      const name = el.dataset.bike!;
      parts.set(name, [...(parts.get(name) ?? []), el]);
    });
    found = { bike, parts };
    hooks.set(root, found);
  }
  const { bike, parts } = found;
  if (!bike) return;
  const pace = bike.dataset.bikePace as Pace;
  const set = (name: string, attribute: string, value: string) => {
    for (const el of parts.get(name) ?? []) {
      if (el.getAttribute(attribute) !== value) el.setAttribute(attribute, value);
    }
  };
  const a = progress * TURNS[pace] * 360;
  for (const [side, degrees] of [["near", a], ["far", a + 180]] as const) {
    const pose = leg(degrees);
    set(`thigh-${side}`, "d", pose.thigh);
    set(`shin-${side}`, "d", pose.shin);
    set(`stripe-${side}`, "d", stripe(pose.knee, pose.ankle));
    set(`foot-${side}`, "transform", place(pose.ankle));
    set(`crank-${side}`, "d", capsule(CRANK, pedal(degrees), 10, 8));
    set(`pedal-${side}`, "transform", place(pedal(degrees)));
  }
  const spin = `rotate(${((a * GEAR) % 360).toFixed(1)})`;
  set("spin-rear", "transform", spin);
  set("spin-front", "transform", spin);
  if (pace === "ride") {
    const back = progress >= GLANCE[0] && progress < GLANCE[1];
    set("look-back", "opacity", back ? "1" : "0");
    set("look-ahead", "opacity", back ? "0" : "1");
  }
}

const arc = (center: Point, radius: number, from: number, to: number) => {
  const [x1, y1] = polar(center, radius, from);
  const [x2, y2] = polar(center, radius, to);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${radius} ${radius} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

/** Hollow tubes: an ink pass, then a paper pass, so joints merge cleanly. */
function Tubes({ d, width = 7.5, core = 3.4 }: { d: string; width?: number; core?: number }) {
  return (
    <>
      <path d={d} strokeWidth={width} />
      <path d={d} stroke={paper} strokeWidth={core} />
    </>
  );
}

function Wheel({ at, hook }: { at: Point; hook: string }) {
  const spokes = Array.from({ length: 18 }, (_, index) => {
    const a = index * 20;
    const [x1, y1] = polar([0, 0], 8, a + (index % 2 ? 38 : -38));
    const [x2, y2] = polar([0, 0], WHEEL - 13, a);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }).join("");
  return (
    <g transform={place(at)}>
      <circle r={WHEEL - 4} strokeWidth="9" />
      <circle r={WHEEL - 4} stroke={paper} strokeWidth="1" opacity=".35" strokeDasharray="3 9" />
      <circle r={WHEEL - 12} strokeWidth="1.6" />
      <circle r={WHEEL - 15} strokeWidth=".7" opacity=".4" />
      <g data-bike={hook}>
        <path d={spokes} strokeWidth=".85" opacity=".5" />
        {/* a spoke reflector and the valve make the turning readable */}
        <rect x="36" y="-5" width="24" height="10" rx="2.5" fill={paper} strokeWidth="1.4" />
        <path d="M40-1h16" strokeWidth=".8" opacity=".5" />
        <path d={`M0 ${-(WHEEL - 13)}v-5`} strokeWidth="2.6" />
      </g>
      <circle r="9" fill={paper} strokeWidth="1.8" />
      <circle r="3.4" fill="currentColor" stroke="none" />
    </g>
  );
}

function Bicycle() {
  return (
    <g>
      <Wheel at={REAR} hook="spin-rear" />
      <Wheel at={FRONT} hook="spin-front" />
      <Tubes d={`${arc(REAR, WHEEL + 9, 168, 306)}${arc(FRONT, WHEEL + 9, 196, 334)}`} width={6} core={2.2} />
      {/* the carrier, where I sat: a slatted rack on two stays */}
      <Tubes d="M-250-218L-168-106M-206-218L-166-104M-102-218L-84-228" width={5} core={1.8} />
      <path d="M-264-224H-98V-212H-264Z" fill={paper} strokeWidth="2" />
      <path d="M-244-224v12m20-12v12m20-12v12m20-12v12m20-12v12m20-12v12m20-12v12" strokeWidth="1" opacity=".55" />
      <rect x="-272" y="-216" width="9" height="15" rx="2" fill="currentColor" stroke="none" />
      <Tubes d="M-32-80L-162-100L-82-224M-32-80L-86-236M-84-226L134-242M-32-80L140-206M144-196Q154-146 162-100M136-250L132-292M132-292C118-302 96-304 78-300M-86-236L-88-241" />
      <path d="M134-254L144-194" strokeWidth="12" />
      <path d="M135-246L142-202" stroke={paper} strokeWidth="1.3" opacity=".7" />
      <path d="M88-302L62-298" strokeWidth="12" />
      <path d="M84-302l-3 4m-5-4-3 4m-5-3-2 4" stroke={paper} strokeWidth="1.1" opacity=".6" />
      <circle cx="112" cy="-306" r="7.5" fill={paper} strokeWidth="1.6" />
      <path d="M108-309q4-3 8 0" strokeWidth="1" opacity=".6" />
      <circle cx="155" cy="-232" r="11" fill={paper} strokeWidth="1.8" />
      <path d="M158-238a7 7 0 0 1 3 9M151-236v8" strokeWidth="1.2" opacity=".6" />
      {/* the full chain guard every roadster had */}
      <path d="M-14-112C16-112 18-50-16-50L-160-86C-174-90-174-110-160-112Z" fill={paper} strokeWidth="2.2" />
      <path d="M-150-106L-18-106C2-106 6-90 2-80M-152-93h120" strokeWidth=".9" opacity=".45" />
      <circle cx="-32" cy="-80" r="6" fill="currentColor" stroke="none" />
      {/* saddle on its two coil springs, set all the way down for him */}
      <g transform="translate(0 10)">
        <path d="M-116-251l-4 3 8 2.5-8 2.5 6 3M-84-251l-4 3 8 2.5-8 2.5 6 3" strokeWidth="1.6" />
        <path d="M-134-258C-124-271-72-269-58-259C-62-250-86-248-106-250C-118-251-130-251-134-258Z" fill="currentColor" stroke="none" />
        <path d="M-124-262C-108-267-84-267-70-262" stroke={paper} strokeWidth="1.1" opacity=".5" />
      </g>
    </g>
  );
}

/**
 * Limb segments drawn in two passes, every outline first and every fill
 * over them, so knees and elbows read as one continuous shape.
 */
function Limb({ parts, solid = false }: { parts: { d: string; hook?: string }[]; solid?: boolean }) {
  return (
    <g>
      {parts.map(({ d, hook }, index) => (
        <path key={`line${index}`} data-bike={hook} d={d} stroke={solid ? paper : "currentColor"} strokeWidth={solid ? 3.4 : 3.8} />
      ))}
      {parts.map(({ d, hook }, index) => (
        <path key={`fill${index}`} data-bike={hook} d={d} fill={solid ? "currentColor" : paper} stroke="none" />
      ))}
    </g>
  );
}

function Crank({ side, degrees }: { side: "near" | "far"; degrees: number }) {
  const at = pedal(degrees);
  return (
    <g opacity={side === "far" ? 0.55 : 1}>
      <path data-bike={`crank-${side}`} d={capsule(CRANK, at, 10, 8)} fill={paper} strokeWidth="1.8" />
      <rect data-bike={`pedal-${side}`} x="-13" y="-4.5" width="26" height="9" rx="2" transform={place(at)} fill="currentColor" stroke={paper} strokeWidth="1.2" />
    </g>
  );
}

function Slipper({ far = false }: { far?: boolean }) {
  return (
    <g>
      <path d="M-9-7C2-10 20-7 31 2L32 9L-11 9Z" fill={far ? "currentColor" : paper} strokeWidth="1.8" />
      <path d="M-13 9H36Q38 15 33 15H-12Z" fill={paper} strokeWidth="1.6" />
      <path d="M3 4L16-3" strokeWidth={far ? 2 : 3.6} stroke={far ? paper : "currentColor"} />
    </g>
  );
}

/** One of his legs in school track pants, with the two side stripes. */
function Leg({ side, degrees }: { side: "near" | "far"; degrees: number }) {
  const pose = leg(degrees);
  return (
    <g opacity={side === "far" ? 0.55 : 1}>
      <Limb solid parts={[{ d: pose.shin, hook: `shin-${side}` }, { d: pose.thigh, hook: `thigh-${side}` }]} />
      <path data-bike={`stripe-${side}`} d={stripe(pose.knee, pose.ankle)} stroke={paper} strokeWidth="1.3" />
      <g data-bike={`foot-${side}`} transform={place(pose.ankle)}>
        <Slipper far={side === "far"} />
      </g>
    </g>
  );
}

function Arm({ shoulder, hand, upper, fore, width, sleeve = "solid", bend = 1 }: {
  shoulder: Point; hand: Point; upper: number; fore: number; width: number; sleeve?: "solid" | "paper"; bend?: 1 | -1;
}) {
  const elbow = joint(shoulder, hand, upper, fore, bend);
  const cuff: Point = [shoulder[0] + (elbow[0] - shoulder[0]) * 0.5, shoulder[1] + (elbow[1] - shoulder[1]) * 0.5];
  return (
    <g>
      <Limb parts={[{ d: capsule(elbow, hand, width * 0.8, width * 0.68) }, { d: capsule(shoulder, elbow, width * 0.96, width * 0.82) }, { d: `M${hand[0] + width * 0.6} ${hand[1]}a${width * 0.6} ${width * 0.6} 0 1 1 0-.1Z` }]} />
      <path d={capsule(shoulder, cuff, width * (sleeve === "solid" ? 1.42 : 1.2), width * (sleeve === "solid" ? 1.28 : 1.1))} fill={sleeve === "solid" ? "currentColor" : paper} stroke={sleeve === "solid" ? paper : "currentColor"} strokeWidth="1.6" />
      <path d={`M${hand[0] - width * 0.2} ${hand[1] - width * 0.45}q${width * 0.4} ${width * 0.3} ${width * 0.1} ${width * 0.8}`} strokeWidth="1" opacity=".55" />
    </g>
  );
}

/** His shirt: solid ink, edged in paper so it stays clear of me behind him. */
function BrotherTorso({ pace }: { pace: Pace }) {
  return (
    <g transform={place(HIP, LEAN[pace], TORSO)}>
      <path d={capsule([3, -146], [8, -176], 22, 20)} fill={paper} strokeWidth="1.9" />
      {pace === "rush" && <path d="M-32 2C-44 4-56 0-64-6C-52-10-44-16-38-26Z" fill="currentColor" stroke={paper} strokeWidth="1.6" />}
      <path d="M-31 8C-40-40-38-112-28-143C-14-161 18-161 31-145C37-112 33-40 29 8C10 14-14 14-31 8Z" fill="currentColor" stroke={paper} strokeWidth="2.4" />
      <path d="M-4-150q8 6 16 0" stroke={paper} strokeWidth="1.6" />
      <path d="M-22-40q6 10 2 22M12-74q-4 10 0 20M-18-100q4 8 2 16" stroke={paper} strokeWidth="1.1" opacity=".55" />
      <path d="M-31 8C-14 13 10 13 29 8" stroke={paper} strokeWidth="1" opacity=".5" />
    </g>
  );
}

const KID_HIP: Record<Pace, Point> = { rush: [-204, -228], ride: [-216, -228], reflection: [-204, -228] };
const KID_LEAN: Record<Pace, number> = { rush: 16, ride: 20, reflection: 24 };
const kidAt = (pace: Pace, local: Point): Point => {
  const [x, y] = turn(local, KID_LEAN[pace]);
  return [KID_HIP[pace][0] + x, KID_HIP[pace][1] + y];
};

/** My T-shirt: paper, with the one bold stripe across it, so we never merge. */
function KidTorso({ pace }: { pace: Pace }) {
  return (
    <g transform={place(KID_HIP[pace], KID_LEAN[pace])}>
      <path d={capsule([2, -108], [5, -128], 18, 17)} fill={paper} strokeWidth="1.8" />
      <path d="M-27 6C-34-32-32-84-23-110C-12-124 14-124 25-111C31-84 28-34 23 6C6 11-12 11-27 6Z" fill={paper} strokeWidth="2.2" />
      <path d="M-31-64C-14-60 12-60 29-66L29-54C12-48-14-48-31-52Z" fill="currentColor" stroke="none" />
      <path d="M-24-96q-4 20-2 30M12-30q4 12 2 24" strokeWidth="1" opacity=".45" />
      <path d="M-4-117q7 5 14 0" strokeWidth="1.6" />
      <path d="M-30-4C-10 2 12 2 26-4L28 14C10 20-12 20-31 14Z" fill="currentColor" stroke={paper} strokeWidth="1.4" />
    </g>
  );
}

/** The five ice tubes, the same sleeves as on the cover, standing up out of my fist. */
function HeldTubes({ fist }: { fist: Point }) {
  // melt runs down through my fingers
  const tip: Point = [fist[0] + 2, fist[1] + 9];
  return (
    <g className="memory-bicycle__ice">
      {HELD_ANGLES.map((angle) => {
        const sleeve = heldSleeve(fist, angle);
        return <Pouch key={angle} {...sleeve} simple />;
      })}
      {/* one drop of melt, about to fall */}
      <path className="memory-bicycle__drip" d={`M${tip[0].toFixed(1)} ${tip[1].toFixed(1)}q-3 6 0 8q3-2 0-8`} fill="currentColor" strokeWidth=".8" opacity=".5" />
    </g>
  );
}

/** Where the bicycle sits in the 1200×440 art, and my fist for a pace, in the bicycle's own units. */
export const BIKE_AT = { x: 580, y: 410, scale: 0.8 } as const;
/** 1 when the bicycle faces right (setting off), -1 on the way home. */
export const facingFor = (pace: Pace) => (pace === "rush" ? 1 : -1);
export function fistFor(pace: Pace): Point {
  const hip = KID_HIP[pace];
  const knee: Point = [hip[0] + 64, hip[1] + 16];
  return pace === "rush" ? fromHip("rush", [-34, -60]) : [knee[0] - 16, knee[1] - 8];
}

/** `held` false leaves my hand empty, for a scene that draws the ice tubes itself. */
export function MemoryBicycle({ pace = "rush", held = true }: { pace?: Pace; held?: boolean }) {
  const shoulder = fromHip(pace, [8, -134]);
  const grip: Point = pace === "rush" ? [76, -300] : [68, -301];
  const head = fromHip(pace, [8, -202]);
  const kidHip = KID_HIP[pace];
  const knee: Point = [kidHip[0] + 64, kidHip[1] + 16];
  const ankle: Point = pace === "rush" ? [knee[0] - 16, knee[1] + 66] : [knee[0] - 6, knee[1] + 70];
  const kidShoulder = kidAt(pace, [5, -100]);
  const kidHand = fistFor(pace);
  const kidHead = kidAt(pace, [4, -152]);
  const kidMood: Mood = pace === "rush" ? "excited" : pace === "ride" ? "down" : "soft";
  const kidTilt = pace === "rush" ? -18 : pace === "ride" ? 22 : 12;
  // Both rides home, the real one and the remembered one, face the way we came.
  const facing = pace === "rush" ? 0.8 : -0.8;
  return (
    <>
      <g className={`memory-bicycle memory-bicycle--${pace}`}>
        <g data-bike-pace={pace} transform={`translate(580 410) scale(${facing} .8)`}>
          <ellipse cx="0" cy="4" rx="300" ry="10" fill="currentColor" stroke="none" opacity=".05" />
          {/* far side, behind the frame */}
          <g opacity=".55">
            <Arm shoulder={[shoulder[0] - 8, shoulder[1] + 4]} hand={[grip[0] - 8, grip[1] - 2]} upper={76} fore={75} width={20} />
          </g>
          <Crank side="far" degrees={180} />
          <Leg side="far" degrees={180} />
          <Bicycle />
          <KidTorso pace={pace} />
          {pace !== "reflection" && (
            <g transform={place(kidHead, kidTilt, 1.06)}>
              <Head role="narrator" mood={kidMood} />
            </g>
          )}
          {pace === "rush" && (
            <path d={`M${kidHead[0] - 44} ${kidHead[1] - 22}h-30M${kidHead[0] - 48} ${kidHead[1] - 6}h-20M${kidHead[0] - 42} ${kidHead[1] + 10}h-14`} strokeWidth="2" opacity=".5" />
          )}
          <g>
            <Limb parts={[{ d: capsule(knee, ankle, 21, 17) }, { d: capsule(kidHip, knee, 33, 26) }]} />
            <path d={capsule(kidHip, [kidHip[0] + 40, kidHip[1] + 10], 40, 34)} fill="currentColor" stroke={paper} strokeWidth="1.4" />
            <g transform={place(ankle, pace === "rush" ? 48 : 62, 0.86)}>
              <Slipper />
            </g>
          </g>
          <BrotherTorso pace={pace} />
          {pace === "reflection" && (
            // remembered, my head rests against his back
            <g transform={place([kidHead[0] + 6, kidHead[1] + 4], kidTilt, 1.06)}>
              <Head role="narrator" mood={kidMood} />
            </g>
          )}
          <g data-bike="look-ahead" transform={place(head, LEAN[pace] * 0.35, 1.04)}>
            <Head role="brother" mood={pace === "rush" ? "focus" : "calm"} />
          </g>
          {pace === "ride" && (
            <g data-bike="look-back" opacity="0" transform={`${place([head[0] - 4, head[1] + 2])} scale(-1.04 1.04)`}>
              <Head role="brother" mood="worried" />
            </g>
          )}
          <Crank side="near" degrees={0} />
          <Leg side="near" degrees={0} />
          <Arm shoulder={shoulder} hand={grip} upper={76} fore={75} width={21} />
          <Arm shoulder={kidShoulder} hand={kidHand} upper={58} fore={54} width={18} sleeve="paper" />
          {pace !== "rush" && held && <HeldTubes fist={kidHand} />}
          {pace !== "rush" && <circle className="memory-bicycle__fist" cx={kidHand[0]} cy={kidHand[1]} r={10} fill={paper} strokeWidth="1.9" />}
        </g>

      </g>
      <g className="memory-bicycle__road" opacity=".13" strokeWidth=".8">
        <path d="M314 414h85m14 0h93m15 0h189m20 0h76m-448 9h44m351 0h41" />
        {pace === "rush" && <path d="M299 306h27m-40 23h24m-15 25h30M260 200h40m-28 22h22" />}
      </g>
    </>
  );
}
