import "./heart-keychain-art.css";
import { Head, paper, place } from "./memory-figures";
import { HEIGHT, Person, handsOf, type PersonProps } from "./memory-people";
import { Blackboard, Books, Bus, ClassDoor, DeskBench, ExamPad, HeartKeychain, KEYRING, Pencil, STILL, SchoolBag, StillLife, Stickers, Toffee, WallClock } from "./heart-keychain-props";

/** The floor line, faint, under a scene. */
const Floor = ({ y, from = 380, to = 820 }: { y: number; from?: number; to?: number }) => (
  <path d={`M${from} ${y}h${(to - from) * 0.36}m${(to - from) * 0.04} 0h${(to - from) * 0.6}M${from + 40} ${y + 8}h${(to - from) * 0.16}m${(to - from) * 0.42} 0h${(to - from) * 0.14}`} opacity=".13" strokeWidth=".8" />
);

/** The school uniform: sixth standard was our first year in pants. */
const UNIFORM = { top: "shirt", bottom: "trousers", shoes: true } as const;
/** How big the keychain is drawn in a hand: small, as it was. */
const IN_HAND = 0.26;

/**
 * One long desk and bench, the kind three of us shared, seen from its near
 * end as it runs back into the room: the near end's profile, the far end's,
 * and the edges of the seat and the desk top joining them.
 */
type End = { x: number; y: number; scale: number };
const BENCH_NEAR: End = { x: 548, y: 408, scale: 1 };
const BENCH_FAR: End = { x: 700, y: 350, scale: 0.9 };
const benchEdges = (near: End, far: End) =>
  ([[-34, -48], [38, -48], [-34, -40], [52, -82], [124, -90], [124, -82]] as const)
    .map(([x, y]) => `M${near.x + x * near.scale} ${near.y + y * near.scale}L${far.x + x * far.scale} ${far.y + y * far.scale}`).join("");
function SharedBenchFar() {
  return <>
    <DeskBench {...BENCH_FAR} />
    <path d={benchEdges(BENCH_NEAR, BENCH_FAR)} strokeWidth="1.3" />
  </>;
}

/**
 * The rows of benches in front of ours and behind it, in the exam: each faint,
 * with one of the others alone at it, `at` of the way along, writing.
 */
const ROW = 170;
function ExamRow({ rows, at, who }: { rows: number; at: number; who: "girl" | "cousin" | "cousin-swept" }) {
  const near = { ...BENCH_NEAR, x: BENCH_NEAR.x + rows * ROW };
  const far = { ...BENCH_FAR, x: BENCH_FAR.x + rows * ROW };
  const mix = (a: number, b: number) => a + (b - a) * at;
  const bench = mix(near.scale, far.scale);
  // sized as I am at the same place on my bench, hands and all
  const k = bench / 0.95;
  return (
    <g opacity=".17">
      <DeskBench {...far} />
      <path d={benchEdges(near, far)} strokeWidth="1.3" />
      <Person who={who} pose="seat" x={mix(near.x, far.x)} y={mix(near.y, far.y) - 48 * bench} scale={0.95 * k * HEIGHT.me / HEIGHT[who]} lean={18} tilt={14} mood="focus" near={[64 * k, -27 * k]} far={[58 * k, -30 * k]} seated={{ thigh: 2, shin: 2 }} wear={who === "girl" ? undefined : UNIFORM} />
      <DeskBench {...near} />
    </g>
  );
}

/**
 * Our classroom, side on, facing the board, the clock on the wall beside it.
 * In the last exam I sit alone on our bench, as the others do on theirs,
 * writing, the holidays already in my head; then I keep looking up at the clock. At the end of the day the
 * three of us are back on it, her at the near end on my left, me beside her,
 * and the third of us, only a shadow, at the far end, and the teacher wishes
 * us happy holidays.
 */
type ClassBeat = "exam" | "clock" | "holidays";
function Classroom({ beat }: { beat: ClassBeat }) {
  const holidays = beat === "holidays";
  const me = {
    who: "me", pose: "seat", x: 624, y: 333, scale: 0.95, seated: { thigh: 2, shin: 2 }, wear: UNIFORM,
    ...(beat === "exam" ? { lean: 20, tilt: 14, mood: "smile", near: [64, -27], far: [58, -30] } : beat === "clock" ? { lean: 8, tilt: -26, mood: "calm", near: [64, -27], far: [58, -30] } : { lean: 6, tilt: -6, mood: "smile", near: [44, -36], far: [40, -38] }),
  } as PersonProps;
  const her: PersonProps = { who: "girl", pose: "seat", x: 548, y: 360, lean: 6, tilt: -6, mood: "smile", near: [46, -34], far: [42, -36], seated: { thigh: 2, shin: 2 } };
  return <>
    <Blackboard x={880} y={196} scale={.72} words={holidays ? "Happy Holidays!" : undefined} />
    {/* a quarter to twelve in the exam, turning on as I check it; twenty to one by the holidays */}
    <WallClock x={742} y={166} hour={holidays ? 12 : 11} minute={holidays ? 40 : 45} />
    {holidays && <Person who="teacher" facing={-1} x={830} y={400} mood="talk" near={[40, -112]} />}
    {!holidays && <ExamRow rows={-1} at={0.45} who="girl" />}
    <SharedBenchFar />
    {!holidays && <ExamRow rows={1} at={0.3} who="cousin" />}
    {holidays && <g opacity=".2"><Person who="cousin-swept" pose="seat" x={690} y={310} scale={.86} lean={6} tilt={-6} near={[40, -34]} seated={{ thigh: 2, shin: 2 }} wear={UNIFORM} /></g>}
    <path d="M680 298l50-6v3l-50 6Z" fill={paper} strokeWidth="1" />
    <Person {...me} />
    <DeskBench {...BENCH_NEAR} />
    {holidays && <>
      <path d="M602 322l52-6v3l-52 6Z" fill={paper} strokeWidth="1" />
      <Person {...her} />
    </>}
    {beat === "exam" && (
      // what my head was on: the holidays, the sun and playing
      <g className="keychain-art__dream">
        {[[636, 266, 1.5], [626, 256, 2.1], [615, 247, 2.8]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} fill={paper} strokeWidth="1.1" />)}
        <path transform="translate(586 226) scale(.62) translate(-636 -166)" d="M600 182q-14 0-14-12t14-12q2-14 18-13 8-10 22-4 14-3 18 9 13 2 12 14 0 12-14 13-4 10-18 8-10 6-22 1-14 4-16-4Z" fill={paper} strokeWidth="2" />
        <circle cx="573" cy="225" r="4.2" strokeWidth="1.1" />
        <path d={Array.from({ length: 8 }, (_, i) => `M${(573 + Math.cos(i * Math.PI / 4) * 6).toFixed(1)} ${(225 + Math.sin(i * Math.PI / 4) * 6).toFixed(1)}l${(Math.cos(i * Math.PI / 4) * 2).toFixed(1)} ${(Math.sin(i * Math.PI / 4) * 2).toFixed(1)}`).join("")} strokeWidth=".9" />
        <circle cx="598" cy="227" r="5" fill="currentColor" stroke="none" opacity=".85" />
        <path d="M594.5 223.5q3.5 3.5 0 7M601.5 223.5q-3.5 3.5 0 7" stroke={paper} strokeWidth=".7" />
      </g>
    )}
    <Floor y={406} from={440} to={940} />
  </>;
}

/**
 * The two of us on our bench, turned to each other. First she talks and I
 * mostly listen; then we both talk; then, on the last day, I hold out the
 * keychain and she reaches for it. Remembered, the same moment holds.
 */
type Beat = "shy" | "chat" | "giving";
const ME_ON_BENCH = (beat: Beat): PersonProps => ({
  who: "me", pose: "seat", facing: -1, x: 652, y: 352, seated: { thigh: 2, shin: 4 }, wear: UNIFORM,
  ...(beat === "shy" ? { mood: "soft", tilt: 16, near: "lap", far: "lap" } : beat === "chat" ? { mood: "excited", tilt: -4, near: [34, -50], far: "lap" } : { mood: "smile", tilt: 6, near: [42, -44], far: "lap" }),
});
const HER_ON_BENCH = (beat: Beat): PersonProps => ({
  who: "girl", pose: "seat", x: 552, y: 352, seated: { thigh: 2, shin: 4 },
  ...(beat === "shy" ? { mood: "talk", near: [36, -46], far: "lap" } : beat === "chat" ? { mood: "excited", tilt: -4, near: [32, -52], far: "lap" } : { mood: "smile", tilt: 4, near: [44, -38], far: "lap" }),
});

type Pose = { x: number; y: number; angle: number; scale: number };
const posed = ({ x, y, angle, scale }: Pose) => `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${scale.toFixed(4)})`;
const HELD = handsOf(ME_ON_BENCH("giving")).near;
const KEYCHAIN_FROM: Pose = { x: HELD[0], y: HELD[1] + KEYRING * IN_HAND, angle: 0, scale: IN_HAND };
/** The cover, laid at hand size between us, its keychain just below where mine hung. */
const COVER_AT = { x: 600, y: 330, scale: 0.32 };
const onCover = ({ x, y, angle, scale }: Pose): Pose => ({ x: COVER_AT.x + (x - 610) * COVER_AT.scale, y: COVER_AT.y + (y - 296) * COVER_AT.scale, angle, scale: scale * COVER_AT.scale });
const KEYCHAIN_TO = onCover(STILL.keychain);
const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};

const keychains = new WeakMap<ParentNode, SVGGElement | null>();
/** Moves the keychain for the last shot's progress. Called every frame it is on screen. */
export function settleKeychain(root: ParentNode, progress: number) {
  let el = keychains.get(root);
  if (el === undefined) {
    el = root.querySelector<SVGGElement>("[data-finale-keychain]");
    keychains.set(root, el);
  }
  if (!el) return;
  const t = ease((progress - 0.44) / 0.22);
  const mix = (a: number, b: number) => a + (b - a) * t;
  const value = posed({ x: mix(KEYCHAIN_FROM.x, KEYCHAIN_TO.x), y: mix(KEYCHAIN_FROM.y, KEYCHAIN_TO.y) - 6 * Math.sin(Math.PI * t), angle: mix(KEYCHAIN_FROM.angle, KEYCHAIN_TO.angle), scale: mix(KEYCHAIN_FROM.scale, KEYCHAIN_TO.scale) });
  if (el.getAttribute("transform") !== value) el.setAttribute("transform", value);
}

function Bench({ beat, finale = false }: { beat: Beat; finale?: boolean }) {
  const me = ME_ON_BENCH(beat);
  const her = HER_ON_BENCH(beat);
  return <>
    <g className="keychain-art__people">
      <path d="M512 352h182v9H512Zm12 9v39m158-39v39" fill={paper} strokeWidth="1.4" />
      <Person {...her} />
      <Person {...me} part="body" />
      <Floor y={402} from={460} to={760} />
    </g>
    {finale && (
      <>
        <g className="keychain-art__arrive keychain-art__arrive--pad"><ExamPad {...onCover(STILL.pad)} /></g>
        <g className="keychain-art__arrive keychain-art__arrive--pencil"><Pencil {...onCover(STILL.pencil)} /></g>
      </>
    )}
    {beat === "giving" && <g data-finale-keychain transform={posed(KEYCHAIN_FROM)}><HeartKeychain /></g>}
    <g className="keychain-art__people"><Person {...me} part="arm" /></g>
  </>;
}

/**
 * Home, the night before: my bag open on the floor and the little gifts around
 * it. I hold the keychain up to look at it, then slip it into the bag's pocket.
 */
function Packing({ beat }: { beat: "gifts" | "keychain" | "bag" }) {
  const me: PersonProps = {
    who: "me", pose: "sit", x: 600, y: 396, lean: beat === "keychain" ? 4 : 14,
    ...(beat === "gifts" ? { mood: "smile", tilt: 10, near: [60, -52], far: "knee" } : beat === "keychain" ? { mood: "awe", tilt: -6, near: [42, -84], far: "knee" } : { mood: "smile", tilt: 14, near: [62, -34], far: "knee" }),
  } as PersonProps;
  const hand = handsOf(me).near;
  return <>
    <g strokeWidth="1.1">
      <Toffee x={548} y={396} angle={-10} scale={.9} />
      <Toffee x={566} y={399} angle={12} scale={.9} />
      <Stickers x={712} y={392} angle={-6} scale={.7} />
      <path d="M736 398h22v-14h-22Z" fill={paper} />
      <path d="M740 388l5 3 5-5 5 7" opacity=".6" />
      <circle cx="526" cy="390" r="8" fill={paper} />
      <path d="M520 386l12 8m-12 0 12-8" opacity=".5" />
    </g>
    <SchoolBag x={668} y={400} scale={.9} />
    <Person {...me} part="body" />
    {beat === "gifts" && <Toffee x={hand[0] + 2} y={hand[1] + 6} angle={20} scale={.8} />}
    <Person {...me} part="arm" />
    {/* the keychain hangs from my fingers by its ring, in front of my hand */}
    {beat !== "gifts" && <HeartKeychain x={hand[0]} y={hand[1] + KEYRING * 0.3} angle={beat === "bag" ? 4 : -2} scale={.3} />}
    <Floor y={402} />
  </>;
}

/** At the classroom door: her parent waiting outside, her bag on her back, waving bye bye; me waving back from our bench. */
function ByeBye() {
  return <>
    <path d="M396 400V160h96v240M404 400V168h80v232" strokeWidth="1.4" opacity=".5" />
    {/* her parent, waiting just outside the door */}
    <path d="M430 400v-88q-6-40 10-58 4-8 2-16-4-14 8-18 12-2 14 12 2 10-4 22 18 16 12 58v88" fill="currentColor" stroke="none" opacity=".12" />
    <SchoolBag x={498} y={330} scale={.5} open={false} />
    <Person who="girl" x={512} y={400} mood="excited" near={[36, -92]} />
    <path d="M512 352h182v9H512Zm12 9v39m158-39v39" fill={paper} strokeWidth="1.4" opacity=".6" />
    <Person who="me" pose="seat" facing={-1} x={652} y={352} mood="smile" near={[34, -84]} far="lap" seated={{ thigh: 2, shin: 4 }} wear={UNIFORM} />
    <path className="keychain-art__wave" d="M552 240q-6-6-2-12m10 2q4-6 0-12" strokeWidth="1.2" opacity=".6" />
    <Floor y={402} from={380} to={760} />
  </>;
}

/** The bus home: me at a window near the back, the road going by. */
function BusHome() {
  return <>
    <g className="keychain-art__bus">
      <Bus x={600} y={400} window={92} />
      {/* other passengers, faint */}
      {[[-115, 290], [-1, 292], [175, 288]].map(([x, y]) => <circle key={x} cx={600 + x} cy={y} r="11" fill="currentColor" stroke="none" opacity=".18" />)}
      {/* me at the window */}
      <g transform={`${place([716, 284], -6, 0.5)} scale(-1 1)`}><Head role="narrator" mood="smile" /></g>
      <path d="M700 312q16-14 32 0Z" fill={paper} strokeWidth="1.2" />
      <path d="M692 250h50v62h-50Z" strokeWidth="1.3" />
      <path d="M692 312h50" strokeWidth="2" />
    </g>
    <g className="keychain-art__road" opacity=".2" strokeWidth="1">
      <path d="M840 220h40m-30 20h46m-36 20h30M300 404h120m30 0h260m30 0h140m-520 10h60m320 0h60" />
    </g>
  </>;
}

/**
 * The years after, in the school corridor: her going into her class, me into
 * mine with my books, our backs to each other. The boards over the doors
 * change, seventh to ninth standard, never the same section, and she fades.
 */
const ME_APART: PersonProps = { who: "me", x: 722, y: 400, mood: "focus", tilt: 6, near: [26, -30], far: [22, -32], wear: UNIFORM };
function Apart() {
  const books = handsOf(ME_APART).near;
  return <>
    <ClassDoor x={430} y={400} sections={["VII D", "VIII C", "IX A"]} />
    <ClassDoor x={800} y={400} sections={["VII B", "VIII A", "IX C"]} />
    <g className="keychain-art__her">
      <SchoolBag x={526} y={330} scale={.5} open={false} />
      <Person who="girl" facing={-1} x={512} y={400} mood="calm" />
    </g>
    <Person {...ME_APART} part="body" />
    <Books x={books[0] + 2} y={books[1] - 6} angle={-3} scale={.9} />
    <Person {...ME_APART} part="arm" />
    <Floor y={402} from={360} to={880} />
  </>;
}

export function HeartKeychainArt({ scene, className = "", viewBox = "0 0 1200 440" }: { scene: string; className?: string; viewBox?: string }) {
  let art;
  if (scene === "cover") art = <StillLife />;
  else if (scene === "exam" || scene === "clock" || scene === "holidays") art = <Classroom beat={scene} />;
  else if (scene === "shy" || scene === "chat") art = <Bench beat={scene} />;
  else if (["giving", "innocence", "first", "finale"].includes(scene)) art = <Bench beat="giving" finale={scene === "finale"} />;
  else if (scene === "gifts" || scene === "keychain" || scene === "bag") art = <Packing beat={scene} />;
  else if (scene === "bye") art = <ByeBye />;
  else if (scene === "bus") art = <BusHome />;
  else if (scene === "apart") art = <Apart />;
  else return null;
  return <svg className={`memory-art keychain-art keychain-art--${scene} ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{art}</svg>;
}
