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
 * Every pattern is short (motors need ~6-12 ms to be felt crisply without
 * smearing) and rate-limited so rapid input never turns into a drone.
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
  tick: 8,
  select: 12,
  toggle: [7, 32, 11],
  land: [5, 26, 9],
  notch: 4,
  edge: [6, 22, 6],
  success: [8, 46, 8, 46, 16],
};

/** minimum gap per pattern so repeats feel like texture, not noise */
const GAP: Record<Haptic, number> = {
  tick: 35,
  select: 60,
  toggle: 120,
  land: 160,
  notch: 55,
  edge: 220,
  success: 400,
};

/** iOS gets one system tap; lighter events are skipped there to avoid fatigue */
const IOS_TAPS: Partial<Record<Haptic, number>> = {
  tick: 1,
  select: 1,
  toggle: 2,
  land: 1,
  edge: 1,
  success: 2,
};

let last = 0;
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
