import { useId } from "react";
import "./memory-environment.css";

type Layer = "back" | "front";

function Palm({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-9 440Q16 272 0 72M4 440Q29 259 8 72" />
      <path d="m-5 390 14 3m-10-36 16 3m-10-39 16 2m-13-39 18 2m-16-41 19 1m-18-40 19 0m-20-37 18-1m-20-37 17-2m-20-32 17-2" opacity=".4" />
      <path d="M4 76Q-66 4-142 58M4 77Q-45 13-101-12M5 77Q-5-11 48-49M7 75Q90 3 156 48M8 78Q111 54 165 118M2 78Q-65 68-132 140" />
      <path d="m-14 59-18 5m8-16-25 6m12-15-32 8m18-14-36 10m22-13-39 12m24-13-32 13m25-10-16 10m62-4-22-1m12-10-30-4m19-8-32-8m20-4-33-9m23-1-28-11m75 42-20-17m20 2-17-24m19 10-12-27m15 12-6-27m12 13 1-24m14 87 22 2m-9-13 30 0m-15-10 34 3m-16-10 37 7m-19-9 36 10m-20-8 29 12m-79 17 27-4m-11 11 33-4m-17 12 34 0m-18 9 35 4m-21 7 29 7m-99-26-25-7m9 17-34-9m15 21-36-9m18 22-35-6m18 20-25-6" opacity=".55" />
      <path d="M-7 83q-10-13-16-1t14 10m17-5q13-16 19-3t-14 12" opacity=".65" />
    </g>
  );
}

function Window({ x, y, width = 100, height = 130 }: { x: number; y: number; width?: number; height?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M-5-5h${width + 10}v${height + 10}H-5ZM0 0h${width}v${height}H0Z`} />
      <path d={`M${width / 2} 0v${height}M0 ${height / 2}h${width}`} opacity=".7" />
      <path d={`M${width * .23} 0v${height}M${width * .77} 0v${height}M0 ${height * .24}h${width}M0 ${height * .76}h${width}`} opacity=".3" />
      <path d={`M-11 ${height + 9}h${width + 22}v5H-11Z`} opacity=".6" />
      <path d={`M8 8h${width / 2 - 16}v${height / 2 - 16}H8Z`} fill="currentColor" stroke="none" opacity=".035" />
    </g>
  );
}

function HouseInterior({ scene, glowId, layer }: { scene: string; glowId: string; layer: Layer }) {
  const departing = ["packed", "gift", "taking", "pocket"].includes(scene);
  return layer === "back" ? (
    <>
      <g className="memory-environment__far" strokeWidth="1.3">
        <path d="M-30 805H1640M0 815H1600M0 827h1600" />
        <path d="M1055 0v807m9-807v807M1064 807l536 170M1064 807 847 1000M1064 807 226 1000" opacity=".35" />
        <path d="M1041 88h559M1056 96h544m-555-18 555 0" opacity=".25" />
        <path d="M21 744q203 4 301 0m289 7q154-3 269 1m-834-12 111-2m1071-22 183 2m-201 30h51" opacity=".18" />
      </g>
      <g className="memory-environment__floor" strokeWidth="1.2" opacity=".35">
        <path d="m0 942 1600-23M191 1000l175-177m710 177 29-177m328 177-115-177" />
        <path d="m0 858 1600-5m-711 30h517m-982 56 192-2m887-18h157" opacity=".4" />
      </g>
    </>
  ) : (
    <>
      <g className="memory-environment__near" strokeWidth="1.65">
        <g transform="translate(1110 265)">
          <path d="M-17-18h272v372H-17ZM-10-11h258v357H-10ZM0 0h238v332H0Z" />
          <path d="M119 0v332M0 166h238" strokeWidth="2.2" />
          <path d="M34 0v332M68 0v332m102-332v332m34-332v332M0 57h238M0 109h238M0 223h238M0 276h238" opacity=".45" />
          <path d="M9 9h101v148H9Zm119 0h101v148H128ZM9 176h101v147H9Zm119 0h101v147H128Z" opacity=".2" />
          <path d="M-29 354h298v13H-29ZM-20 369h280" />
          <path d="M-16-20-34-33v401m289-386 16-14v399" opacity=".25" />
          <path d="M137 7q57 18 99 6m-233 283q63-9 114 1" opacity=".15" />
        </g>
        <g opacity={scene === "permission" ? ".95" : ".62"}>
          <path d="M1458 804V170h225m-215 634V181h215m-207 623V193h207" />
          <path d="m1483 211 174 30v563h-174Zm9 18 154 27v548h-154Z" />
          <path d="m1505 258 128 22v197l-128-12Zm0 233 128 10v237h-128Z" opacity=".35" />
          <path d="M1502 495v34m-6-34h9" />
          <path d="M1441 806h250m-257 8h270m-245-634 15 13" opacity=".45" />
        </g>
        <g transform="translate(947 0)">
          <path d="M0 0v183m-7-1h14v9H-7Zm0 9q-12 10-7 26l7 10h14l7-10q5-16-7-26m-12 37h10m-10 4h10" />
          <path d="m-4 216 4-11 4 11m-4-11v-7" opacity=".6" />
          <path className="memory-environment__bulb-rays" d="m-32-5-8-7m72 7 8-7m-68 36-13 5m82-5 13 5" transform="translate(0 215)" opacity=".3" />
          <path className="memory-environment__light" d="m-10 216-175 591h370L10 216Z" fill={`url(#${glowId})`} stroke="none" />
        </g>
        {departing && (
          <g transform="translate(1218 743) rotate(-3)" strokeWidth="1.9">
            <path d="M0 13Q0 0 13 0h147q14 0 14 13v80H0Zm8 0h158v72H8Z" />
            <path d="M60 0v-16q0-9 10-9h32q10 0 10 9V0M68 0v-15h36V0M28 0v93m118-93v93M16 17h140" opacity=".65" />
            <path d="M-8 93h189m-145 0v7m111-7v7M82 43h22v15H82Z" opacity=".5" />
            <path d="m173 67 17 3 5 22-21 1m10-23 5-17" />
          </g>
        )}
      </g>
    </>
  );
}

function Street({ scene, glowId, layer }: { scene: string; glowId: string; layer: Layer }) {
  const isShop = scene === "shop" || scene === "empty";
  const isIce = scene === "ice";
  return layer === "back" ? (
    <>
      <g className="memory-environment__far" strokeWidth="1.3">
        <circle cx="1267" cy="143" r="22" fill="currentColor" stroke="none" opacity=".62" />
        <path d="M-50 462Q595 525 1115 353M-10 449Q583 509 1113 340m-144-60q192 56 654-3" opacity=".3" />
        <path d="M981 820V582h192v238M970 582h214v-9H970m31 9v-31h151v31m-151-31 21-31h108l22 31m-124 45v53h32v-53Zm68 0v53h32v-53Z" />
        <path d="M1140 820V510h227v310m-240-310h253v-13h-253Zm27-14v-54h199v54m-184-39h169m-158-15v54m28-54v54m28-54v54m28-54v54m28-54v54m28-54v54" />
        <path d="M1187 547h42v64h-42Zm101 0h42v64h-42Zm-65 273V690h67v130m-93-165h129" opacity=".6" />
        <path d="M0 818V689h285v129M-17 686h320v-9H-17m42-4v-28h241v28M34 712h40v55H34Zm104 0h40v55h-40Zm86 106v-85h34v85" opacity=".6" />
        {/* an old tiled-roof house with its thinnai, the raised front verandah */}
        <g opacity=".42">
          <path d="M326 821V700h236v121" />
          <path d="M296 702l64-74h168l64 74Z" />
          <path d="M318 677h228m-208-24h188m-170-25 2 74m42-74 1 74m42-74v74m42-74-1 74" opacity=".45" />
          <path d="M338 821v-40h212v40m-212-40h212" />
          <path d="M352 781v-79m184 79v-79" strokeWidth="3" />
          <path d="M424 781v-62h40v62m-16-62v62" opacity=".7" />
          <path d="M374 724h30v30h-30Zm7 0v30m8-30v30m8-30v30" opacity=".55" />
        </g>
        {/* a kolam at each doorstep, drawn in rice flour that morning */}
        <g opacity=".42" strokeWidth="1">
          {[[444, 842], [72, 842]].map(([kx, ky]) => (
            <g key={kx} transform={`translate(${kx} ${ky}) scale(1 .34)`}>
              <path d="M-46 0C-46-30-16-30 0-14C16-30 46-30 46 0C46 30 16 30 0 14C-16 30-46 30-46 0Z" />
              <path d="M-24 0a24 16 0 1 0 48 0a24 16 0 1 0-48 0" />
              {[-30, -15, 0, 15, 30].map((dx) => <circle key={dx} cx={dx} cy="0" r="2.4" fill="currentColor" stroke="none" />)}
            </g>
          ))}
        </g>
        {/* the temple tower, far off over the rooftops */}
        <g opacity=".22" strokeWidth="1.1">
          <path d="M610 700l8-36h96l8 36M624 664l7-30h70l7 30M637 634l6-26h46l6 26M649 608l5-22h24l5 22M656 586q10-16 20 0" />
          <path d="M666 570v-10m-7 12v-6m14 6v-6" />
          <path d="M622 682h88m-80-32h72m-62-28h52" opacity=".5" strokeDasharray="3 5" />
        </g>
        {/* the electric pole, and the wires every street is strung with */}
        <g opacity=".5" strokeWidth="1.2">
          <path d="M780 822V478m-6 0h12" />
          <path d="M752 492h56m-50 0v6m44-6v6m-22-14v-8" />
          <path d="M-20 548Q380 610 752 496M-20 566Q390 632 808 496M808 496Q960 560 1112 318M808 498Q990 590 1240 330" opacity=".7" />
          <path d="M774 600h12m-12 40h12" opacity=".6" />
        </g>
        <g fill="currentColor" stroke="none" opacity=".45">
          {[[180, 120], [320, 64], [470, 168], [620, 92], [760, 40], [890, 150], [1010, 72], [1380, 60], [1530, 130], [90, 230]].map(([sx, sy], index) => (
            <circle key={sx} cx={sx} cy={sy} r={index % 3 ? 1.4 : 2.2} />
          ))}
        </g>
        {/* the stone milestone at the roadside, yellow-capped, in Tamil */}
        <g opacity=".45" strokeWidth="1.2" transform="translate(196 900)">
          <path d="M-34 0v-66q0-34 34-34t34 34V0Z" />
          <path d="M-34-66q0-34 34-34t34 34Z" fill="currentColor" fillOpacity=".08" />
          <text y="-44" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="currentColor" stroke="none">நாகர்கோவில்</text>
          <text y="-20" textAnchor="middle" fontSize="18" fontWeight="600" fill="currentColor" stroke="none">2</text>
          <path d="M-44 0h88" />
        </g>
        <g opacity=".55"><Palm x={1480} y={244} scale={1.26} /></g>
        <g opacity=".3"><Palm x={806} y={444} scale={.8} /></g>
        <path d="M0 822h1600m-37 7H-10" opacity=".45" />
      </g>

      <g className="memory-environment__floor" strokeWidth="1.1" opacity=".35">
        <path d="M-40 866q452-29 980-10t700-4M0 904q497-22 900-8t744-1" opacity=".45" />
        <path d="M67 947h120m13-1h43m853-38h161m48-1h60m-801 67h104m23-1h30m547-71h128m-1347-50h59m1165-12h94" />
        <path d="m79 832-36 14m18-2 15 0m1416-13 38 12m-48-8 17 7" opacity=".5" />
      </g>
    </>
  ) : (
    <>
      <g className="memory-environment__near" strokeWidth="1.6">
        {isShop ? (
          <g>
            <path d="M1191 816V325h409M1172 325h448v-14h-448Zm20-14v-37h408m-386 9h386" />
            <path d="M1248 350h290v85h-290Zm9 9h272v67h-272Z" opacity=".45" />
            <path d="M1215 467h368v22h-368m15 13h338v268h-338Z" opacity=".5" />
            <path d="M1231 516h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336m-336 14h336" opacity=".15" />
            <path d="M1210 789h390m-402 14h402m-380-305v279m357-279v279" opacity=".5" />
            <path d="M1429 253v-77h57v77m-49-77v-19h41v19" opacity=".2" />
          </g>
        ) : (
          <g>
            <path d="M1350 815V400h285m-297 0h305v-15h-305Zm22-15v-44h278m-265 12h265" />
            <Window x={1401} y={468} width={106} height={142} />
            <path d="M1553 815V638h82m-91 177V629h91m-79 28h79m-270 95h172m-171 9h172" opacity=".5" />
            <path d="M1357 426h250m-236 4h163m-178 377h279" opacity=".25" />
            <path d="M1374 340v-21h221v21m-201-21v-22h181v22" opacity=".35" />
          </g>
        )}

        <g transform="translate(1118 0)">
          <path d="M-3 826V334q0-22 22-22h90M4 826V337q0-18 18-18h87" />
          <path d="M94 311v17m-22 5q0-11 30-11t30 11Zm6 4h48m-41 1q2 14 17 14t17-14" />
          <path className="memory-environment__light" d="M83 344-80 827h365L122 344Z" fill={`url(#${glowId})`} stroke="none" />
          <ellipse className="memory-environment__light" cx="102" cy="827" rx="200" ry="26" fill={`url(#${glowId}-pool)`} stroke="none" />
          <path d="m-7 693 16 0m-16 6h16m-17 125h18" opacity=".5" />
        </g>

        {isIce && (
          <g opacity=".7">
            <path d="M867 471h733m-733-9h733m-724 12-18 88h742m-737 0 39-87m12 87 31-87m20 87 23-87m28 87 17-87m34 87 9-87m42 87 1-87m49 87-7-87m57 87-15-87m64 87-23-87m72 87-31-87" />
            <path d="M860 562v241m7-241v241m-1-225h734m-727 26v184m-12 15h130m30 0h130" opacity=".4" />
            <path d="M865 783h735m-735 9h735" opacity=".3" />
          </g>
        )}
      </g>
    </>
  );
}

/** City blocks behind the mall: [x, width, top]. */
const BLOCKS = [[-30, 170, 540], [150, 128, 466], [288, 116, 592], [414, 150, 436], [1040, 118, 498], [1168, 168, 452], [1346, 122, 566], [1478, 160, 476]] as const;

/** A block's windows, as rows of short dashes: lit and unlit squares from far off. */
function windowsOf(x: number, width: number, top: number) {
  let d = "";
  for (let y = top + 28; y < 790; y += 32) {
    for (let wx = x + 16; wx + 12 < x + width - 8; wx += 26) d += `M${wx} ${y}h12`;
  }
  return d;
}

/** Chennai: apartment blocks with their water tanks, the mall with its cinema, shopfronts and an auto at the curb. */
function City({ glowId, layer }: { glowId: string; layer: Layer }) {
  return layer === "back" ? (
    <>
      <g className="memory-environment__far" strokeWidth="1.3">
        <circle cx="1210" cy="118" r="18" fill="currentColor" stroke="none" opacity=".55" />
        <g fill="currentColor" stroke="none" opacity=".4">
          {[[250, 96], [560, 60], [930, 120], [1420, 70], [80, 180]].map(([sx, sy]) => <circle key={sx} cx={sx} cy={sy} r="1.6" />)}
        </g>
        {/* apartment blocks, each with a water tank on the roof */}
        {BLOCKS.map(([x, width, top]) => (
          <g key={x}>
            <path d={`M${x} 822V${top}h${width}V822M${x + width * 0.62} ${top}v-26h30v26M${x + 16} ${top}v-14`} />
            <path d={windowsOf(x, width, top)} strokeWidth="2.4" opacity=".35" />
          </g>
        ))}
        {/* the mall, its cinema's name across the top, a film poster on the glass */}
        <g>
          <path d="M588 822V560h444v262" fill="currentColor" fillOpacity=".03" />
          <path d="M576 560h468v-50H576Z" />
          <text x="810" y="546" textAnchor="middle" fontSize="26" letterSpacing="14" fill="currentColor" stroke="none" style={{ fontFamily: "var(--font-geist-mono), monospace" }}>CINEMAS</text>
          <path d="M612 590v188m30-188v188m30-188v188m30-188v188m30-188v188m30-188v188m30-188v188m30-188v188m30-188v188m30-188v188m30-188v188m30-188v188M600 644h420M600 704h420" opacity=".35" />
          <path d="M622 600h72v120h-72Z" fill="currentColor" fillOpacity=".08" />
          <path d="M650 708l3-20q-7-4-6-15q2-12 12-14q4-1 6 2q5 1 4 6q-1 3-4 3q2 7-1 15l2 23h-4l-2-15h-4l-2 15Z" fill="currentColor" stroke="none" opacity=".5" />
          <path d="M736 760h148l22 18H714Z" />
          <path d="M760 822v-44m100 44v-44m-90 44h80" opacity=".6" />
        </g>
        {/* the electric pole, and its wires */}
        <g opacity=".45" strokeWidth="1.2">
          <path d="M520 822V470m-6 0h12" />
          <path d="M492 484h56m-50 0v6m44-6v6" />
          <path d="M-20 520Q260 590 492 488M548 488Q700 560 900 560T1300 470M-20 540Q270 610 520 488" opacity=".7" />
        </g>
        <path d="M0 822h1600m-37 7H-10" opacity=".45" />
      </g>

      <g className="memory-environment__floor" strokeWidth="1.1" opacity=".35">
        <path d="M-40 866q452-29 980-10t700-4M0 904q497-22 900-8t744-1" opacity=".45" />
        <path d="M67 947h120m13-1h43m853-38h161m48-1h60m-801 67h104m23-1h30m547-71h128m-1347-50h59m1165-12h94" />
        <path d="M120 884h60m80 0h60m80 0h60m80 0h60m80 0h60m80 0h60m80 0h60m80 0h60" opacity=".45" />
      </g>
    </>
  ) : (
    <>
      <g className="memory-environment__near" strokeWidth="1.6">
        {/* a shopfront on the corner: its board in Tamil, the awning, the shutter half up */}
        <g>
          <path d="M1340 815V380h290m-302 0h310v-14h-310Z" />
          <path d="M1362 420h230v58h-230Z" />
          <text x="1477" y="459" textAnchor="middle" fontSize="26" fontWeight="600" fill="currentColor" stroke="none">ஸ்டோர்ஸ்</text>
          <path d="M1350 500h262l-14 34h-234Z" />
          <path d="M1374 500l-6 34m40-34-4 34m40-34-2 34m40-34v34m40-34 2 34m40-34 4 34" opacity=".5" />
          <path d="M1372 560h220v120h-220Zm0 16h220m-220 16h220m-220 16h220m-220 16h220m-220 16h220m-220 16h220" opacity=".4" />
          <path d="M1362 815V560m240 255V560" opacity=".6" />
        </g>
        {/* an auto-rickshaw waiting at the curb */}
        <g transform="translate(1220 822)" opacity=".75">
          <path d="M-80-14-74-60q2-10 14-10h20l10 30h104v26Z" />
          <path d="M-60-70q4-42 50-42h62q24 2 24 32v40" />
          <path d="M-58-72-40-108M-74-30H74M24-40v-30" opacity=".6" />
          <circle cx="-58" cy="-10" r="12" /><circle cx="50" cy="-10" r="14" />
        </g>
        {/* the street lamp, its light falling on the road */}
        <g transform="translate(1040 0)">
          <path d="M-3 826V334q0-22 22-22h90M4 826V337q0-18 18-18h87" />
          <path d="M94 311v17m-22 5q0-11 30-11t30 11Zm6 4h48m-41 1q2 14 17 14t17-14" />
          <path className="memory-environment__light" d="M83 344-80 827h365L122 344Z" fill={`url(#${glowId})`} stroke="none" />
          <ellipse className="memory-environment__light" cx="102" cy="827" rx="200" ry="26" fill={`url(#${glowId}-pool)`} stroke="none" />
          <path d="m-7 693 16 0m-16 6h16m-17 125h18" opacity=".5" />
        </g>
      </g>
    </>
  );
}

/**
 * The room or street behind each scene, faint. It is two stacked drawings,
 * the far wall or skyline and the near furniture or shopfronts, so each layer
 * can drift at its own depth as a whole: the browser moves them on the GPU
 * without redrawing a line.
 */
export function MemoryEnvironment({ scene, place }: { scene: string; place?: "interior" | "street" | "city" }) {
  const id = useId().replace(/:/g, "");
  const inside = place ? place === "interior" : ["cousins", "laptop", "four", "brick", "console", "price", "packed", "gift", "taking", "pocket", "permission"].includes(scene);
  const Place = inside ? HouseInterior : place === "city" ? City : Street;
  const svg = (layer: Layer) => (
    <svg
      className={`memory-environment__layer memory-environment__layer--${layer}`}
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {layer === "front" && (
        <defs>
          <radialGradient id={`${id}-light-pool`}>
            <stop stopColor="currentColor" stopOpacity=".09" />
            <stop offset=".6" stopColor="currentColor" stopOpacity=".03" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-light`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="currentColor" stopOpacity=".18" />
            <stop offset=".7" stopColor="currentColor" stopOpacity=".045" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      <Place scene={scene} glowId={`${id}-light`} layer={layer} />
    </svg>
  );
  return (
    <div className={`memory-environment memory-environment--${inside ? "interior" : "street"} memory-environment--${scene}`} aria-hidden="true">
      {svg("back")}
      {svg("front")}
    </div>
  );
}
