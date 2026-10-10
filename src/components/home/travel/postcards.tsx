"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { isLowEndDevice } from "./use-atlas";
import "./postcards.css";

/**
 * Living postcards: one tiny animated scene per place, drawn in the same
 * line language as the inline glyphs. CSS-only motion (transform/opacity),
 * mounted only while a place is open.
 *
 * Scenes use a 160x96 canvas; the horizon sits around y=62.
 */

/* ───────────────────────── primitives ───────────────────────── */

const W = 160;

function wavePath(y: number, amp = 2.4) {
  let d = `M-16 ${y}`;
  for (let i = 0; i < 13; i++) d += ` q4 ${-amp} 8 0 q4 ${amp} 8 0`;
  return d;
}

function Waves({ y, dur = 3, o = 1, accent = false, amp }: { y: number; dur?: number; o?: number; accent?: boolean; amp?: number }) {
  return (
    <path
      className={`pc-line pc-wave${accent ? " pc-accent" : ""}${o < 1 ? " pc-extra" : ""}`}
      d={wavePath(y, amp)}
      style={{ animationDuration: `${dur}s`, opacity: o }}
    />
  );
}

/** Static placement wrapper; CSS animation goes on the child. */
function At({ x, y, s = 1, children }: { x: number; y: number; s?: number; children: ReactNode }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>;
}

function Sun({ cx, cy, r, clip }: { cx: number; cy: number; r: number; clip?: string }) {
  return (
    <g clipPath={clip ? `url(#${clip})` : undefined}>
      <g className="pc-rise">
        <circle className="pc-glow" cx={cx} cy={cy} r={r + 6} />
        <circle className="pc-line pc-warm" cx={cx} cy={cy} r={r} />
      </g>
    </g>
  );
}

function Birds({ x, y, delay = 0, dur = 16 }: { x: number; y: number; delay?: number; dur?: number }) {
  return (
    <At x={x} y={y}>
      <g className="pc-fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <path className="pc-line pc-flap" d="M0 0q2-2 4 0q2-2 4 0" />
        <path className="pc-line pc-flap" d="M10 5q1.6-1.6 3.2 0q1.6-1.6 3.2 0" style={{ animationDelay: "0.2s" }} />
      </g>
    </At>
  );
}

function Palm({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <path className="pc-line" d="M0 0c-1-8 0-16 3-24" />
      <g className="pc-sway" style={{ animationDelay: `${delay}s` }}>
        <circle cx="3" cy="-24" r="13" fill="none" stroke="none" />
        <path className="pc-line" d="M3-24c-4-4-10-5-14-2" />
        <path className="pc-line" d="M3-24c1-5 5-8 10-9" />
        <path className="pc-line" d="M3-24c5-2 10 0 13 4" />
        <path className="pc-line" d="M3-24c-2-5-2-9 1-12" />
        <path className="pc-line" d="M3-24c-4 1-7 4-8 8" />
      </g>
    </At>
  );
}

function Hills({ back, front }: { back?: string; front?: string }) {
  return (
    <>
      {back && <path className="pc-line pc-dim" d={back} />}
      {front && <path className="pc-line" d={front} />}
    </>
  );
}

function Stars({ pts }: { pts: [number, number][] }) {
  return (
    <>
      {pts.map(([x, y], i) => (
        <circle key={i} className="pc-star" cx={x} cy={y} r="0.8" style={{ animationDelay: `${i * 0.37}s` }} />
      ))}
    </>
  );
}

/* ───────────────────────── scenes ───────────────────────── */

type SceneProps = { uid: string };

function SkyClip({ uid, y = 62 }: { uid: string; y?: number }) {
  return (
    <defs>
      <clipPath id={`${uid}-sky`}>
        <rect x="0" y="0" width={W} height={y} />
      </clipPath>
    </defs>
  );
}

/** Chennai: sunrise over the Marina, a catamaran bobbing, birds crossing. */
function Chennai({ uid }: SceneProps) {
  return (
    <>
      <SkyClip uid={uid} />
      <Sun cx={80} cy={58} r={11} clip={`${uid}-sky`} />
      <path className="pc-line pc-dim" d="M0 62H160" />
      <Waves y={70} dur={3.4} />
      <Waves y={78} dur={2.6} o={0.7} accent />
      <Waves y={86} dur={2} o={0.45} />
      <At x={118} y={66}>
        <g className="pc-bob">
          <path className="pc-line" d="M-10 0h20l-3 4h-14z" />
          <path className="pc-line" d="M0 0v-13" />
          <path className="pc-line pc-accent pc-fill-soft" d="M0-13l8 11h-8z" />
        </g>
      </At>
      <Birds x={14} y={22} />
      <Birds x={-20} y={34} delay={-7} dur={20} />
    </>
  );
}

/** Nagercoil / Kanyakumari: land's end, three seas, the memorial rock, palms. */
function Nagercoil({ uid }: SceneProps) {
  return (
    <>
      <SkyClip uid={uid} />
      <Sun cx={70} cy={60} r={13} clip={`${uid}-sky`} />
      <path className="pc-line pc-dim" d="M0 62H160" />
      <Waves y={70} dur={3.6} accent />
      <Waves y={78} dur={2.8} />
      <Waves y={86} dur={2.2} o={0.5} />
      <path className="pc-line" d="M8 64q6-10 16-9q7 1 9 9" />
      <path className="pc-line" d="M14 56.5h11M15.5 56.5v-5M23.5 56.5v-5M19.5 56.5v-5M14.5 51.5h10M16 51.5q3.5-6 7 0M19.5 45.5v-1.5" />
      <Palm x={132} y={64} />
      <Palm x={148} y={66} s={0.75} delay={-0.7} />
    </>
  );
}

/** Bangalore: bumper to bumper, a signal that is mostly red, the odd honk. */
function Bangalore() {
  const car = (x: number, i: number) => (
    <At key={x} x={x} y={80}>
      <g className="pc-idle" style={{ animationDelay: `${i * 0.13}s` }}>
        <path className="pc-line" d="M0 0h24v-5q0-2-2-2h-3l-3-5h-9l-3 5h-2q-2 0-2 2z" />
        <circle className="pc-line" cx="6" cy="0.5" r="2.2" />
        <circle className="pc-line" cx="18" cy="0.5" r="2.2" />
        <circle className="pc-brake" cx="1.3" cy="-4" r="0.9" />
      </g>
    </At>
  );
  return (
    <>
      <path className="pc-line pc-dim" d="M0 86H160M0 66H160" />
      <path className="pc-line pc-dim pc-dash" d="M0 76H160" />
      <g className="pc-inch">{[6, 36, 66, 96].map(car)}</g>
      <g className="pc-honk">
        <path className="pc-line pc-accent" d="M52 58q2-2 0-4M56 59q3-3.5 0-7" />
      </g>
      <g transform="translate(-12 6)">
        <path className="pc-line" d="M144 80V40" />
        <rect className="pc-line" x="138.5" y="20" width="11" height="22" rx="3.5" />
        <circle className="pc-lamp pc-lamp--r" cx="144" cy="25.5" r="2" />
        <circle className="pc-lamp pc-lamp--a" cx="144" cy="31" r="2" />
        <circle className="pc-lamp pc-lamp--g" cx="144" cy="36.5" r="2" />
      </g>
    </>
  );
}

/** Mysore: the palace lighting up, bulb by bulb. */
function Mysore() {
  const bulbs: [number, number][] = [];
  for (let x = 50; x <= 110; x += 4) bulbs.push([x, 48]);
  for (let a = 0; a <= 8; a++) {
    const t = a / 8;
    bulbs.push([70 + 20 * t, 42 - Math.sin(Math.PI * t) * 12]);
  }
  for (let y = 46; y <= 66; y += 5) bulbs.push([44, y], [116, y]);
  return (
    <>
      <Stars pts={[[18, 14], [34, 26], [130, 12], [148, 30], [12, 40]]} />
      <path className="pc-line" d="M48 70V48h64v22" />
      <path className="pc-line" d="M70 48v-6q10-16 20 0v6" />
      <path className="pc-line" d="M80 26v-4" />
      <path className="pc-line" d="M40 70V44h8v26M112 70V44h8v26" />
      <path className="pc-line" d="M40 44q4-8 8 0M112 44q4-8 8 0" />
      <path className="pc-line pc-dim" d="M60 70v-10h8v10M92 70v-10h8v10M76 70v-12h8v12" />
      <path className="pc-line pc-dim" d="M20 70H140" />
      {bulbs.map(([x, y], i) => (
        <circle key={i} className="pc-bulb" cx={x} cy={y} r="0.95" style={{ animationDelay: `${i * 0.045}s` }} />
      ))}
    </>
  );
}

/** Mangalore: a fishing boat riding the swell, a fish leaping. */
function Mangalore({ uid }: SceneProps) {
  return (
    <>
      <SkyClip uid={uid} />
      <Sun cx={132} cy={30} r={8} />
      <Waves y={64} dur={3.2} o={0.6} />
      <Waves y={72} dur={2.6} accent />
      <Waves y={82} dur={2} o={0.5} />
      <At x={58} y={68}>
        <g className="pc-bob" style={{ animationDuration: "2.6s" }}>
          <path className="pc-line" d="M-18 0q18 7 36 0l-4-5h-28z" />
          <path className="pc-line" d="M-6-5v-10h12v10" />
          <path className="pc-line" d="M0-15v-6" />
        </g>
      </At>
      <At x={96} y={72}>
        <g className="pc-leap">
          <path className="pc-line pc-accent" d="M-4 0q4-3 8 0q-4 3-8 0zM4 0l2.5-2v4z" />
        </g>
      </At>
    </>
  );
}

/** Surathkal: the lighthouse on the rocks sweeping its beam. */
function Surathkal() {
  return (
    <>
      <Stars pts={[[14, 12], [30, 30], [56, 10], [150, 14]]} />
      <path className="pc-beam pc-beam--l" d="M116 27L40 16V38Z" />
      <path className="pc-beam pc-beam--r" d="M116 27L160 18V36Z" />
      <path className="pc-line" d="M110 62l3-31h6l3 31" />
      <path className="pc-line pc-dim" d="M111.5 52h9M112.5 42h7" />
      <rect className="pc-line" x="112" y="24" width="8" height="7" rx="1" />
      <path className="pc-line" d="M111 24l5-5 5 5" />
      <circle className="pc-lamp-on" cx="116" cy="27.5" r="1.6" />
      <path className="pc-line" d="M92 66q10-9 24-6q12 2 18 6" />
      <Waves y={70} dur={3} accent />
      <Waves y={79} dur={2.4} o={0.65} />
      <Waves y={88} dur={1.9} o={0.4} />
    </>
  );
}

/** Coimbatore: foothills of the Nilgiris and windmills turning. */
function Coimbatore() {
  const mill = (x: number, y: number, h: number, dur: number, s = 1) => (
    <At key={x} x={x} y={y} s={s}>
      <path className="pc-line" d={`M0 0V${h}`} />
      <g className="pc-spin" style={{ animationDuration: `${dur}s` }}>
        <circle cx="0" cy="0" r="11" fill="none" stroke="none" />
        <path className="pc-line" d="M0 0V-10M0 0L8.7 5M0 0L-8.7 5" />
      </g>
      <circle className="pc-fill-accent" cx="0" cy="0" r="1.2" />
    </At>
  );
  return (
    <>
      <Hills
        back="M0 58q30-26 62-10q26-18 58-2q20-8 40 2"
        front="M0 72q40-16 80-4q40-12 80 2"
      />
      {mill(38, 40, 30, 3.2)}
      {mill(84, 30, 36, 4.4)}
      {mill(126, 44, 26, 2.6, 0.85)}
    </>
  );
}

/** Salem: the Shevaroys behind, a mango tree, one mango giving in to gravity. */
function Salem() {
  return (
    <>
      <Sun cx={30} cy={26} r={8} />
      <Hills back="M0 60q30-20 60-6q30-16 64 0q20-8 36 0" />
      <path className="pc-line pc-dim" d="M0 74H160" />
      <path className="pc-line" d="M112 74V54" />
      <path className="pc-line" d="M96 54q-7-14 8-18q6-10 18-4q13 0 10 12q5 10-8 12h-22q-8 0-6-2z" />
      <ellipse className="pc-mango" cx="104" cy="48" rx="2.2" ry="2.8" />
      <ellipse className="pc-mango" cx="121" cy="44" rx="2.2" ry="2.8" />
      <ellipse className="pc-mango" cx="118" cy="53" rx="2.2" ry="2.8" />
      <At x={108} y={55}>
        <g className="pc-drop">
          <ellipse className="pc-mango" cx="0" cy="0" rx="2.2" ry="2.8" />
        </g>
      </At>
    </>
  );
}

/** Dindigul: dum biryani, lid jiggling, steam curling up. */
function Dindigul() {
  return (
    <>
      {[66, 78, 90].map((x, i) => (
        <path
          key={x}
          className="pc-line pc-dim pc-steam"
          d={`M${x} 40q-3-5 0-10q3-5 0-10`}
          style={{ animationDelay: `${i * 0.6}s` }}
        />
      ))}
      <path className="pc-line" d="M58 76q-6-18 10-24h24q16 6 10 24z" />
      <path className="pc-line pc-warm pc-dash-fine" d="M64 51h32" />
      <g className="pc-lid">
        <path className="pc-line" d="M62 50q18-11 36 0" />
        <path className="pc-line" d="M78 43.5v-2.5h4v2.5" />
      </g>
      <path className="pc-line pc-dim" d="M48 80h64" />
      {[70, 80, 90].map((x, i) => (
        <path
          key={x}
          className="pc-flame"
          d={`M${x} 86q-2.5-3 0-6q2.5 3 0 6z`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </>
  );
}

/** Kodaikanal: pine slopes, the lake, fog drifting through. */
function Kodaikanal() {
  const pine = (x: number, y: number, s = 1) => (
    <At key={`${x}-${y}`} x={x} y={y} s={s}>
      <path className="pc-line" d="M0 0l-5 0 5-7-4 0 4-6-3 0 3-5 3 5-3 0 4 6-4 0 5 7z" />
    </At>
  );
  return (
    <>
      <Hills back="M0 50q24-22 54-8q30-20 60-4q22-10 46 2" front="M0 66q34-18 70-6q40-14 90 4" />
      {pine(24, 64)}
      {pine(34, 62, 0.8)}
      {pine(126, 64)}
      {pine(138, 66, 0.85)}
      <path className="pc-line pc-accent" d="M54 80q26 7 52 0q-26-7-52 0z" />
      <path className="pc-fog" d="M-30 41q20-4 40 0t40 0t40 0" style={{ animationDuration: "9s" }} />
      <path className="pc-fog" d="M60 55q20-4 40 0t40 0t40 0" style={{ animationDuration: "12s", animationDelay: "-4s" }} />
      <path className="pc-fog pc-fog--thin pc-extra" d="M-10 31q20-3 40 0t40 0t40 0" style={{ animationDuration: "15s", animationDelay: "-8s" }} />
    </>
  );
}

/** Tirunelveli: a block of halwa, glossy and wobbling, temple tower behind. */
function Tirunelveli() {
  return (
    <>
      <g className="pc-dim">
        <path className="pc-line" d="M120 62V44h24v18M123 44V36h18v8M126 36v-7h12v7M129 29v-6h6v6M132 23v-4" />
      </g>
      <path className="pc-line pc-accent" d="M22 78q56-18 116 0q-56 12-116 0z" />
      <path className="pc-line pc-accent pc-dim" d="M28 78h104" />
      <g className="pc-wobble">
        <path className="pc-line pc-halwa" d="M56 74v-16q0-4 4-4h40q4 0 4 4v16z" />
        <path className="pc-line pc-halwa pc-dim" d="M72 55v18M88 55v18" />
        <path className="pc-line pc-glaze" d="M60 57.5q20-2.5 40 0" />
        <path className="pc-line pc-shine" d="M66 58l-5 10" />
      </g>
      <path className="pc-sparkle" d="M110 50l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      <path className="pc-sparkle" d="M52 52l.8 1.6 1.6.8-1.6.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8z" style={{ animationDelay: "0.9s" }} />
    </>
  );
}

/** Trivandrum: backwaters, coconut palms, a houseboat gliding. */
function Trivandrum() {
  return (
    <>
      <Palm x={22} y={60} />
      <Palm x={36} y={62} s={0.8} delay={-0.6} />
      <Palm x={146} y={60} s={0.9} delay={-1.1} />
      <path className="pc-line pc-dim" d="M0 62H160" />
      <Waves y={72} dur={6} o={0.5} amp={1.2} />
      <Waves y={82} dur={8} o={0.35} amp={1} />
      <At x={84} y={68}>
        <g className="pc-glide">
          <path className="pc-line" d="M-26 0q26 9 52 0" />
          <path className="pc-line pc-accent" d="M-18 0q0-11 18-11q18 0 18 11" />
          <path className="pc-line pc-dim" d="M-9 0v-8M0 0v-11M9 0v-8" />
          <path className="pc-line pc-dim" d="M-12 6h6M2 7h8" />
        </g>
      </At>
    </>
  );
}

/** Pondicherry: the promenade, a bicycle rolling along the Bay. */
function Pondicherry({ uid }: SceneProps) {
  const wheel = (x: number) => (
    <g key={x}>
      <circle className="pc-line" cx={x} cy="0" r="7" />
      <g className="pc-spin" style={{ animationDuration: "1.2s" }}>
        <circle cx={x} cy="0" r="7" fill="none" stroke="none" />
        <path className="pc-line pc-dim" d={`M${x - 7} 0h14M${x} -7v14`} />
      </g>
    </g>
  );
  return (
    <>
      <SkyClip uid={uid} y={44} />
      <Sun cx={120} cy={42} r={9} clip={`${uid}-sky`} />
      <path className="pc-line pc-dim" d="M0 44H160" />
      <Waves y={51} dur={3.4} o={0.6} accent />
      <Waves y={58} dur={2.6} o={0.4} />
      <path className="pc-line" d="M0 66H160" />
      {Array.from({ length: 17 }, (_, i) => (
        <path key={i} className="pc-line pc-dim" d={`M${i * 10 + 2} 66v6`} />
      ))}
      <path className="pc-line pc-dim" d="M0 72H160" />
      <path className="pc-line pc-dim pc-dash pc-roll" d="M-16 88H176" />
      <At x={78} y={84}>
        <g className="pc-bob" style={{ animationDuration: "0.6s" }}>
          {wheel(-12)}
          {wheel(12)}
          <path className="pc-line pc-accent" d="M-12 0l8-12h12l4 12M-4-12l4 12h-12M8-12l-2-4h5M-6-12l-1-3h-3" />
        </g>
      </At>
    </>
  );
}

/** Mumbai: a local train rattling over the bridge, towers beyond. */
function Mumbai() {
  const coach = (x: number) => (
    <g key={x}>
      <rect className="pc-line" x={x} y="-10" width="30" height="9" rx="2" />
      <circle className="pc-line" cx={x + 6} cy="0.5" r="1.3" />
      <circle className="pc-line" cx={x + 24} cy="0.5" r="1.3" />
      {[4, 11, 18, 25].map((w) => (
        <rect key={w} className="pc-line pc-dim" x={x + w - 1.5} y="-7.5" width="3" height="3" rx="0.6" />
      ))}
    </g>
  );
  return (
    <>
      <path
        className="pc-line pc-dim"
        d="M6 60V40h8v20M18 60V30h10v30M32 60V44h7v16M118 60V34h9v26M130 60V26h8v34M142 60V42h10v18"
      />
      <path className="pc-line" d="M0 64H160" />
      {[20, 60, 100, 140].map((x) => (
        <path key={x} className="pc-line pc-dim" d={`M${x - 14} 74q14-12 28 0`} />
      ))}
      <At x={0} y={62}>
        <g className="pc-train">
          {coach(0)}
          {coach(32)}
          {coach(64)}
        </g>
      </At>
      <Waves y={82} dur={3} accent o={0.8} />
      <Waves y={90} dur={2.2} o={0.45} />
    </>
  );
}

/** Delhi: kites over the old city rooftops. */
function Delhi() {
  const kite = (x: number, y: number, s: number, delay: number, dim = false) => (
    <At key={x} x={x} y={y} s={s}>
      <g className={`pc-kite${dim ? " pc-dim" : ""}`} style={{ animationDelay: `${delay}s` }}>
        <circle cx="0" cy="0" r="10" fill="none" stroke="none" />
        <path className="pc-line pc-accent pc-fill-soft" d="M0-8l6 8-6 8-6-8z" />
        <path className="pc-line pc-accent" d="M0-8v16M-6 0h12" />
        <path className="pc-line pc-tail" d="M0 8q-2 3 0 5q2 3 0 5" />
      </g>
    </At>
  );
  return (
    <>
      <path className="pc-line pc-dim" d="M38 66q14-26 30-42" />
      {kite(70, 22, 1, 0)}
      {kite(122, 30, 0.6, -1.3, true)}
      <path className="pc-line" d="M14 76V60h22v16M18 60q7-12 14 0M25 49v-3" />
      <path className="pc-line" d="M10 76V54M40 76V54M8 54h4M38 54h4" />
      <path className="pc-line pc-dim" d="M48 76V64h16v12M68 76V60h12v16M84 76V66h18v10M106 76V62h14v14M124 76V58h20v18" />
      <path className="pc-line" d="M0 76H160" />
    </>
  );
}

const scenes: Record<string, (p: SceneProps) => ReactNode> = {
  chennai: Chennai,
  nagercoil: Nagercoil,
  bangalore: Bangalore,
  mysore: Mysore,
  mangalore: Mangalore,
  surathkal: Surathkal,
  coimbatore: Coimbatore,
  salem: Salem,
  dindigul: Dindigul,
  kodaikanal: Kodaikanal,
  tirunelveli: Tirunelveli,
  trivandrum: Trivandrum,
  pondicherry: Pondicherry,
  mumbai: Mumbai,
  delhi: Delhi,
};

export function hasPostcard(id: string) {
  return id in scenes;
}

/**
 * Just the scene (no card, no motion wrapper): for static compositions such
 * as the /travels Open Graph image.
 */
export function PostcardArt({ id, className = "" }: { id: string; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const Scene = scenes[id];
  if (!Scene) return null;
  return (
    <div className={`pc ${className}`}>
      <svg viewBox="0 0 160 96" role="img" aria-label={`Postcard from ${id}`}>
        <Scene uid={uid} />
      </svg>
    </div>
  );
}

/* ───────────────────────── frame ───────────────────────── */

/**
 * The card: drops in like a postcard and tilts toward the pointer.
 * Low-end devices get a lite cut (signature motion only); loops pause off-screen.
 */
export function Postcard({ id, name }: { id: string; name: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const card = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [lite] = useState(isLowEndDevice);
  const [onScreen, setOnScreen] = useState(true);

  // freeze every loop while the card is scrolled away
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Scene = scenes[id];
  if (!Scene) return null;

  const tilt = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.current.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    card.current.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
  };
  const reset = () => {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14, rotate: -4, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.8 }}
      className="mb-6 w-[220px] [perspective:700px] min-[900px]:w-[264px]"
    >
      <div
        ref={card}
        onPointerMove={tilt}
        onPointerLeave={reset}
        className="pc-card tactile relative rounded-xl p-1.5"
        style={{ "--rx": "0deg", "--ry": "0deg" } as CSSProperties}
      >
        <div
          className={`pc relative aspect-[5/3] overflow-hidden rounded-lg bg-background${lite ? " pc--lite" : ""}${onScreen ? "" : " pc--paused"}`}
        >
          <div className="dotgrid absolute inset-0 opacity-50" />
          <svg viewBox="0 0 160 96" className="relative block size-full" role="img" aria-label={`Postcard from ${name}`}>
            <Scene uid={uid} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
