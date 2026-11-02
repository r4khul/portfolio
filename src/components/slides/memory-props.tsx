const paper = "var(--background)";

/**
 * One ice tube: a flat juice sleeve, heat-sealed across both ends. The same
 * drawing is the cover's fan, the shop's ice tubes and the ones in my hand,
 * so the last shot can carry the very same five from my hand to the cover.
 *
 * Its origin sits about three quarters down the sleeve: the top seal is at
 * y = -205, the bottom at +59. Strokes keep their weight on screen at any
 * zoom. `simple` leaves out the fine crimping, for when it is drawn small.
 */
const hair = { vectorEffect: "non-scaling-stroke" } as const;

export function Pouch({ x = 0, y = 0, angle = 0, scale = 1, simple = false }: { x?: number; y?: number; angle?: number; scale?: number; simple?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path d="M-13-205h26l-1 21 1 52-1 56 1 57-1 59h-25l1-23-1-52 1-60-1-57Z" fill={paper} strokeWidth="1.25" {...hair} />
      <path d="M-9-185h18l-1 53 1 56-1 53 1 43H-9l1-56-1-59 1-54Z" fill="currentColor" fillOpacity={simple ? 0.06 : 0.025} strokeWidth=".65" strokeOpacity={simple ? 0 : 0.35} {...hair} />
      <path d="M-13-191h26M-13 25h25" strokeWidth=".9" opacity=".6" {...hair} />
      {!simple && (
        <g className="memory-pouch__detail">
          <path d="M-5-176-6-57m12-61 1 89M-11-191l7 10m14-10-6 10M-11 25l7-9m14 9-6-8m-12-127 3-4m15 43-3-4m-14 77 3 4m14-1-3 5" strokeWidth=".65" opacity=".45" {...hair} />
          <g strokeWidth=".55" opacity=".4">
            {[-10, -7, -4, -1, 2, 5, 8, 11].map((xx) => <path key={xx} d={`M${xx}-203v10m0 234v-14`} {...hair} />)}
          </g>
          <path d="m-4-135 1 1m7 36 1 1m-8 31 1 1" strokeWidth=".8" opacity=".4" {...hair} />
          <ellipse cx="4" cy="-146" rx="1.2" ry="1.8" opacity=".35" strokeWidth=".6" {...hair} />
          <ellipse cx="-4" cy="-32" rx="1.1" ry="1.6" opacity=".3" strokeWidth=".6" {...hair} />
        </g>
      )}
    </g>
  );
}

/** The cover's fan of five: [x, angle, scale], standing on y = 296. */
export const COVER_FAN = [[689, -18, 1.12], [725, -9, 1.13], [762, 0, 1.14], [799, 9, 1.13], [835, 18, 1.12]] as const;

/**
 * The five sleeves stand upright in my fist, bottoms together and tops
 * fanned, the way the cover holds them, so the last shot can carry them from
 * my hand to the cover without any two crossing. Tilts are degrees from
 * upright, clockwise.
 */
export const HELD_ANGLES = [-16, -8, 0, 8, 16] as const;
export const HELD_SCALE = 0.327;

/** Where a sleeve's origin sits when its bottom seal is in my fist. Same units as `fist`. */
export function heldSleeve(fist: readonly [number, number], tilt: number) {
  const r = (tilt * Math.PI) / 180;
  const grip = 52 * HELD_SCALE;
  return { x: fist[0] + grip * Math.sin(r), y: fist[1] - grip * Math.cos(r), angle: tilt, scale: HELD_SCALE };
}

/** The handheld he described, the one I never got to buy: a soft shell, a screen, a D-pad and four buttons. */
export function Handheld() {
  return <g transform="rotate(-7 540 278)">
      {/* A single soft-cornered shell, rather than detachable controllers. */}
      <path d="M364 192q5-9 18-9h32v13m253 0v-13h32q14 0 18 10" fill={paper} strokeWidth="1.3" />
      <path d="M381 194c-24 0-33 13-38 36l-15 91c-5 23 10 42 33 42h356c23 0 38-19 33-42l-15-91c-5-23-14-36-38-36Z" fill={paper} strokeWidth="2" />
      <path d="M381 201c-18 0-27 10-31 31l-15 90c-4 18 8 34 27 34h354c19 0 31-16 27-34l-15-90c-4-21-13-31-31-31Z" strokeWidth=".7" opacity=".4" />
      <path d="M428 207h224q10 0 10 10v113q0 9-10 9H428q-10 0-10-9V217q0-10 10-10Z" strokeWidth="1.2" />
      <path d="M430 219h220v107H430Z" fill="currentColor" fillOpacity=".035" strokeWidth=".9" />
      <path d="M435 313h29v-10h25v10h23m49 0h30v-14h21v14h33M439 229h13m5 0h7m127 5 9-6h16l8 6Z" opacity=".28" strokeWidth=".8" />
      <g strokeWidth="1" opacity=".48"><path d="m526 286 4-9 8 1 5 8-5 14h-11Zm3 15-7 10m13-10 10 10m-16-24-11 3m22-6 9-3M572 271v-12h9v12Z" /></g>
      <path d="M367 249h18v14h14v18h-14v14h-18v-14h-14v-18h14Z" fill="currentColor" fillOpacity=".07" strokeWidth="1.3" />
      <path d="m371 255 5-3 5 3m-22 12-3 5 3 5m12 13 5 3 5-3m12-23 3 5-3 5" opacity=".5" strokeWidth=".65" />
      <g strokeWidth="1.2">
        <circle cx="699" cy="254" r="8" /><circle cx="720" cy="276" r="8" /><circle cx="699" cy="298" r="8" /><circle cx="678" cy="276" r="8" />
        <path d="m696 255 3-5 3 5Zm21 18 6 6m-6 0 6-6m-24 21v8m-4-4h8M675 273h6v6h-6Z" opacity=".4" strokeWidth=".65" />
      </g>
      <circle cx="376" cy="328" r="13" strokeWidth="1.2" /><circle cx="376" cy="328" r="9" opacity=".3" strokeWidth=".7" />
      <path d="m369 324 13 0m-13 4h13m-13 4h13" opacity=".25" strokeWidth=".55" />
      <g opacity=".55" fill="currentColor" stroke="none">
        {[246, 253, 260, 267, 274, 281, 288, 295, 302].map((yy) => <g key={yy}><circle cx="406" cy={yy} r=".9" /><circle cx="670" cy={yy} r=".9" /></g>)}
      </g>
      <path d="M492 347h17m18 0h17m18 0h17m18 0h17m-99-150h27m15 0h11m-165 148h6m298-14h13m-12 4h11m-365-22 1-11m4 35 2-10" opacity=".55" strokeWidth="1" />
      <circle cx="460" cy="347" r="2" opacity=".5" strokeWidth=".8" /><circle cx="638" cy="347" r="2" opacity=".5" strokeWidth=".8" />
  </g>;
}
