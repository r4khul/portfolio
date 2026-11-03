import "./memory-art.css";
import "./memory-bicycle.css";
import { BIKE_AT, MemoryBicycle, facingFor, fistFor } from "./memory-bicycle";
import { COVER_FAN, HELD_ANGLES, Handheld, Pouch, heldSleeve } from "./memory-props";
import { Person } from "./memory-people";

const paper = "var(--background)";

/**
 * The last shot. The camera comes in on the bicycle, then holds on the five
 * ice tubes in my fist while the bicycle, my brother and I fade away. The
 * very same five sleeves then glide out of my hand into the cover's fan, and
 * the console slides in beside them. It ends as the cover did.
 */
const FIST = fistFor("reflection");
const FACING = facingFor("reflection");
const FIST_AT = { x: BIKE_AT.x + FACING * FIST[0] * BIKE_AT.scale, y: BIKE_AT.y + FIST[1] * BIKE_AT.scale };
/** The cover is laid at hand size, its tubes where mine hang, just beside my fist. */
const COVER_AT = { x: FIST_AT.x + 15, y: 266, scale: 0.257 };
type Pose = { x: number; y: number; angle: number; scale: number };
const posed = ({ x, y, angle, scale }: Pose) => `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${scale.toFixed(4)})`;
/** Each sleeve's pose in my fist and in the fan, in art units. */
const HELD_POSES: Pose[] = HELD_ANGLES.map((angle) => {
  const held = heldSleeve(FIST, angle);
  return { x: BIKE_AT.x + FACING * held.x * BIKE_AT.scale, y: BIKE_AT.y + held.y * BIKE_AT.scale, angle: FACING * held.angle, scale: held.scale * BIKE_AT.scale };
});
const FAN_POSES: Pose[] = COVER_FAN.map(([x, fan, scale]) => ({
  x: COVER_AT.x + (x - 755) * COVER_AT.scale,
  y: COVER_AT.y + (296 - 214) * COVER_AT.scale,
  angle: fan,
  scale: scale * COVER_AT.scale,
}));
// Pair them left to right, so no two sleeves cross on the way.
const byX = (poses: Pose[]) => poses.map((pose, index) => ({ pose, index })).sort((a, b) => a.pose.x - b.pose.x);
const FINALE_TUBES = (() => {
  const from = byX(HELD_POSES);
  const to = byX(FAN_POSES);
  return from.map(({ pose }, order) => ({ from: pose, to: to[order].pose }));
})();
const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};

/** Moves the five sleeves for the last shot's progress. Called every frame it is on screen. */
export function settleFinale(root: ParentNode, progress: number) {
  root.querySelectorAll<SVGGElement>("[data-finale-tube]").forEach((el) => {
    const index = Number(el.dataset.finaleTube);
    const { from, to } = FINALE_TUBES[index];
    // they move almost as one, a light ripple from left to right
    const t = ease((progress - 0.45 - index * 0.008) / 0.22);
    const mix = (a: number, b: number) => a + (b - a) * t;
    const pose = { x: mix(from.x, to.x), y: mix(from.y, to.y) - 6 * Math.sin(Math.PI * t), angle: mix(from.angle, to.angle), scale: mix(from.scale, to.scale) };
    const value = posed(pose);
    if (el.getAttribute("transform") !== value) el.setAttribute("transform", value);
  });
}

function Finale() {
  return <>
    <MemoryBicycle pace="reflection" held={false} />
    <g className="memory-art__finale-tubes">
      {FINALE_TUBES.map(({ from }, index) => (
        <g key={index} data-finale-tube={index} transform={posed(from)}><Pouch /></g>
      ))}
    </g>
    {/* my fist over their top seals, fading with the rest of me */}
    <circle className="memory-art__finale-fist" cx={FIST_AT.x} cy={FIST_AT.y} r="8" fill={paper} strokeWidth="1.5" />
    {/* the console, sliding in beside them as on the cover */}
    <g className="memory-art__finale-console">
      <g transform={`translate(${COVER_AT.x.toFixed(1)} ${COVER_AT.y}) scale(${COVER_AT.scale}) translate(-755 -214)`}><Handheld /></g>
    </g>
  </>;
}

function Cover() {
  return <>
    <g className="memory-art__cover-sleeves" strokeWidth="1.15">
      <Pouch x={689} y={296} angle={-18} scale={1.12} />
      <Pouch x={725} y={296} angle={-9} scale={1.13} />
      <Pouch x={762} y={296} scale={1.14} />
      <Pouch x={799} y={296} angle={9} scale={1.13} />
      <Pouch x={835} y={296} angle={18} scale={1.12} />
    </g>
    <g className="memory-art__cover-console"><Handheld /></g>
  </>;
}

function Laptop() {
  return <>
    <path d="M302 399h550m-498 9h98m224 0h81M334 384h56m397-3h36" opacity=".13" strokeWidth=".8" />
    {/* the four of us on the floor: Chithappa's sons, my brother, and me at the keys */}
    <Person who="cousin" pose="sit" x={566} y={364} scale={1.05} lean={4} mood="smile" near="knee" far="knee" />
    <Person who="brother" pose="sit" x={480} y={386} scale={1.1} lean={12} mood="focus" near={[70, -20]} far="knee" part="body" />
    <Person who="me" pose="sit" facing={-1} x={676} y={388} scale={1.1} lean={14} mood="awe" near={[61, -21]} far="knee" part="body" />
    <Person who="cousin-swept" pose="sit" facing={-1} x={800} y={386} scale={1.1} lean={6} mood="excited" near={[62, -92]} far="knee" />
    <g transform="translate(260 164) scale(.55)"><g transform="rotate(-4 578 297)">
      <path d="M489 228h166l10 105H498Z" fill={paper} strokeWidth="1.8" />
      <path d="M501 241h143l7 77H508Z" strokeWidth="1" opacity=".7" />
      <path className="memory-art__screen-glow" d="m503 243 139-1 7 74H510Z" fill="currentColor" stroke="none" opacity=".06" />
      <g className="memory-art__game" strokeWidth="1" opacity=".6">
        <path d="M512 304h33v-11h23m29 0h46m-131 10h20m58 0h45m-121-61h15m7 0h9m7 0h9m57 51v-17h10v17" opacity=".55" />
        <path d="m574 278 3-9 7 1 5 8-5 13h-9Zm3 14-5 8m10-8 9 7m-16-21-8 4m20-6 9-3m9-16 5-5 5 5-5 5Z" />
      </g>
      <text x="510" y="257" fontSize="10.5" fill="currentColor" stroke="none" opacity=".75" style={{ fontFamily: "var(--font-geist-mono), monospace", letterSpacing: ".08em" }}>HESOYAM</text>
      <path className="memory-art__caret" d="M563 248v10" strokeWidth="1.4" />
      <path d="m498 333 167 0 48 26-167 11-47-29Z" fill={paper} strokeWidth="1.6" />
      <path d="m509 337 22 0m97-1 25 0" strokeWidth="4" />
      <path d="m529 344 115-1 24 13-115 7Zm7 5 120-1m-112 9 119-3m-119-10 9 17m10-17 9 15m9-15 9 14m9-14 9 13m9-13 9 12m8-12 9 10m-53 23 34-2" opacity=".55" strokeWidth=".8" />
      <path d="m547 369 165-10v5l-166 12-47-31v-5" strokeWidth="1" /><circle cx="572" cy="234" r="1.2" fill="currentColor" stroke="none" />
    </g></g>

    <Person who="brother" pose="sit" x={480} y={386} scale={1.1} lean={12} near={[70, -20]} part="arm" />
    <Person who="me" pose="sit" facing={-1} x={676} y={388} scale={1.1} lean={14} near={[61, -21]} part="arm" />
  </>;
}

function Shop({ empty = false }: { empty?: boolean }) {
  return <>
    <g opacity=".3" strokeWidth="1.1">
      <path d="M353 383V78h492v305m-502-305h513m-497-13h479m-471 28h470m-465 287h457m-471 8h485m-499 8h512M365 105h467v254H365Z" />
      <path d="M328 378V204h25m492-84h33v256m-13-246v246M378 95h100m44 0h63m176 0h54" opacity=".5" />
      <path d="M388 312h269m-268 6h269m-269 16h269m-269 6h269M391 358v-18m257 18v-18" />
    </g>
    <g opacity=".5" strokeWidth="1">
      {/* A toy car, a small bear, and a ball on the shelf. */}
      <path d="M514 305h61v-18h-10l-10-12h-21l-10 12h-10Zm14-18h34m-23-12v12" /><circle cx="529" cy="307" r="5" fill={paper} /><circle cx="561" cy="307" r="5" fill={paper} />
      <path d="M603 284q-14-12-8-18 5-5 11 4 8-6 13 0 5 6-6 14 14 10 7 24h-24q-6-14 7-24Zm-4 20-7 8m23-8 7 8m-18-32h7m-4-6v5" />
      <circle cx="642" cy="298" r="14" /><path d="m630 291 23 15m-23 0 23-15m-12-7v28" opacity=".5" />
    </g>
    {/* toys strung from the ceiling: a balloon bunch, a toy gun, a cricket bat */}
    <g opacity=".42" strokeWidth=".9">
      <path d="M396 92v26m70-26v18m122-18v22m96-22v30m104-30v16" opacity=".6" />
      <ellipse cx="392" cy="127" rx="8" ry="10" /><ellipse cx="402" cy="125" rx="7.5" ry="9.5" /><path d="m392 137 3 5m6-7 0 6" opacity=".6" />
      <path d="M454 110h26v6h-6l-2 10h-6l2-10h-14Zm22 1 4-4" />
      <path d="m586 114 6 0 2 30-3 12h-4l-3-12Z" /><path d="M589 118v22" opacity=".5" />
      <circle cx="684" cy="129" r="8" /><path d="M676 129h16m-8-8v16" opacity=".5" />
      <path d="M782 108h12l2 14h-16Zm2 14 1 8h6l1-8" />
    </g>
    <g className="memory-art__shutter" strokeWidth="1">
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M371 ${118 + i * 11}h456`} opacity={i % 2 ? ".2" : ".35"} />)}
      <path d="M367 241h465m-465 5h465m-246-5v-9h28v9" strokeWidth="2" opacity=".7" />
      <path d="M370 111h457" strokeWidth="4" opacity=".3" />
    </g>
    <g opacity=".35"><path d="M883 90v59m-12 0h24v15q0 12-12 12t-12-12Zm4 28h16m-8-27v15m-31-10-10-3m82 0-10 3m-31 34v11" strokeWidth="1" /></g>

    {empty && (
      // where the one he meant had stood: a clean patch in the dust
      <g strokeWidth=".9">
        <path d="M596 320h34v13h-34Z" strokeDasharray="3 4" opacity=".4" />
        {/* the other console, the kind that plugs into a TV, with two pads */}
        <g transform="translate(458 278)" opacity=".75">
          <path d="M0 4h44v26H0Z" fill={paper} /><path d="M4 8h36v10H4Z" opacity=".5" />
          <path d="M8 23h6m4 0h6" opacity=".6" />
          <path d="M-22 34q-4-8 4-9h14q8 1 4 9Z" fill={paper} /><path d="M20 34q-4-8 4-9h14q8 1 4 9Z" fill={paper} />
          <path d="M-4 30q2-6 6-6" opacity=".5" />
        </g>
      </g>
    )}
    {/* Anna, thin, behind the low counter */}
    <Person who="anna" x={438} y={460} mood={empty ? "worried" : "calm"} near={empty ? [52, -55] : [32, -19]} far="hang" />
    {/* the thin towel every shop anna keeps on one shoulder */}
    <path d="M430 289q7 3 13 1l-2 17q-1 6 1 11l-7 1q-3-6-3-13Z" fill={paper} strokeWidth=".9" />
    <path d="m433 295 7-1m-7 7 7-1m-7 7 6-1" strokeWidth=".6" opacity=".6" />
    {/* the counter hides everything of him below the waist */}
    <path d="M384 341h102v130H384Z" fill={paper} stroke="none" />
    <path d="M395 341h83v7h-83" fill={paper} strokeWidth="1" />
    <path d="M391 348v52m85-52v52M391 372h85" strokeWidth=".9" opacity=".35" />

    {/* We have just come in from the half-closed shop: me looking up, him asking. */}
    <Person who="me" facing={-1} x={680} y={421} scale={.88} mood={empty ? "sad" : "awe"} tilt={empty ? 12 : -10} />
    <Person who="brother" facing={-1} x={742} y={420} scale={.88} mood={empty ? "worried" : "talk"} near={empty ? [50, -26] : [52, -76]} />
    <path d="M328 423h125m15 0h224m18 0h136m-486 8h66m296 0h71" opacity=".14" strokeWidth=".8" />
  </>;
}

function IceTubes() {
  return <g className="memory-art__tubes" strokeWidth="1.3">
    <g className="memory-art__pouch memory-art__pouch--outer-left"><Pouch x={500} y={300} angle={-18} /></g>
    <g className="memory-art__pouch memory-art__pouch--inner-left"><Pouch x={550} y={300} angle={-9} /></g>
    <Pouch x={600} y={300} />
    <g className="memory-art__pouch memory-art__pouch--inner-right"><Pouch x={650} y={300} angle={9} /></g>
    <g className="memory-art__pouch memory-art__pouch--outer-right"><Pouch x={700} y={300} angle={18} /></g>
    <g className="memory-art__condensation">
      <path d="m492 362 5 10q4 7-2 10-7 0-8-6Zm204 6 5 10q3 6-2 8-6 0-6-5Z" />
      <path d="m548 352 4 8q3 5-1 8-5 0-5-4m100-12 3 6q2 4-1 5-4 0-4-3" opacity=".65" />
    </g>
  </g>;
}

/** The wall clock: nine when Chithappa comes, then quarter past, then half past when I ask Amma. */
function WallClock({ x, y, time }: { x: number; y: number; time: "nine" | "quarter-past" | "half-past" }) {
  const hour = { nine: 270, "quarter-past": 277.5, "half-past": 285 }[time];
  const minute = { nine: 0, "quarter-past": 90, "half-past": 180 }[time];
  const hand = (degrees: number, length: number) => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return `M${x} ${y}l${(Math.cos(radians) * length).toFixed(1)} ${(Math.sin(radians) * length).toFixed(1)}`;
  };
  return <g opacity=".3" strokeWidth=".9">
    <circle cx={x} cy={y} r="24" /><circle cx={x} cy={y} r="20.5" opacity=".5" />
    <path d={Array.from({ length: 12 }, (_, i) => {
      const radians = (i * 30 * Math.PI) / 180;
      return `M${(x + Math.sin(radians) * 17).toFixed(1)} ${(y - Math.cos(radians) * 17).toFixed(1)}l${(Math.sin(radians) * (i % 3 ? 1.5 : 3)).toFixed(1)} ${(-Math.cos(radians) * (i % 3 ? 1.5 : 3)).toFixed(1)}`;
    }).join("")} />
    <path d={hand(hour, 11)} strokeWidth="1.8" /><path d={hand(minute, 16)} strokeWidth="1.1" />
    <circle cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />
    <path d={`M${x} ${y - 24}v-8`} opacity=".6" />
  </g>;
}

/** The tear-off daily calendar every Tamil home hangs by the door. */
function DailyCalendar({ x, y }: { x: number; y: number }) {
  return <g opacity=".26" strokeWidth=".85" transform={`translate(${x} ${y})`}>
    <path d="M0-14v8" /><circle cx="0" cy="-15" r="1.6" />
    <path d="M-24-6h48v16h-48Z" fill="currentColor" fillOpacity=".08" />
    <path d="M-22 10h44v52h-44Zm2 52 1 3h38l1-3" fill={paper} />
    <path d="M-14 20h28m-22 6h16" opacity=".6" />
    <path d="M-7 32v18m7-18h7v9h-7v9h7" strokeWidth="2.2" opacity=".55" />
    <path d="M-14 55h28" opacity=".5" />
  </g>;
}

/** The suitcase and a cloth bag, packed for the 11:30 train; they stand by the window all evening. */
function Bags() {
  return <g strokeWidth="1.1">
    <path d="M552 336h92q6 0 6 6v50H546v-50q0-6 6-6Z" fill={paper} />
    <path d="M582 336v-9q0-5 5-5h22q5 0 5 5v9M570 336v56m56-56v56M546 360h104" opacity=".6" />
    <path d="M552 392v4m86-4v4" strokeWidth="1.6" />
    <path d="M522 396q-6-26 3-35h22q9 9 3 35Z" fill={paper} />
    <path d="M528 361q8-16 16 0M524 376h26" opacity=".55" />
  </g>;
}

/**
 * The last evening in the house. At nine the bags stand packed by the door;
 * at quarter past I'm alone with my hand on the money, thinking about it.
 */
function Evening({ thinking = false }: { thinking?: boolean }) {
  return <>
    <WallClock x={711} y={118} time={thinking ? "quarter-past" : "nine"} />
    <DailyCalendar x={640} y={126} />
    <Bags />
    <Person who="me" facing={-1} x={704} y={395} mood={thinking ? "worried" : "calm"} near={thinking ? "pocket" : "hang"} />
    {thinking && (
      // what I couldn't stop thinking about
      <g>
        {[[694, 214, 2.2], [685, 202, 3.2], [675, 190, 4.4]].map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} fill={paper} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        ))}
        <path transform="translate(634 158) scale(1.05) translate(-636 -166)" d="M600 182q-14 0-14-12t14-12q2-14 18-13 8-10 22-4 14-3 18 9 13 2 12 14 0 12-14 13-4 10-18 8-10 6-22 1-14 4-16-4Z" fill={paper} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
        <g transform="translate(635 159) scale(.17) translate(-539 -273)"><Handheld /></g>
      </g>
    )}
    <path d="M500 401h160m15 0h110m-250 8h60m130 0h40" opacity=".13" strokeWidth=".8" />
  </>;
}

function Gift({ taking = false }: { taking?: boolean }) {
  return <>
    <WallClock x={711} y={118} time="nine" />
    <DailyCalendar x={640} y={126} />
    <Bags />
    {/* Chithappa, holding the notes out; me, reaching for them */}
    <Person who="chithappa" x={588} y={395} mood="smile" near={[46, -10]} />
    <Person who="me" facing={-1} x={704} y={395} mood={taking ? "smile" : "worried"} near={[52, -45]} />
    {/* ₹2,000 in folded notes, held between us */}
    <g transform="rotate(10 644 278)" strokeWidth=".85">
      <path d="M630 271h28v14h-28Z" fill={paper} /><path d="M633 268h28v14h-28Z" fill={paper} />
      <path d="M636 271h22v8h-22Zm3 2.5h3m10 3.5h3" opacity=".4" /><ellipse cx="647" cy="275" rx="2.3" ry="3" opacity=".4" />
    </g>
    {/* his fingers over the notes */}
    <path d="M628 272c4-3 10-2 13 2l1 5c-3 3-9 3-13 1Z" fill={paper} strokeWidth="1.1" />
    <path d="M394 401h147m15 0h198m-319 8h50m196 0h52" opacity=".13" strokeWidth=".8" />
  </>;
}

function Permission() {
  return <>
    <g opacity=".15" strokeWidth="1"><path d="M428 400V81h167v319m-155-5V94h143v301m-139-299 30 13v266l-30 17m22-148h1M419 401h185m-192 8h199" /></g>
    <DailyCalendar x={640} y={126} />
    <Bags />
    {/* Amma, a little short, saying go */}
    <Person who="amma" x={505} y={397} mood="talk" near={[64, -52]} />
    <Person who="me" facing={-1} x={704} y={395} mood="excited" />
    <WallClock x={711} y={118} time="half-past" />
    <path d="M410 417h178m18 0h137m-290 8h64m155 0h52" opacity=".13" strokeWidth=".8" />
  </>;
}

/**
 * Sitting on the floor with him: first just me and the brick game, then his
 * description of the console, then its price, when the idea of it fades.
 */
function ConsoleConversation({ beat = "telling" }: { beat?: "brick" | "telling" | "price" }) {
  return <>
    <Person who="brother" pose="sit" x={480} y={386} scale={1.1} lean={4} mood={beat === "price" ? "calm" : "talk"} near={beat === "brick" || beat === "price" ? "lap" : [64, -66]} far="knee" />
    <Person who="me" pose="sit" facing={-1} x={676} y={388} scale={1.1} lean={beat === "telling" ? 8 : 2} tilt={beat === "price" ? 12 : beat === "brick" ? 10 : 0} mood={beat === "brick" ? "calm" : beat === "price" ? "down" : "awe"} near={beat === "brick" ? "lap" : beat === "price" ? "lap" : "knee"} far="knee" />
    {/* the brick game I knew, Tetris on a tiny grey screen, in my lap the whole time he talks */}
    <g transform="translate(624 332) rotate(8) scale(.9)" strokeWidth=".9">
      <path d="M0 0h26q4 0 4 4v34q0 4-4 4H0q-4 0-4-4V4q0-4 4-4Z" fill={paper} />
      <path d="M3 4h20v15H3Z" opacity=".7" />
      <path d="M6 15h4v-4h4v4h4M10 11V7h4" strokeWidth=".8" opacity=".75" />
      <circle cx="21" cy="30" r="2.6" /><circle cx="15" cy="35" r="2.2" /><path d="M2 30h6m-3-3v6" opacity=".7" />
    </g>
    {/* He only described it, so it lives in a thought above my head. At the price, the thought fades. */}
    {beat !== "brick" && (
      <g className={`memory-art__wish${beat === "price" ? " memory-art__wish--fading" : ""}`}>
        {[[666, 260, 2.2], [673, 247, 3.2], [681, 232, 4.4]].map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} fill={paper} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        ))}
        <path transform="translate(696 198) scale(1.12) translate(-636 -166)" d="M600 182q-14 0-14-12t14-12q2-14 18-13 8-10 22-4 14-3 18 9 13 2 12 14 0 12-14 13-4 10-18 8-10 6-22 1-14 4-16-4Z" fill={paper} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
        <g transform="translate(697 199) scale(.18) translate(-539 -273)"><Handheld /></g>
        {beat === "price" && (
          // and the tag that made it impossible
          <g className="memory-art__wish-tag" strokeWidth=".9">
            <path d="M715 224l5 9" strokeDasharray="1.5 2" />
            <path d="M717 231l30 5-2 13-30-5Z" fill={paper} /><circle cx="720" cy="236" r="1.4" />
            <text x="732" y="244" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="currentColor" stroke="none" transform="rotate(9 732 242)">₹1,500</text>
          </g>
        )}
      </g>
    )}
    <path d="M394 397h151m19 0h217m-329 8h54m183 0h53" opacity=".13" strokeWidth=".8" />
  </>;
}

export function MemoryArt({ scene, className = "", viewBox = "0 0 1200 440" }: { scene: string; className?: string; viewBox?: string }) {
  let art;
  if (scene === "cover") art = <Cover />;
  else if (["cousins", "laptop", "four"].includes(scene)) art = <Laptop />;
  else if (["rush", "ride", "bicycle", "reflection", "after"].includes(scene)) art = <MemoryBicycle pace={scene === "rush" || scene === "bicycle" ? "rush" : scene === "ride" ? "ride" : "reflection"} />;
  else if (["shop", "shutter", "empty", "other"].includes(scene)) art = <Shop empty={scene === "empty" || scene === "other"} />;
  else if (scene === "ice") art = <IceTubes />;
  else if (scene === "gift" || scene === "taking") art = <Gift taking={scene === "taking"} />;
  else if (scene === "packed" || scene === "pocket") art = <Evening thinking={scene === "pocket"} />;
  else if (scene === "permission") art = <Permission />;
  else if (scene === "finale") art = <Finale />;
  else if (scene === "console" || scene === "brick" || scene === "price") art = <ConsoleConversation beat={scene === "console" ? "telling" : scene} />;
  else return null;
  return <svg className={`memory-art memory-art--${scene} ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{art}</svg>;
}
