/**
 * Haptics: a tiny vocabulary of physical feedback, tuned to sit under the
 * site's sounds rather than buzz over them.
 *
 * - Android (and any browser with the Vibration API): precise patterns.
 * - iOS 18+ Safari has no Vibration API, but toggling a native
 *   <input type="checkbox" switch> plays the system selection haptic, so a
 *   hidden one is used as a "tap" engine (only works inside a user gesture,
 *   which is exactly when we fire).
 * - Desktop: silently does nothing.
 *
 * Softness, not strength: the Vibration API can't set amplitude, the motor
 * always runs at full power. What reads as "gentle" is duration: 3-6 ms
 * barely spins the actuator up and lands as a soft tap, while 8+ ms reaches
 * full speed and buzzes. So every pattern is a single short pulse (or two,
 * well apart), and presses fire on finger-down, the moment a real button
 * would push back, instead of ~100 ms later on click.
 */

export type Haptic =
  /** any tactile press: buttons, links, nav */
  | "tick"
  /** choosing something: a place, a tab */
  | "select"
  /** a switch flipping: press + latch, 32 ms apart like switch.mp3 */
  | "toggle"
  /** the camera arriving, a sheet settling */
  | "land"
  /** detents: zoom steps, a finger passing over a city */
  | "notch"
  /** running into a boundary: list end, map edge */
  | "edge"
  /** something completed in a satisfying way */
  | "success";

const PATTERNS: Record<Haptic, number | number[]> = {
  tick: 4,
  select: 6,
  toggle: [4, 48, 6],
  land: 5,
  notch: 3,
  edge: 6,
  success: [5, 70, 5],
};

/** minimum gap per pattern so repeats feel like texture, not noise */
const GAP: Record<Haptic, number> = {
  tick: 60,
  select: 90,
  toggle: 160,
  land: 220,
  notch: 90,
  edge: 300,
  success: 500,
};

/** iOS gets one system tap; lighter events are skipped there to avoid fatigue */
const IOS_TAPS: Partial<Record<Haptic, number>> = {
  tick: 1,
  select: 1,
  toggle: 1,
  land: 1,
  edge: 1,
  success: 1,
};

let last = 0;
/** when the finger last landed on something pressable (and got its tick) */
let pressedAt = -1;
let iosSwitch: HTMLLabelElement | null = null;
let canVibrate: boolean | null = null;

function supportsVibrate() {
  if (canVibrate === null) {
    canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  }
  return canVibrate;
}

function isIOS() {
  return (
    typeof navigator !== "undefined" &&
    (/iP(hone|ad|od)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
  );
}

function iosTap() {
  if (!iosSwitch) {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    iosSwitch = label;
  }
  iosSwitch.click();
}

let enabled = true;

/** Global kill switch (e.g. for a settings toggle). */
export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

/** Fire a haptic. Safe to call anywhere; no-ops where unsupported. */
export function haptic(kind: Haptic = "tick") {
  if (!enabled || typeof window === "undefined" || document.hidden) return;
  const now = performance.now();
  // a press already ticked on finger-down; don't tick again on click
  if (kind === "tick" && now - pressedAt < 600) return;
  if (now - last < GAP[kind]) return;
  last = now;
  try {
    if (supportsVibrate()) {
      navigator.vibrate(PATTERNS[kind]);
    } else if (isIOS()) {
      const taps = IOS_TAPS[kind] ?? 0;
      for (let i = 0; i < taps; i++) {
        if (i === 0) iosTap();
        else setTimeout(iosTap, 34 * i);
      }
    }
  } catch {
    /* haptics are a garnish; never let them throw */
  }
}

const PRESSABLE = "button, a[href], [role='button'], summary, label, .tactile, .tactile-primary, .tactile-accent";

/**
 * Touch only: tick when a finger settles on something pressable, the way a
 * physical button pushes back, roughly twice as fast as waiting for click.
 * It waits ~45 ms first: if the finger slides (a scroll that happened to
 * start on a link) or the browser takes the gesture, nothing fires, so
 * scrolling never buzzes.
 */
if (typeof window !== "undefined") {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let start: { x: number; y: number; id: number } | null = null;
  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    start = null;
  };
  const opts = { capture: true, passive: true } as const;
  window.addEventListener(
    "pointerdown",
    (e) => {
      cancel();
      if (e.pointerType !== "touch" || !e.isPrimary) return;
      const el = (e.target as Element | null)?.closest?.(PRESSABLE);
      if (!el || (el as HTMLButtonElement).disabled) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      timer = setTimeout(() => {
        timer = undefined;
        if (!start) return;
        haptic("tick");
        pressedAt = performance.now();
      }, 45);
    },
    opts,
  );
  window.addEventListener(
    "pointermove",
    (e) => {
      if (start && e.pointerId === start.id && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) cancel();
    },
    opts,
  );
  window.addEventListener("pointercancel", cancel, opts);
  window.addEventListener("scroll", cancel, opts);
}
