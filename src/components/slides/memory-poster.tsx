import { MemoryBicycle } from "./memory-bicycle";
import { COVER_FAN, Handheld, Pouch } from "./memory-props";

/**
 * The memory's poster, on a 1200×630 canvas: the share image and the card
 * banner. The console and the ice tubes stand in front, as on the cover.
 * Behind them, faint as a memory, is the street that night: the tiled roofs
 * and palms of Nagercoil, the temple tower, a lamp, and the two of us riding
 * home under it with the ice tubes, away from the console.
 *
 * Plain drawing only (no stylesheet, no hooks), so it renders on the page
 * and inside the share-image renderer alike. Ink is currentColor; paper is
 * the page background.
 */
export const POSTER = { width: 1200, height: 630 } as const;
const paper = "var(--background)";
const GROUND = 548;

const STARS = [
  [690, 60, 1.6], [742, 112, 1.1], [806, 48, 1.3], [868, 132, 1], [930, 70, 1.8], [1004, 150, 1.1], [1150, 60, 1.4],
  [1176, 168, 1], [640, 150, 1], [560, 70, 1.2], [470, 124, 1], [380, 54, 1.4], [292, 98, 1], [180, 64, 1.2], [96, 120, 1],
] as const;

function Backdrop() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <g opacity=".5">
        {STARS.map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="currentColor" stroke="none" />)}
        {/* a thin moon over the palms */}
        <path d="M622 70a22 22 0 1 0 20 30a17 17 0 1 1-20-30Z" fill="currentColor" stroke="none" opacity=".6" />
      </g>
      <g opacity=".22" strokeWidth="1.3">
        {/* the far hills, and the temple tower over the rooftops */}
        <path d="M0 492C90 470 170 476 250 486S420 470 520 478 700 488 800 470 1000 462 1200 482" opacity=".7" />
        <path d="M840 520l8-34h96l8 34M854 486l7-28h70l7 28M867 458l6-24h46l6 24M879 434l5-20h24l5 20M886 414q10-15 20 0M896 399v-9" />
        <path d="M852 504h88m-80-30h72m-62-26h52" strokeDasharray="3 5" opacity=".6" />
        {/* an old tiled-roof house with its thinnai, and a kolam at the step */}
        <path d="M60 548V452h220v96M32 454l60-62h156l60 62ZM52 432h208m-188-22h168" />
        <path d="M74 548v-34h196v34M74 514h196M88 514v-62m168 62v-62" strokeWidth="2.4" />
        <path d="M156 514v-46h36v46m-14-46v46M104 470h28v28h-28Z" opacity=".7" />
        <g transform="translate(176 566) scale(1 .32)" opacity=".8">
          <path d="M-44 0C-44-28-15-28 0-13C15-28 44-28 44 0C44 28 15 28 0 13C-15 28-44 28-44 0Z" />
          {[-28, -14, 0, 14, 28].map((dx) => <circle key={dx} cx={dx} cy="0" r="2.4" fill="currentColor" stroke="none" />)}
        </g>
        {/* a flat-roofed house with its water tank */}
        <path d="M300 548V440h168v108M292 440h184v-14H292ZM420 426v-34h40v34" />
        <path d="M318 470h40v44h-40Zm20 0v44M396 548v-70h46v70" opacity=".7" />
        {/* a coconut palm */}
        <path d="M512 548Q522 440 506 330M520 548Q530 438 514 330" />
        <path d="M510 332Q470 296 432 318M510 332Q492 300 462 286M511 333Q514 292 540 276M512 332Q556 300 590 318M512 333Q560 330 580 362M509 334Q474 336 452 372" />
        {/* the street lamp, its light falling softly on the road */}
        <path d="M676 548V318q0-12-12-12h-44" strokeWidth="2.2" />
        <path d="M670 548h12M673 470h6M673 400h6" />
        <path d="M600 300q16-10 32 0l-3 6h-26Z" fill="currentColor" fillOpacity=".25" />
        <path d="M604 306h24" strokeWidth="3" opacity=".9" />
      </g>
      <path d="M606 308L494 548H738L626 308Z" fill="url(#poster-lamp)" stroke="none" />
      <ellipse cx="616" cy="550" rx="150" ry="14" fill="url(#poster-pool)" stroke="none" />
      <g opacity=".22" strokeWidth="1.3">
        {/* the road */}
        <path d={`M0 ${GROUND}H1200M0 ${GROUND + 9}H1200`} />
        <path d={`M40 ${GROUND + 30}h90m30 0h160m40 0h120m50 0h210m40 0h140m30 0h90`} strokeDasharray="1 0" opacity=".6" />
      </g>
    </g>
  );
}

/** The two of us, small, riding home under the lamp with the ice tubes. */
function RideHome() {
  // The bicycle is drawn on the story's 1200×440 art; seat its wheels on the poster's road.
  const scale = 0.42;
  return (
    <g opacity=".62" transform={`translate(${604 - 580 * scale} ${GROUND - 410 * scale}) scale(${scale})`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <MemoryBicycle pace="ride" />
    </g>
  );
}

/** The cover's console and ice tubes, in front. */
function Cover({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="610" cy="362" rx="300" ry="22" fill="url(#poster-shade)" stroke="none" />
      <g strokeWidth="1.15">
        {COVER_FAN.map(([px, angle, size]) => <Pouch key={px} x={px} y={296} angle={angle} scale={size} />)}
      </g>
      <Handheld />
    </g>
  );
}

export function PosterArt() {
  return (
    <g>
      <defs>
        <linearGradient id="poster-lamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".12" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".015" />
        </linearGradient>
        <radialGradient id="poster-pool">
          <stop offset="0" stopColor="currentColor" stopOpacity=".1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="poster-shade">
          <stop offset="0" stopColor="currentColor" stopOpacity=".07" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={POSTER.width} height={POSTER.height} fill={paper} />
      <Backdrop />
      <RideHome />
      {/* the console and the ice tubes stand in front of the night, a little apart from it */}
      <Cover x={704 - 322 * 0.82} y={108 - 64 * 0.82} scale={0.82} />
    </g>
  );
}
