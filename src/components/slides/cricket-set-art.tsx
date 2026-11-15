import "./cricket-set-art.css";
import type { ReactNode } from "react";
import { paper, type Point } from "./memory-figures";
import { Person, handsOf, type PersonProps } from "./memory-people";
import { Ball, Bail, Base, Bat, GoldenGift, Scrap, STILL, StillLife, Stump, Wicket, batIn } from "./cricket-set-props";

const mono = { fontFamily: "var(--font-geist-mono), monospace" } as const;

/** The floor line, faint, under a scene. */
const Floor = ({ y, from = 380, to = 820 }: { y: number; from?: number; to?: number }) => (
  <path d={`M${from} ${y}h${(to - from) * 0.36}m${(to - from) * 0.04} 0h${(to - from) * 0.6}M${from + 40} ${y + 8}h${(to - from) * 0.16}m${(to - from) * 0.42} 0h${(to - from) * 0.14}`} opacity=".13" strokeWidth=".8" />
);

/** Me in third standard, small beside him. */
const KID = 0.82;
const ANNA = 0.86;

/** A thought above someone's head, the same cloud the other memories think in, holding `children`. */
function Thought({ x, y, from, children }: { x: number; y: number; from: Point; children?: ReactNode }) {
  const dots = [0.18, 0.42, 0.66].map((t, i) => [from[0] + (x - from[0]) * t * 0.62, from[1] + (y - from[1]) * t * 0.7, 1.4 + i * 0.6] as const);
  return (
    <g className="cricket-art__thought">
      {dots.map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} fill={paper} strokeWidth="1.1" />)}
      <path transform={`translate(${x} ${y}) scale(.62) translate(-636 -166)`} d="M600 182q-14 0-14-12t14-12q2-14 18-13 8-10 22-4 14-3 18 9 13 2 12 14 0 12-14 13-4 10-18 8-10 6-22 1-14 4-16-4Z" fill={paper} strokeWidth="2" />
      {children}
    </g>
  );
}

/** Our gate, from the lane: its two pillars, the leaves swung open, the compound wall running off to the left. Standing on the origin. */
function Gate({ x, y }: { x: number; y: number }) {
  const bars = (from: number, to: number, top: number) => Array.from({ length: 4 }, (_, i) => `M${from + ((to - from) * (i + 1)) / 5} ${top + 4}V-6`).join("");
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-190 0v-62h144v62M-194-62h152v-8h-152Z" fill={paper} strokeWidth="1.3" />
      <path d="M-180-40h48m24 0h48m-120 20h48m24 0h48" opacity=".2" />
      {[-46, 26].map((px) => <path key={px} d={`M${px} 0v-108h20V0M${px - 4}-108h28v-9h-28Z`} fill={paper} strokeWidth="1.4" />)}
      {/* the two leaves, swung in */}
      <path d="M-26-6v-82l16-8v82Z" fill={paper} strokeWidth="1.2" />
      <path d={bars(-26, -10, -92)} strokeWidth=".9" opacity=".7" />
      <path d="M26-6v-82l-16-8v82Z" fill={paper} strokeWidth="1.2" />
      <path d="M22-8v-80m-4 78v-80m-4 78v-80" strokeWidth=".9" opacity=".7" />
    </g>
  );
}

/** Our house at the end of the lane: its front wall, the open door, a grilled window under its sunshade, the tank on the terrace. Standing on the origin. */
function House({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0v-150h220V0M-8-150h236v-10H-8Z" fill={paper} strokeWidth="1.4" />
      <path d="M150-160v-28q0-7 17-7t17 7v28m-34-10h34m-34-10h34" opacity=".6" />
      <path d="M30 0v-104h46V0" fill="currentColor" fillOpacity=".55" strokeWidth="1.3" />
      <path d="M30-104l12 6V0" fill={paper} strokeWidth="1" />
      <path d="M22 0h62v4H22Z" fill={paper} strokeWidth="1" />
      <path d="M118-112h70v62h-70Zm14 0v62m14-62v62m14-62v62m14-62v62M108-120h90" strokeWidth="1.1" opacity=".7" />
    </g>
  );
}

/** The lane between them: a few paving joints. */
const Lane = ({ from, to }: { from: number; to: number }) => (
  <path d={Array.from({ length: Math.floor((to - from) / 60) }, (_, i) => `M${from + 30 + i * 60} 404l6-4`).join("")} strokeWidth=".8" opacity=".25" />
);

/** Speed lines behind someone running. */
const Rush = ({ x, y, facing = 1 }: { x: number; y: number; facing?: 1 | -1 }) => (
  <path d={`M${x} ${y}h${-20 * facing}m${6 * facing} 12h${-24 * facing}m${4 * facing} 12h${-16 * facing}`} strokeWidth="1.1" opacity=".45" />
);

/**
 * Him and me at home: who he was to me. He stands, sharp and smiling; I look
 * up at him. When he came, I ran to him, and Amma, at the door, smiled too.
 */
function AtHome({ beat }: { beat: "anna" | "kind" }) {
  const kind = beat === "kind";
  return <>
    {kind && <g opacity=".35"><Person who="amma" x={440} y={400} mood="smile" near="hang" /></g>}
    <Person who="relative" facing={-1} x={kind ? 672 : 652} y={400} scale={ANNA} mood={kind ? "excited" : "smile"} lean={kind ? 14 : 0} near={kind ? [40, -6] : "hang"} far={kind ? [36, -2] : "hang"} />
    <Person who="me" x={kind ? 586 : 548} y={400} scale={KID} mood={kind ? "excited" : "awe"} tilt={kind ? -10 : -18} lean={kind ? 10 : 0} near={kind ? [44, -42] : "hang"} far={kind ? [40, -38] : "hang"} />
    {kind && <Rush x={556} y={316} />}
    <Floor y={402} from={400} to={760} />
  </>;
}

/** At the gate, two days before my birthday: him just in, the golden present in his hand; me running down the lane to him. */
const ANNA_AT_GATE: PersonProps = { who: "relative", x: 488, y: 400, scale: ANNA, mood: "smile", near: [18, 6], far: "hang" };
function AtTheGate() {
  const hand = handsOf(ANNA_AT_GATE).near;
  return <>
    <Lane from={440} to={900} />
    <House x={700} y={400} />
    <Gate x={430} y={400} />
    <Person {...ANNA_AT_GATE} part="body" />
    <GoldenGift x={hand[0] + 4} y={hand[1] + 44} scale={.9} />
    <Person {...ANNA_AT_GATE} part="arm" />
    <Person who="me" facing={-1} x={668} y={400} scale={KID} mood="excited" lean={12} near={[26, -36]} far={[-18, -26]} />
    <Rush x={696} y={330} facing={-1} />
    <Floor y={404} from={300} to={1080} />
  </>;
}

/** The present, held out to me in both his hands: tall, rectangular, golden; me reaching up for it. */
const ANNA_GIVING: PersonProps = { who: "relative", x: 590, y: 400, scale: ANNA, mood: "smile", lean: 6, near: [46, -18], far: [56, -30] };
function Golden() {
  const { near: hand, far } = handsOf(ANNA_GIVING);
  // the far side of the box, where his other hand's fingers curl round it
  const edge = hand[0] + 6 + 22 * 0.9;
  return <>
    <Lane from={440} to={860} />
    <Person {...ANNA_GIVING} part="body" />
    <g className="cricket-art__gift"><GoldenGift x={hand[0] + 6} y={hand[1] + 46} scale={.9} glints /></g>
    <path d={`M${edge - 1} ${far[1] - 4}a4 4 0 0 1 0 8`} fill={paper} strokeWidth="1.3" />
    <Person {...ANNA_GIVING} part="arm" />
    <Person who="me" facing={-1} x={700} y={400} scale={KID} mood="awe" tilt={-20} near={[34, -36]} far={[30, -32]} />
    <Floor y={404} from={460} to={820} />
  </>;
}

/** Home, the present on the floor before me, a question over my head; him beside me: let's open it and see. */
function Wonder() {
  return <>
    <GoldenGift x={628} y={400} scale={.9} glints />
    <Person who="me" x={588} y={400} scale={KID} mood="awe" tilt={-4} lean={10} near={[30, -22]} far={[26, -20]} />
    <Thought x={560} y={238} from={[598, 282]}>
      <text x="560" y="246" textAnchor="middle" fontSize="22" fontWeight="600" fill="currentColor" stroke="none">?</text>
    </Thought>
    <Person who="relative" facing={-1} x={720} y={400} scale={ANNA} mood="talk" near={[30, -60]} far="hang" />
    <Floor y={402} from={480} to={800} />
  </>;
}

/** Opening it on the floor, the golden paper coming off in pieces, him watching, smiling. */
function Unwrap() {
  return <>
    <Person who="relative" facing={-1} x={724} y={400} scale={ANNA} mood="smile" near="hang" far="hang" />
    <Person who="me" pose="sit" x={576} y={400} scale={KID} mood="excited" lean={18} near={[64, -50]} far={[58, -40]} part="body" />
    <GoldenGift x={640} y={400} scale={.9} torn={.6} />
    <Person who="me" pose="sit" x={576} y={400} scale={KID} mood="excited" lean={18} near={[64, -50]} far={[58, -40]} part="arm" />
    <g className="cricket-art__scraps">
      <Scrap x={612} y={302} angle={-24} />
      <Scrap x={672} y={290} angle={18} wide={.8} />
      <Scrap x={690} y={330} angle={40} wide={.9} />
      <Scrap x={600} y={398} angle={6} wide={1.2} />
    </g>
    <Floor y={402} from={480} to={800} />
  </>;
}

/** What came out of it, piece by piece, and the colours I still remember: the red bat, the blue ball, the yellow stumps, bails and base. */
function TheSet() {
  const label = (x: number, y: number, words: string, to: Point) => (
    <g className="cricket-art__label">
      <path d={`M${x} ${y + 3}L${to[0]} ${to[1]}`} strokeWidth=".6" opacity=".5" />
      <text x={x} y={y} textAnchor="middle" fontSize="7" letterSpacing="1.2" fill="currentColor" stroke="none" style={mono}>{words}</text>
    </g>
  );
  return <>
    <Person who="me" pose="sit" x={540} y={400} scale={KID} mood="awe" tilt={-8} near="knee" far="knee" />
    <Scrap x={588} y={402} angle={-6} wide={1.2} />
    <Scrap x={724} y={403} angle={10} />
    <g className="cricket-art__piece cricket-art__piece--bat"><Bat x={624} y={384} /></g>
    <g className="cricket-art__piece cricket-art__piece--ball"><Ball x={652} y={352} /></g>
    <g className="cricket-art__piece cricket-art__piece--stumps">
      {[-8, 0, 8].map((dx) => <Stump key={dx} x={694 + dx} y={384} />)}
      <Bail x={690} y={318} /><Bail x={698} y={318} />
    </g>
    <g className="cricket-art__piece cricket-art__piece--base"><Base x={694} y={399} /></g>
    {label(612, 300, "RED", [622, 316])}
    {label(652, 330, "BLUE", [652, 346])}
    {label(722, 300, "YELLOW", [702, 316])}
    <Floor y={404} from={460} to={800} />
  </>;
}

/** Setting it up in the lane: him bent over the base with the last stump; me ready with the bat. */
const ANNA_SETTING: PersonProps = { who: "relative", facing: -1, x: 636, y: 400, scale: ANNA, mood: "smile", lean: 30, near: [40, 30], far: [34, 26] };
const ME_READY: PersonProps = { who: "me", x: 520, y: 400, scale: KID, mood: "excited", near: [16, -10], far: "hang" };
function Setup() {
  const stump = handsOf(ANNA_SETTING).near;
  const grip = handsOf(ME_READY).near;
  return <>
    <Lane from={440} to={820} />
    <Wicket x={596} y={400} stumps={2} bails={false} />
    <Person {...ANNA_SETTING} part="body" />
    <Stump x={stump[0]} y={stump[1] + 50} />
    <Person {...ANNA_SETTING} part="arm" />
    <Person {...ME_READY} part="body" />
    <Bat {...batIn(grip, -8)} />
    <Person {...ME_READY} part="arm" />
    <Floor y={404} from={440} to={800} />
  </>;
}

/**
 * The two of us playing in the lane: the wicket behind me, me at the crease
 * with the bat, him bowling to me underarm. Remembered, the same moment
 * holds; at the very end we go, and the set stays.
 */
const ME_BATTING = (swing: boolean, older = false): PersonProps => ({
  who: "me", x: 562, y: 400, scale: older ? 1 : KID, mood: older ? "focus" : "excited", lean: 10, tilt: 4,
  near: swing ? [-4, -46] : [16, -6], far: swing ? [-8, -42] : [12, -4], ...(older ? { wear: { top: "solid" } } : {}),
});
const ANNA_BOWLING: PersonProps = { who: "relative", facing: -1, x: 816, y: 400, scale: ANNA, mood: "smile", lean: 8, near: [44, 4], far: "hang" };
function Play({ beat, finale = false }: { beat: "played" | "batting" | "remembered"; finale?: boolean }) {
  const swing = beat === "batting";
  const me = ME_BATTING(swing);
  const grip = handsOf(me).near;
  const release = handsOf(ANNA_BOWLING).near;
  const ball: Point = swing ? [612, 366] : [700, 360];
  // the ball's way to me: out of his hand, and close up, its bounce on the lane and up to the bat
  const way = swing
    ? `M${release[0]} ${release[1]}Q${(release[0] + 660) / 2} ${release[1] + 6} 660 398Q${(660 + ball[0]) / 2 + 6} ${ball[1] - 4} ${ball[0] + 4} ${ball[1]}`
    : `M${release[0]} ${release[1]}Q${(release[0] + ball[0]) / 2} ${release[1] - 12} ${ball[0] + 4} ${ball[1]}`;
  return <>
    <Lane from={440} to={900} />
    <Wicket {...STILL.wicket} />
    <g className="cricket-art__people">
      <Person {...me} part="body" />
      <Bat {...batIn(grip, swing ? 148 : -14)} />
      <Person {...me} part="arm" />
      <Person {...ANNA_BOWLING} />
      <path d={way} strokeWidth=".8" strokeDasharray="2 4" opacity=".4" />
      <Ball x={ball[0]} y={ball[1]} />
    </g>
    {finale && (
      <>
        {STILL.scraps.map((scrap, i) => <g key={scrap.x} className={`cricket-art__arrive cricket-art__arrive--${i}`}><Scrap {...scrap} /></g>)}
        <g className="cricket-art__arrive cricket-art__arrive--ball"><Ball {...STILL.ball} /></g>
        <g className="cricket-art__arrive cricket-art__arrive--bat"><Bat {...STILL.bat} /></g>
      </>
    )}
    <Floor y={404} from={420} to={900} />
  </>;
}

/** He goes out of the gate the same day, turning back to wave; I wave back from the lane, the bat in my other hand. */
const ANNA_LEAVING: PersonProps = { who: "relative", x: 372, y: 400, scale: ANNA, mood: "smile", near: [34, -128], far: "hang" };
function Leaving() {
  const me: PersonProps = { who: "me", facing: -1, x: 590, y: 400, scale: KID, mood: "smile", near: [30, -66], far: [8, -4] };
  const grip = handsOf(me).far;
  const [wx, wy] = handsOf(ANNA_LEAVING).near;
  return <>
    <Lane from={440} to={900} />
    <Gate x={430} y={400} />
    <House x={700} y={400} />
    <Person {...ANNA_LEAVING} />
    <path className="cricket-art__wave" style={{ transformOrigin: `${wx}px ${wy + 8}px` }} d={`M${wx - 10} ${wy - 2}q-6-6-2-12m24 2q4-6 0-12`} strokeWidth="1.2" opacity=".6" />
    <Bat {...batIn(grip, 6)} />
    <Person {...me} />
    <Floor y={404} from={300} to={1080} />
  </>;
}

/** Years later, the same set in the same lane: me older, batting; my cousins bowling and keeping wicket. */
function Years() {
  const me = ME_BATTING(false, true);
  const grip = handsOf(me).near;
  return <>
    <Lane from={440} to={900} />
    <Person who="cousin-swept" x={482} y={400} scale={.84} mood="focus" lean={14} near={[30, -8]} far={[26, -6]} />
    <Wicket {...STILL.wicket} />
    <Person {...me} part="body" />
    <Bat {...batIn(grip, -14)} />
    <Person {...me} part="arm" />
    <Person who="cousin" facing={-1} x={806} y={400} scale={.86} mood="excited" lean={8} near={[44, 4]} far="hang" />
    <Ball x={706} y={362} />
    <Floor y={404} from={420} to={900} />
  </>;
}

export function CricketSetArt({ scene, className = "", viewBox = "0 0 1200 440" }: { scene: string; className?: string; viewBox?: string }) {
  let art;
  if (scene === "cover") art = <StillLife className="cricket-art__still" />;
  else if (scene === "anna" || scene === "kind") art = <AtHome beat={scene} />;
  else if (scene === "gate") art = <AtTheGate />;
  else if (scene === "golden") art = <Golden />;
  else if (scene === "wonder") art = <Wonder />;
  else if (scene === "unwrap") art = <Unwrap />;
  else if (scene === "set") art = <TheSet />;
  else if (scene === "setup") art = <Setup />;
  else if (scene === "played" || scene === "batting") art = <Play beat={scene} />;
  else if (["level", "heart", "matters", "finale"].includes(scene)) art = <Play beat="remembered" finale={scene === "finale"} />;
  else if (scene === "leaving") art = <Leaving />;
  else if (scene === "years") art = <Years />;
  else return null;
  return <svg className={`memory-art cricket-art cricket-art--${scene} ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{art}</svg>;
}
