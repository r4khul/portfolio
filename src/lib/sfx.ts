/**
 * Instant UI sounds on the Web Audio API.
 *
 * Why not <audio>: every HTMLAudioElement buffers on its own, `play()` is
 * scheduled asynchronously, rewinding with `currentTime = 0` can drop a play
 * when presses come quickly, and MP3 encoder padding adds silent lead-in.
 *
 * Here each sound is fetched and decoded once per page into an AudioBuffer
 * (decoding runs on an OfflineAudioContext, so it needs no user gesture and
 * logs no autoplay warnings). Leading silence is measured and skipped. Every
 * play is a fresh AudioBufferSourceNode on one shared, "interactive"-latency
 * AudioContext: polyphonic, sample-accurate, a few ms from call to speaker.
 */

export type SfxName = "click" | "switch";

const SOURCES: Record<SfxName, string> = {
  click: "/sfx/click.mp3",
  switch: "/sfx/switch.mp3",
};

type Loaded = { buffer: AudioBuffer; offset: number };

const buffers = new Map<SfxName, Loaded>();
let warming: Promise<void> | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

type AudioCtor = typeof AudioContext;
function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitAudioContext?: AudioCtor };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

/** First sample louder than -60 dBFS, minus a few samples of headroom. */
function leadIn(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0);
  const limit = Math.min(data.length, Math.round(buffer.sampleRate * 0.12));
  for (let i = 0; i < limit; i++) {
    if (Math.abs(data[i]) > 0.001) return Math.max(0, i - 8) / buffer.sampleRate;
  }
  return 0;
}

/** Fetch + decode every sound once. Safe to call repeatedly. */
export function warmSfx() {
  if (warming || typeof window === "undefined") return warming;
  const Offline = window.OfflineAudioContext ?? (window as Window & { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!Offline) return null;
  const decoder = new Offline(1, 1, 44100);
  warming = Promise.all(
    (Object.keys(SOURCES) as SfxName[]).map(async (name) => {
      const res = await fetch(SOURCES[name]);
      const bytes = await res.arrayBuffer();
      const buffer = await new Promise<AudioBuffer>((resolve, reject) =>
        // callback form for older Safari
        decoder.decodeAudioData(bytes, resolve, reject),
      );
      buffers.set(name, { buffer, offset: leadIn(buffer) });
    }),
  ).then(
    () => undefined,
    () => {
      warming = null; // allow a retry on the next interaction
    },
  );
  return warming;
}

function context() {
  if (ctx) return ctx;
  const Ctor = audioCtor();
  if (!Ctor) return null;
  ctx = new Ctor({ latencyHint: "interactive" });
  master = ctx.createGain();
  master.connect(ctx.destination);
  return ctx;
}

/**
 * Browsers keep audio locked until the first gesture. Create/resume the
 * context on the earliest one (pointerdown fires before click), so the very
 * first click is already instant.
 */
function unlock() {
  const c = context();
  if (c && c.state !== "running") c.resume().catch(() => {});
  warmSfx();
}

if (typeof window !== "undefined") {
  const opts = { capture: true, passive: true } as const;
  window.addEventListener("pointerdown", unlock, opts);
  window.addEventListener("keydown", unlock, opts);
  window.addEventListener("touchstart", unlock, opts);
  // decode early, off the critical path
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (idle) idle(() => warmSfx());
  else setTimeout(() => warmSfx(), 1200);
}

/** Play a UI sound right now. No-ops until audio is unlocked and decoded. */
export function playSfx(name: SfxName, volume = 1) {
  const c = context();
  if (!c || !master) return;
  if (c.state !== "running") c.resume().catch(() => {});
  const loaded = buffers.get(name);
  if (!loaded) {
    warmSfx();
    return;
  }
  const src = c.createBufferSource();
  src.buffer = loaded.buffer;
  if (volume === 1) {
    src.connect(master);
  } else {
    const g = c.createGain();
    g.gain.value = volume;
    src.connect(g);
    g.connect(master);
  }
  src.start(0, loaded.offset);
}
