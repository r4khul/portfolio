import { paper, place, polar, type Point } from "./memory-figures";
import { Person, handsOf, type PersonProps } from "./memory-people";
import { Cup } from "./first-movie-props";

/**
 * Anna's Bajaj Avenger, side on: a black cruiser with a teardrop tank, a low
 * stepped seat, a tall pulled-back handlebar and a round headlamp. Units are
 * the scene's own, so its riders keep their size: the ground is at y = 0,
 * midway between the axles, facing right.
 *
 * Anna rides; I sit in front of him on the tank, between his arms; Akka sits
 * behind him. Going, it faces right; coming home, left, with the cup of Coke
 * from my Happy Meal in my hand.
 */
const REAR: Point = [-98, -40];
const FRONT: Point = [98, -42];

function Wheel({ at, radius, tyre }: { at: Point; radius: number; tyre: number }) {
  const rim = radius - tyre - 2;
  const spokes = [0, 72, 144, 216, 288].map((a) => {
    const [x1, y1] = polar([0, 0], 8, a - 14);
    const [x2, y2] = polar([0, 0], rim - 1, a - 4);
    const [x3, y3] = polar([0, 0], rim - 1, a + 4);
    const [x4, y4] = polar([0, 0], 8, a + 14);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}M${x3.toFixed(1)} ${y3.toFixed(1)}L${x4.toFixed(1)} ${y4.toFixed(1)}`;
  }).join("");
  return (
    <g transform={place(at)}>
      <circle r={radius - tyre / 2} strokeWidth={tyre} />
      <circle r={radius - tyre / 2} stroke={paper} strokeWidth=".8" opacity=".35" strokeDasharray="2 7" />
      <circle r={rim} fill={paper} strokeWidth="1.6" />
      <g className="movie-avenger__spin">
        <path d={spokes} strokeWidth="1.2" />
      </g>
      <circle r="8" fill={paper} strokeWidth="1.6" />
      <circle r="2.6" fill="currentColor" stroke="none" />
    </g>
  );
}

/** Chrome tubes: an ink pass, then a paper pass. */
function Tube({ d, width = 6, core = 2.6 }: { d: string; width?: number; core?: number }) {
  return (
    <>
      <path d={d} strokeWidth={width} />
      <path d={d} stroke={paper} strokeWidth={core} />
    </>
  );
}

/** `flip` when the bike is drawn mirrored, so its badge still reads the right way round. */
export function Avenger({ flip = false }: { flip?: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="150" ry="6" fill="currentColor" stroke="none" opacity=".06" />
      {/* the long exhaust, sweeping under the engine to the back */}
      <Tube d="M30-74C46-66 44-34 14-30H-56L-118-44" width={8} core={4} />
      <path d="M-104-50-150-56-152-44-106-36Z" fill={paper} strokeWidth="1.4" />
      <path d="M-147-55v10" strokeWidth="1" opacity=".6" />
      <Wheel at={REAR} radius={40} tyre={9} />
      <Wheel at={FRONT} radius={42} tyre={7} />
      <circle cx={FRONT[0]} cy={FRONT[1]} r="15" strokeWidth="1" opacity=".45" />
      {/* fenders */}
      <path d="M-148-46A48 48 0 0 1-70-84" strokeWidth="5" />
      <path d="M58-58A44 44 0 0 1 130-68" strokeWidth="4" />
      {/* swingarm and the twin shocks */}
      <Tube d="M-98-40L-18-56" width={7} core={2.4} />
      <path d="M-90-46-70-98M-84-46-64-96" strokeWidth="1.2" />
      <path d="M-86-58l7 2m-10 7 7 2m-4-19 7 2m-3-11 7 2" strokeWidth="1" opacity=".7" />
      {/* the engine: a crankcase, a finned cylinder leaning forward, a round side cover */}
      <path d="M-24-36C-30-50-26-66-10-68H40C48-60 46-42 38-34Z" fill={paper} strokeWidth="1.6" />
      <path d="M0-68 10-104H42L40-68Z" fill={paper} strokeWidth="1.5" />
      <path d="M3-76h37M5-84h35M8-92h33M10-100h32" strokeWidth="1.2" opacity=".6" />
      <circle cx="-4" cy="-52" r="12" fill={paper} strokeWidth="1.3" /><circle cx="-4" cy="-52" r="6" strokeWidth=".8" opacity=".5" />
      <path d="M22-56h12m-12 6h12" strokeWidth=".9" opacity=".5" />
      {/* frame down to the steering head */}
      <Tube d="M-18-56-14-96M40-70 70-118" width={6} core={2.4} />
      {/* forks */}
      <Tube d="M98-42 72-122M92-44 66-120" width={5} core={2} />
      {/* side panel under the pillion seat, with its badge */}
      <path d="M-104-100H-52L-56-76H-100Z" fill={paper} strokeWidth="1.3" />
      <text x="-78" y="-85" transform={flip ? "translate(-156 0) scale(-1 1)" : undefined} textAnchor="middle" fontSize="6.5" letterSpacing="1.1" fill="currentColor" stroke="none" style={{ fontFamily: "var(--font-geist-mono), monospace" }}>AVENGER</text>
      {/* the teardrop tank */}
      <path d="M-6-100C8-124 52-130 80-116L82-106C66-98 26-96-6-96Z" fill="currentColor" stroke={paper} strokeWidth="1.4" />
      <path d="M14-112C28-120 48-122 66-117" stroke={paper} strokeWidth="1.8" opacity=".55" />
      {/* the stepped seat: low for the rider, raised for the pillion, a backrest behind */}
      <path d="M-4-96C-14-90-40-90-60-96L-64-104C-80-104-104-106-114-108L-112-116C-92-114-74-112-64-110C-48-104-24-100-6-102Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-12-97C-26-94-44-94-58-98M-70-108C-86-109-98-110-108-112" stroke={paper} strokeWidth=".8" strokeDasharray="2 2" opacity=".6" />
      <Tube d="M-112-112C-118-122-120-136-116-150" width={5} core={2} />
      <path d="M-122-158q4-10 14-4l-2 14q-8 2-12-10Z" fill={paper} strokeWidth="1.3" />
      {/* tail lamp and number plate */}
      <path d="M-128-96h12v8h-12Z" fill="currentColor" stroke="none" /><path d="M-132-86h18v12h-18Z" fill={paper} strokeWidth="1" />
      {/* the handlebar, pulled back to the rider, with a mirror */}
      <path d="M72-122 70-142Q66-150 50-146H44" strokeWidth="3.6" />
      <path d="M38-147h12" strokeWidth="6" />
      <path d="M64-146 68-170" strokeWidth="1.4" /><ellipse cx="69" cy="-176" rx="5" ry="7" fill={paper} strokeWidth="1.4" />
      {/* the round headlamp in its chrome bezel */}
      <circle cx="92" cy="-112" r="13" fill={paper} strokeWidth="2" /><circle cx="92" cy="-112" r="8.5" strokeWidth="1" opacity=".55" />
      <path d="M95-117q3 3 2 7" strokeWidth="1" opacity=".6" />
      {/* footrests */}
      <path d="M50-60h14M-24-58h12" strokeWidth="3.6" />
    </g>
  );
}

const ANNA: PersonProps = { who: "tenant", pose: "seat", x: -28, y: -96, lean: 4, mood: "smile", seated: { thigh: -6, shin: 30 }, near: [74, -39], far: [70, -44], wear: { shoes: true } };
const AKKA: PersonProps = { who: "akka", pose: "seat", x: -84, y: -108, mood: "smile", seated: { thigh: 14, shin: 6 }, near: "lap", far: [58, -62], wear: { shoes: true } };
const ME: PersonProps = { who: "me", pose: "seat", x: 12, y: -104, lean: 6, seated: { thigh: 24, shin: -8, foot: 18 }, wear: { top: "hoodie", bottom: "plain", shoes: true } };

/** The three of us on the Avenger. `home` turns us round and puts the cup in my hand. */
export function AvengerRide({ x, y, home = false, scale = 1 }: { x: number; y: number; home?: boolean; scale?: number }) {
  const me: PersonProps = home
    ? { ...ME, mood: "soft", tilt: 10, near: [26, -40], far: [42, -14] }
    : { ...ME, mood: "excited", tilt: -6, near: [42, -12], far: [44, -14] };
  const cupAt = handsOf(me).near;
  return (
    <g className={`movie-avenger movie-avenger--${home ? "home" : "going"}`}>
      <g transform={`translate(${x} ${y}) scale(${home ? -scale : scale} ${scale})`}>
        <Person {...AKKA} part="far" />
        <Person {...ANNA} part="far" />
        <Person {...me} part="far" />
        <Avenger flip={home} />
        <Person {...AKKA} part="core" />
        <Person {...AKKA} part="arm" />
        <Person {...ANNA} part="core" />
        <Person {...me} part="core" />
        {home && <Cup x={cupAt[0] + 2} y={cupAt[1] + 14} scale={0.42} />}
        <Person {...me} part="arm" />
        <Person {...ANNA} part="arm" />
      </g>
    </g>
  );
}
