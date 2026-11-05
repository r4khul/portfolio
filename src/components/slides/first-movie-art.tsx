import "./first-movie-art.css";
import { Head, capsule, paper, place } from "./memory-figures";
import { Person, handsOf, type PersonProps } from "./memory-people";
import { AvengerRide } from "./first-movie-avenger";
import { Burger, Can, Carrom, Clapboard, Clock, Cup, Games, Notebook, Phone, Popcorn, STILL, StillLife, Ticket, Turtle } from "./first-movie-props";

/** The floor line, faint, under a scene. */
const Floor = ({ y, from = 380, to = 820 }: { y: number; from?: number; to?: number }) => (
  <path d={`M${from} ${y}h${(to - from) * 0.36}m${(to - from) * 0.04} 0h${(to - from) * 0.6}M${from + 40} ${y + 8}h${(to - from) * 0.16}m${(to - from) * 0.42} 0h${(to - from) * 0.14}`} opacity=".13" strokeWidth=".8" />
);

/** Their house: Anna, tall in his checked shirt, and Akka beside him; me looking up at them. */
function Couple() {
  return <>
    <Person who="tenant" x={520} y={400} mood="smile" near={[69, -61]} />
    <Person who="akka" x={590} y={400} mood="smile" />
    <Person who="me" facing={-1} x={700} y={400} mood="awe" tilt={-12} />
    <Floor y={402} />
  </>;
}

/**
 * Me at the far side of the carrom board, facing out towards you, my head
 * tilted a little, leaning in over the board for my shot. The rig only draws
 * people side on, so this one is drawn face on, in head units as `Head` is,
 * to the rig's own measures: the same head, a kid's narrow shoulders, the
 * same limb widths and line weights, and my T-shirt's one bold stripe across
 * the chest. `body` is everything behind the board; the arms come after it,
 * so my hands rest on its far edge.
 */
const FACE_LIMB = 16.7;
function FacingMe({ x, y, k, part }: { x: number; y: number; k: number; part: "body" | "arms" }) {
  const arm = (side: 1 | -1) => {
    const shoulder = [31 * side, 48] as const;
    const elbow = [42 * side, 98] as const;
    const hand = [18 * side, 148] as const;
    const cuff = [shoulder[0] + (elbow[0] - shoulder[0]) * 0.48, shoulder[1] + (elbow[1] - shoulder[1]) * 0.48] as const;
    const parts = [capsule(elbow, hand, FACE_LIMB * 0.85, FACE_LIMB * 0.72), capsule(shoulder, elbow, FACE_LIMB, FACE_LIMB * 0.86)];
    return (
      <g key={side}>
        {parts.map((d) => <path key={`l${d}`} d={d} strokeWidth="5.1" />)}
        {parts.map((d) => <path key={`f${d}`} d={d} fill={paper} stroke="none" />)}
        <path d={capsule(shoulder, cuff, FACE_LIMB * 1.42, FACE_LIMB * 1.3)} fill={paper} strokeWidth="2.7" />
        <circle cx={hand[0]} cy={hand[1]} r="9.2" fill={paper} strokeWidth="2.7" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(-7) scale(${k})`}>
      {part === "arms" ? (
        <>{arm(-1)}{arm(1)}</>
      ) : (
        <>
          {/* my neck, shaded under the jaw as the side-on heads are */}
          <path d="M-10 22v20h20V22Z" fill={paper} strokeWidth="2.2" />
          <path d="M-10 26q10 8 20 0v10q-10 6-20 0Z" fill="currentColor" stroke="none" opacity=".06" />
          {/* my T-shirt, leaning towards you so it looks shorter, its one bold stripe across the chest */}
          <path d="M-13 37q13-3 26 0q16 2 22 10l2 104H-35l2-104q6-8 22-10Z" fill={paper} strokeWidth="3.3" />
          <path d="M-34.3 72H34.3V85H-34.3Z" fill="currentColor" stroke="none" />
          <path d="M-9 38q9 9 18 0" strokeWidth="2.3" />
          <path d="M-20 100q-3 12-1 20M14 54q3 8 1 14" strokeWidth="2" opacity=".45" />
          {/* the mop of curls, my ears, my face */}
          <path d="M-31 14Q-41 8-37-2Q-45-12-37-20Q-41-32-29-34Q-27-46-13-42Q-7-52 5-44Q17-50 23-38Q35-38 33-26Q43-18 35-8Q41 2 31 14Z" fill="currentColor" stroke="none" />
          <path d="M-29 0q-8 2-6 10t8 5M29 0q8 2 6 10t-8 5" fill={paper} strokeWidth="2" />
          <path d="M-24-2C-24-21-13-29 0-29S24-21 24-2C24 14 14 31 0 31S-24 14-24-2Z" fill={paper} strokeWidth="2.2" />
          <path d="M-24-6Q-27-24-12-27Q-4-35 6-27Q18-31 22-19Q28-12 24-5Q18-14 10-10Q2-18-6-10Q-14-16-24-6Z" fill="currentColor" stroke="none" />
          <path d="M-29-20q3-4 7-1M-15-36q3-4 7-1M7-37q4-3 7 1M23-27q3-2 5 1M-3-21q3-3 6 0" stroke={paper} strokeWidth="1.2" opacity=".55" />
          {/* eyes down on the board, the same small eyes and thick brows, a grin */}
          <ellipse cx="-9" cy="5" rx="3" ry="3.8" fill="currentColor" stroke="none" />
          <ellipse cx="9" cy="5" rx="3" ry="3.8" fill="currentColor" stroke="none" />
          <circle cx="-8" cy="3.6" r="1.15" fill={paper} stroke="none" />
          <circle cx="10" cy="3.6" r="1.15" fill={paper} stroke="none" />
          <path d="M-15-4q5-4 11-1M4-5q6-3 11 1" strokeWidth="2.1" />
          <path d="M-1 9q3 4 0 7" strokeWidth="1.4" opacity=".7" />
          <path d="M-6 19q6 7 12 0Z" fill="currentColor" strokeWidth="1.4" />
        </>
      )}
    </g>
  );
}

/** The three of us round the carrom board, the other games stacked by the wall. */
function BoardGames() {
  const me = { x: 607, y: 295, k: 0.489 };
  return <>
    <Games x={410} y={374} scale={1.1} />
    {/* me across the board, facing you, about to take my shot */}
    <FacingMe {...me} part="body" />
    <Carrom x={610} y={378} scale={.8} />
    <FacingMe {...me} part="arms" />
    <Person who="tenant" pose="sit" x={505} y={396} lean={14} mood="smile" near="knee" far="knee" />
    {/* Akka at her end of the board, her striker on her baseline, waiting her turn */}
    <Person who="akka" pose="sit" facing={-1} x={720} y={396} lean={20} mood="excited" near={[64, 0]} far="knee" />
    <Floor y={402} />
  </>;
}

/**
 * Sitting with Akka on the floor: she reads with me, I write. Later the same
 * floor is where I rush through my homework while the clock runs to six.
 */
function Lesson({ rushing = false }: { rushing?: boolean }) {
  const me: PersonProps = { who: "me", pose: "sit", facing: -1, x: 680, y: 396, lean: rushing ? 18 : 12, tilt: rushing ? 16 : 8, mood: rushing ? "focus" : "calm", near: [52, -18], far: "knee" };
  const akka: PersonProps = { who: "akka", pose: "sit", x: 520, y: 396, lean: 8, mood: rushing ? "smile" : "talk", near: rushing ? "knee" : [62, -44], far: "lap" };
  const pencil = handsOf(me).near;
  const book = handsOf(akka).near;
  return <>
    <Clock x={600} y={176} hour={rushing ? 4 : 3} minute={rushing ? 0 : 30} turning={rushing} />
    <Person {...akka} part="body" />
    {!rushing && (
      // her book, held open toward me, and what she says, in English
      <g>
        <path d={`M${book[0] - 8} ${book[1] - 4}l14-6 14 6v18l-14-6-14 6Z`} fill={paper} strokeWidth="1.2" /><path d={`M${book[0] + 6} ${book[1] - 10}v18`} strokeWidth=".9" />
        <path d={`M${book[0] - 4} ${book[1] - 1}l7-3m-7 7 7-3m6-1 7 3m-7 1 7 3`} strokeWidth=".6" opacity=".5" />
        <path d="M560 246q0-12 16-12h42q16 0 16 12v8q0 12-16 12h-30l-10 10 2-10h-4q-16 0-16-12Z" fill={paper} strokeWidth="1.1" />
        <text x="597" y="254" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontStyle: "italic" }}>Very good!</text>
      </g>
    )}
    <Person {...akka} part="arm" />
    <Person {...me} part="body" />
    <Notebook x={pencil[0] - 8} y={pencil[1] + 10} scale={1.1} />
    <Person {...me} part="arm" />
    <Floor y={402} />
  </>;
}

/** Anna's phone in my hands, and Anna leaning in behind me to watch. */
function Phoning() {
  const me: PersonProps = { who: "me", pose: "sit", x: 610, y: 396, lean: 14, tilt: 18, mood: "focus", near: [40, -36], far: [34, -38] };
  const hands = handsOf(me);
  return <>
    <Person who="tenant" pose="sit" x={540} y={384} scale={.96} lean={24} tilt={14} mood="smile" near="knee" far="knee" />
    <Person {...me} part="body" />
    <Phone x={(hands.near[0] + hands.far[0]) / 2 + 4} y={hands.near[1] - 6} angle={-28} scale={.55} />
    <Person {...me} part="arm" />
    <Floor y={402} />
  </>;
}

/** Their door after school: Akka holding up the tickets, me in my uniform with my bag, too shy to say yes. */
function Tickets() {
  const akka: PersonProps = { who: "akka", x: 560, y: 400, mood: "excited", near: [52, -104] };
  const tickets = handsOf(akka).near;
  return <>
    <g opacity=".3" strokeWidth="1"><path d="M470 400V150h150v250m-140 0V160h130v240" /></g>
    <Person {...akka} part="body" />
    <Ticket x={tickets[0] + 6} y={tickets[1] - 10} angle={-14} scale={.34} />
    <Ticket x={tickets[0] + 12} y={tickets[1] - 2} angle={4} scale={.34} />
    <Person {...akka} part="arm" />
    {/* my school bag on my back */}
    <path d="M696 276h20q5 0 5 5v36q0 5-5 5h-20q-5 0-5-5v-36q0-5 5-5Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
    <path d="M696 296h25" stroke={paper} strokeWidth="1" opacity=".6" />
    <Person who="me" facing={-1} x={680} y={400} mood="soft" tilt={16} wear={{ top: "shirt", bottom: "shorts" }} near="hang" far="hang" />
    <path d="M688 270q-4 14-1 26" strokeWidth="3.2" />
    <Floor y={402} />
  </>;
}

/** At our door: Akka, her hand on my shoulder, asking Amma for me. */
function Asking() {
  return <>
    <g opacity=".3" strokeWidth="1"><path d="M680 400V140h150v260m-140 0V150h130v250" /></g>
    <Person who="amma" facing={-1} x={760} y={400} mood="smile" near={[40, -48]} />
    <Person who="akka" x={520} y={400} mood="talk" near={[79, -16]} far={[50, -40]} />
    <Person who="me" x={600} y={400} mood="awe" tilt={-14} near="hang" />
    <Floor y={402} />
  </>;
}

/** Getting ready: my hoodie on, a pinch of javadhu at my neck, my face in the mirror. */
function Ready() {
  const me: PersonProps = { who: "me", x: 600, y: 400, mood: "smile", near: [18, -50], wear: { top: "hoodie", bottom: "plain" } };
  const pinch = handsOf(me).near;
  return <>
    {/* the mirror on the wall, and me in it */}
    <ellipse cx="700" cy="212" rx="34" ry="46" fill={paper} strokeWidth="2" />
    <ellipse cx="700" cy="212" rx="28" ry="40" strokeWidth=".8" opacity=".4" />
    <g opacity=".5" transform={`${place([704, 214])} scale(-.55 .55)`}><Head role="narrator" mood="smile" /></g>
    <path d="M680 186q6-8 16-6" strokeWidth="1.2" opacity=".35" />
    {/* the shelf under it: the powder tin and the little box of javadhu */}
    <path d="M660 300h90v6h-90Z" fill={paper} strokeWidth="1.2" />
    <path d="M672 300v-28q0-4 8-4h8q8 0 8 4v28Z" fill={paper} strokeWidth="1.2" />
    <path d="M672 276h24m-17-8v-4h10v4" strokeWidth=".9" opacity=".6" />
    <path d="M716 300v-10h18v10Zm-2-10h22l-4-6h-14Z" fill={paper} strokeWidth="1.1" />
    <Person {...me} />
    {/* its scent, curling up */}
    <path className="movie-art__scent" d={`M${pinch[0] + 6} ${pinch[1] - 8}q8-8 2-16t4-18m6 30q8-6 4-14t6-14`} strokeWidth="1" opacity=".5" />
    <Floor y={402} />
  </>;
}

/** The pani puri cart on the way: the man filling a puri, me eating one, Anna and Akka behind me. */
function PaniPuri() {
  const me: PersonProps = { who: "me", facing: -1, x: 600, y: 400, mood: "excited", near: [28, -74], far: [30, -50], wear: { top: "hoodie", bottom: "plain", shoes: true } };
  const hands = handsOf(me);
  return <>
    <Person who="vendor" x={450} y={400} mood="smile" near={[52, -62]} far={[44, -56]} />
    {/* the cart: its glass case of puris, the pot of pani, on wheels */}
    <g>
      <path d="M380 318h160v12H380Z" fill={paper} strokeWidth="1.4" />
      <path d="M390 330v58m140-58v58M386 352h148" strokeWidth="1.2" opacity=".7" />
      <circle cx="404" cy="388" r="12" fill={paper} strokeWidth="1.5" /><circle cx="516" cy="388" r="12" fill={paper} strokeWidth="1.5" />
      <path d="M392 318v-46h70v46M392 272l6-8h58l6 8" fill={paper} strokeWidth="1.2" />
      <path d="M398 280l58 30m-50-30 44 30" strokeWidth=".7" opacity=".3" />
      {[[404, 300], [418, 306], [432, 300], [446, 306], [410, 292], [426, 290], [440, 293]].map(([cx, cy]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="6" fill={paper} strokeWidth="1" />)}
      <path d="M476 318q-6-30 22-32q28 2 22 32Z" fill={paper} strokeWidth="1.4" />
      <path d="M480 300h36" strokeWidth=".8" opacity=".4" /><path d="M506 288l12-26" strokeWidth="1.8" />
    </g>
    <Person who="akka" facing={-1} x={744} y={400} mood="smile" wear={{ shoes: true }} />
    <Person who="tenant" facing={-1} x={684} y={400} mood="smile" wear={{ shoes: true }} />
    <Person {...me} part="body" />
    {/* the leaf bowl in my hand, and the puri going in */}
    <path d={`M${hands.far[0] - 12} ${hands.far[1] - 6}q12 10 24 0Z`} fill={paper} strokeWidth="1.2" />
    <circle cx={hands.near[0]} cy={hands.near[1] - 4} r="5.5" fill={paper} strokeWidth="1.1" />
    <Person {...me} part="arm" />
    <Floor y={402} from={360} to={840} />
  </>;
}

/** A cinema seat, side on, facing right. Its foot is the origin. */
function Seat({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-34 0v-46M-4 0v-30" strokeWidth="2" />
      <path d="M-50-44q-4-60 6-82q4-6 12-4q8 26 2 84Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-34-48h44q6 0 6 6v4H-36Z" fill="currentColor" stroke={paper} strokeWidth="1.2" />
      <path d="M-40-64h48v5h-48Z" fill={paper} strokeWidth="1" />
    </g>
  );
}

/** The hunched man from the movie, a shadow lurching forward on his stick. */
function Hunched({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="currentColor" stroke="none">
      <path d="M-18 0-14-30Q-32-50-27-73Q-22-94-3-91Q12-88 13-77L9-60Q13-48 7-40L13-18 19 0H10L4-20-4-33-8-19-10 0Z" />
      <circle cx="21" cy="-70" r="9" />
      <path d="M9-74Q22-62 25-42" stroke="currentColor" strokeWidth="6" fill="none" />
      <circle cx="26" cy="-40" r="4" />
      <path d="M26-40 37 0" stroke="currentColor" strokeWidth="2.2" fill="none" />
    </g>
  );
}

/**
 * The cinema, side on: the three of us in a row of seats, angled so we step
 * back into the dark, the beam over our heads, the screen ahead. After the
 * interval we are back in the same seats, me with the can and the popcorn.
 */
function Cinema({ snacks = false }: { snacks?: boolean }) {
  const me: PersonProps = { who: "me", pose: "seat", x: 590, y: 352, mood: snacks ? "calm" : "scared", tilt: snacks ? 4 : -6, near: snacks ? [24, -52] : [24, -8], far: snacks ? [30, -6] : "lap", seated: { thigh: 2, shin: 2 }, wear: { top: "hoodie", bottom: "plain", shoes: true } };
  const hands = handsOf(me);
  return <>
    {/* the hall in the dark */}
    <path d="M300 40H1000V412H300Z" fill="currentColor" stroke="none" opacity=".045" />
    {/* the screen and the beam that paints it */}
    <path className="movie-art__beam" d="M330 96 820 110V262Z" fill="currentColor" stroke="none" opacity=".06" />
    <path d="M820 96h150v180H820Z" fill={paper} strokeWidth="2" />
    <path d="M826 102h138v168H826Z" fill="currentColor" stroke="none" opacity=".07" />
    <g className="movie-art__monster"><Hunched x={880} y={262} scale={1.25} /></g>
    <Seat x={540} y={336} scale={.86} />
    <Person who="tenant" pose="seat" x={530} y={322} scale={.88} mood={snacks ? "smile" : "focus"} near={snacks ? [30, -40] : "lap"} far="lap" seated={{ thigh: 2, shin: 2 }} />
    {snacks && <Popcorn x={562} y={300} scale={.5} />}
    <Seat x={604} y={360} scale={.94} />
    <Person {...me} part="body" />
    {snacks && <Popcorn x={hands.far[0] + 6} y={hands.far[1] + 4} scale={.55} />}
    {snacks && <Can x={hands.near[0] + 2} y={hands.near[1] + 14} angle={-10} scale={.5} />}
    <Person {...me} part="arm" />
    <Seat x={668} y={388} />
    <Person who="akka" pose="seat" x={656} y={376} mood={snacks ? "smile" : "worried"} near="lap" far="lap" seated={{ thigh: 2, shin: 2 }} />
    <path d="M440 404h130m20 0h260" opacity=".13" strokeWidth=".8" />
  </>;
}

const SHELVES = [214, 254, 294, 334] as const;

/** The snack counter at the interval: the popcorn machine, a fridge of drinks, and me pointing at the can. */
function Counter() {
  const me: PersonProps = { who: "me", facing: -1, x: 652, y: 400, mood: "awe", tilt: -10, near: [48, -74], wear: { top: "hoodie", bottom: "plain", shoes: true } };
  return <>
    {/* the menu board over the counter */}
    <g opacity=".45" strokeWidth="1">
      <path d="M384 118h172v46H384Z" fill={paper} />
      <path d="M396 132h56m-56 10h40m-40 10h48M492 132h52m-52 10h36m-36 10h44" strokeWidth=".8" opacity=".6" />
    </g>
    <Person who="vendor" x={466} y={400} mood="smile" near={[44, -28]} wear={{ top: "shirt", bottom: "trousers" }} />
    {/* the popcorn machine: a glass cabinet, heaped, its kettle hanging inside */}
    <g>
      <path d="M394 272v-68h66v68" fill={paper} strokeWidth="1.3" />
      <path d="M389 204h76v-10h-76Z" fill="currentColor" stroke={paper} strokeWidth="1" />
      <path d="M397 272q-2-18 10-20q4-11 15-7q8-9 17 0q10-3 14 8q7 4 4 19Z" fill={paper} strokeWidth="1.1" />
      <path d="M410 258q3 2 6 0m10-8q2 2 5 1m8 9q3 1 5-1" strokeWidth=".8" opacity=".5" />
      <path d="M413 214h28v10q0 7-7 7h-14q-7 0-7-7Zm14-10v10" fill={paper} strokeWidth="1.1" />
      <path d="M400 212l10 14m38-14 8 12" strokeWidth=".8" opacity=".3" />
    </g>
    {/* the counter */}
    <path d="M376 272h190v128H376Z" fill={paper} strokeWidth="1.4" />
    <path d="M376 282h190M396 296v96m40-96v96m40-96v96m40-96v96" strokeWidth=".8" opacity=".35" />
    {/* the drinks fridge, and the one can I pointed at */}
    <g>
      <path d="M572 400V166h66v234Z" fill={paper} strokeWidth="1.4" />
      <path d="M578 174h54v190h-54Z" strokeWidth=".9" opacity=".6" />
      <path d={SHELVES.map((y) => `M578 ${y}h54`).join("")} strokeWidth=".8" opacity=".5" />
      <path d={SHELVES.flatMap((y, row) => [584, 594, 614, 624].map((x) => (row === 1 && x === 594 ? "" : `M${x} ${y}v-${row === 0 ? 20 : 14}h6v${row === 0 ? 20 : 14}`))).join("")} strokeWidth=".8" opacity=".5" />
      <path d="M635 250v40" strokeWidth="2.2" />
      <Can x={602} y={254} scale={.27} />
      <path className="movie-art__glint" d="M612 230l4-4m-1 9h5m-9-11v-5" strokeWidth="1" />
    </g>
    <Person who="tenant" facing={-1} x={792} y={400} mood="smile" wear={{ shoes: true }} />
    <Person who="akka" facing={-1} x={730} y={400} mood="talk" near={[30, -48]} wear={{ shoes: true }} />
    <Person {...me} />
    <Floor y={402} from={360} to={840} />
  </>;
}

/** McDonald's: my Happy Meal on the table, the burger in my hands, Akka across from me, Anna standing by. */
function Diner() {
  const me: PersonProps = { who: "me", pose: "seat", x: 520, y: 352, lean: 8, mood: "excited", near: [44, -50], far: [42, -46], seated: { thigh: 2, shin: 4 }, wear: { top: "hoodie", bottom: "plain", shoes: true } };
  const hands = handsOf(me);
  return <>
    {/* the stool, the table */}
    <path d="M500 352h44v6h-44Zm22 6v42m-14 0h28" fill={paper} strokeWidth="1.3" />
    <Person {...me} part="body" />
    <Burger x={(hands.near[0] + hands.far[0]) / 2 + 6} y={hands.near[1] + 10} scale={.36} angle={-8} />
    <Person {...me} part="arm" />
    <path d="M560 312h160v8H560Zm80 8v76m-26 4h52" fill={paper} strokeWidth="1.4" />
    {/* the Happy Meal box, open, its handles up; the turtle out of it; the cup */}
    <path d="M600 312v-30h36v30Zm0-30 6-12h24l6 12" fill={paper} strokeWidth="1.2" />
    <path d="M610 270q8-14 16 0" strokeWidth="1.6" />
    <path d="M604 296q14-6 28 0" strokeWidth="1" opacity=".5" />
    <Turtle x={662} y={312} scale={.42} />
    <Cup x={694} y={312} scale={.5} />
    <path d="M760 352h44v6h-44Zm22 6v42m-14 0h28" fill={paper} strokeWidth="1.3" />
    <Person who="akka" pose="seat" facing={-1} x={782} y={352} mood="smile" near={[40, -40]} far="lap" seated={{ thigh: 2, shin: 4 }} />
    <Person who="tenant" facing={-1} x={856} y={400} mood="smile" near={[30, -24]} wear={{ shoes: true }} />
    <Floor y={402} from={460} to={900} />
  </>;
}

/** The McDonald's clown's bench: me sitting beside him, his arm along the back behind me; Akka taking the picture. */
function Photo() {
  const akka: PersonProps = { who: "akka", facing: -1, x: 800, y: 400, mood: "smile", near: [44, -112], far: [40, -106], wear: { shoes: true } };
  const phone = handsOf(akka).near;
  return <>
    {/* the bench */}
    <path d="M500 346h170v8H500Zm8 8v46m154-46v46M500 336V286h170v50" fill={paper} strokeWidth="1.3" />
    <path d="M500 302h170m-170 17h170" strokeWidth=".8" opacity=".4" />
    <Person who="clown" pose="seat" x={548} y={346} mood="smile" near={[94, -56]} far="lap" seated={{ thigh: 2, shin: 6 }} />
    <Person who="me" pose="seat" x={630} y={346} mood="excited" tilt={-4} near="lap" far="lap" seated={{ thigh: 2, shin: 4 }} wear={{ top: "hoodie", bottom: "plain", shoes: true }} />
    <Person {...akka} part="body" />
    <rect x={phone[0] - 6} y={phone[1] - 13} width="12" height="22" rx="2" transform={`rotate(-8 ${phone[0]} ${phone[1]})`} fill="currentColor" stroke={paper} strokeWidth="1" />
    <Person {...akka} part="arm" />
    {/* the flash */}
    <path className="movie-art__flash" d={`M${phone[0] - 12} ${phone[1] - 14}l-12-6m10-6-8-12m-6 22h-14`} strokeWidth="1.6" />
    <Person who="tenant" facing={-1} x={880} y={400} mood="smile" wear={{ shoes: true }} />
    <Floor y={402} from={460} to={920} />
  </>;
}

/** The ride: setting off at dusk, and coming home at night with the cup of Coke. */
function Ride({ home = false }: { home?: boolean }) {
  return <>
    {/* street lamps going by */}
    <g className="movie-art__lamps" opacity=".28" strokeWidth="1.2">
      {[300, 900].map((lx) => (
        <g key={lx}><path d={`M${lx} 400V170q0-10 10-10h30`} /><path d={`M${lx + 34} 156q8-6 16 0l-2 5h-12Z`} fill="currentColor" fillOpacity=".3" /></g>
      ))}
    </g>
    {home && <circle cx="860" cy="96" r="16" fill="currentColor" stroke="none" opacity=".5" />}
    <AvengerRide x={600} y={400} home={home} />
    <g className="movie-art__road" opacity=".13" strokeWidth=".8">
      <path d="M300 404h85m14 0h93m15 0h189m20 0h76m-448 9h44m351 0h41" />
    </g>
  </>;
}

/**
 * At the end, the three of us as we were, the turtle in my hand. In the last
 * shot they fade, and the turtle steps out of my hand into the cover, laid
 * at hand size just beside me, where the clapperboard and the burger join it.
 */
const ME_LAST: PersonProps = { who: "me", facing: -1, x: 700, y: 400, mood: "smile", tilt: 14, near: [30, -50] };
const HELD = handsOf(ME_LAST).near;
type Pose = { x: number; y: number; angle: number; scale: number };
const posed = ({ x, y, angle, scale }: Pose) => `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${scale.toFixed(4)})`;
const COVER_AT = { x: 632, y: 288, scale: 0.42 };
const onCover = ({ x, y, angle, scale }: Pose): Pose => ({ x: COVER_AT.x + (x - 600) * COVER_AT.scale, y: COVER_AT.y + (y - 300) * COVER_AT.scale, angle, scale: scale * COVER_AT.scale });
const TURTLE_FROM: Pose = { x: HELD[0] + 2, y: HELD[1] + 12, angle: 0, scale: 0.45 };
const TURTLE_TO = onCover(STILL.turtle);
const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};

const turtles = new WeakMap<ParentNode, SVGGElement | null>();
/** Moves the turtle for the last shot's progress. Called every frame it is on screen. */
export function settleTurtle(root: ParentNode, progress: number) {
  let el = turtles.get(root);
  if (el === undefined) {
    el = root.querySelector<SVGGElement>("[data-finale-turtle]");
    turtles.set(root, el);
  }
  if (!el) return;
  const t = ease((progress - 0.44) / 0.22);
  const mix = (a: number, b: number) => a + (b - a) * t;
  const value = posed({ x: mix(TURTLE_FROM.x, TURTLE_TO.x), y: mix(TURTLE_FROM.y, TURTLE_TO.y) - 8 * Math.sin(Math.PI * t), angle: 0, scale: mix(TURTLE_FROM.scale, TURTLE_TO.scale) });
  if (el.getAttribute("transform") !== value) el.setAttribute("transform", value);
}

function Goodbye({ finale = false }: { finale?: boolean }) {
  return <>
    <g className="movie-art__people">
      <Person who="tenant" x={520} y={400} mood="smile" near={[69, -61]} />
      <Person who="akka" x={590} y={400} mood="smile" />
      <Person {...ME_LAST} part="body" />
      <Floor y={402} />
    </g>
    {finale && (
      <>
        <g className="movie-art__arrive movie-art__arrive--clapboard"><Clapboard {...onCover(STILL.clapboard)} /></g>
        <g className="movie-art__arrive movie-art__arrive--burger"><Burger {...onCover(STILL.burger)} /></g>
      </>
    )}
    <g data-finale-turtle transform={posed(TURTLE_FROM)}><Turtle /></g>
    <g className="movie-art__people"><Person {...ME_LAST} part="arm" /></g>
  </>;
}

/** That night: Amma asleep, me holding on to her, and the man from the movie coming for our house. */
function Nightmare() {
  return <>
    {/* the window, and the moon in it */}
    <g opacity=".35" strokeWidth="1"><path d="M370 140h90v110h-90Zm45 0v110m-45-55h90" /></g>
    <circle cx="434" cy="166" r="9" fill="currentColor" stroke="none" opacity=".4" />
    {/* the bad dream */}
    <g className="movie-art__dream">
      {[[630, 268, 4], [646, 252, 6], [662, 234, 8]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} fill={paper} strokeWidth="1.2" />)}
      <path d="M640 210q-30 0-30-26t30-26q4-30 40-28q18-22 50-8q32-8 40 20q30 4 28 30q0 26-30 28q-8 22-40 18q-22 14-50 2q-32 8-38-10Z" fill={paper} strokeWidth="1.4" />
      <path d="M760 214v-36l16-14 16 14v36Zm10 0v-14h12v14" fill={paper} strokeWidth="1.2" />
      <Hunched x={700} y={214} scale={.62} />
    </g>
    {/* the bed: a mattress on a cot, two pillows, one blanket over us both */}
    <path d="M420 400v-64m400 64v-64M410 336h420v10H410Z" fill={paper} strokeWidth="1.4" />
    <path d="M440 336q-8-24 14-26h48q16 2 10 26Z" fill={paper} strokeWidth="1.2" />
    <g transform={`${place([500, 306], -96, .62)}`}><Head role="amma" mood="asleep" /></g>
    <g transform={`${place([548, 300], 8, .52)} scale(-1 1)`}><Head role="narrator" mood="scared" /></g>
    <path d="M470 336q4-30 46-28q20-14 44 0q20-12 70-6q120 0 170 34Z" fill={paper} strokeWidth="1.6" />
    <path d="M520 312q20 6 34 4q30-6 70 2" strokeWidth=".9" opacity=".4" />
    {/* my arm over her, holding on */}
    <path d={capsule([560, 314], [512, 318], 9, 7.5)} fill={paper} strokeWidth="1.3" />
    <circle cx="509" cy="318" r="4.6" fill={paper} strokeWidth="1.3" />
  </>;
}

export function FirstMovieArt({ scene, className = "", viewBox = "0 0 1200 440" }: { scene: string; className?: string; viewBox?: string }) {
  let art;
  if (scene === "cover") art = <StillLife />;
  else if (["after", "money", "life", "finale"].includes(scene)) art = <Goodbye finale={scene === "finale"} />;
  else if (scene === "couple") art = <Couple />;
  else if (scene === "games") art = <BoardGames />;
  else if (scene === "english" || scene === "homework") art = <Lesson rushing={scene === "homework"} />;
  else if (scene === "phone") art = <Phoning />;
  else if (scene === "ticket") art = <Tickets />;
  else if (scene === "asking") art = <Asking />;
  else if (scene === "ready") art = <Ready />;
  else if (scene === "avenger" || scene === "home") art = <Ride home={scene === "home"} />;
  else if (scene === "panipuri") art = <PaniPuri />;
  else if (scene === "theatre" || scene === "drink") art = <Cinema snacks={scene === "drink"} />;
  else if (scene === "counter") art = <Counter />;
  else if (scene === "burger") art = <Diner />;
  else if (scene === "photo") art = <Photo />;
  else if (scene === "night") art = <Nightmare />;
  else return null;
  return <svg className={`memory-art movie-art movie-art--${scene} ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{art}</svg>;
}
