/**
 * Scene audio for the story reader.
 *
 * Each WAV is a complete, authored phrase with its own contacts and quiet spaces.
 * The generator retains the mix and source credits; this module only prepares
 * and plays those phrases. Keeping synthesis and decoding out of scene entry
 * lets the first audible contact and the SVG's entrance share one browser task.
 */
export type StorySound = "rewind" | "fortune" | "bank" | "watch";
export type StoryPlayback = { stop: () => void };

// The rendered files are mastered against Chapter 1's effective playback levels.
// Unity gain keeps the reader and standalone file previews at that same level;
// each cue's mix retains its own headroom and balance in the generator.
const LEVEL = 1;
const SOURCES: Record<StorySound, string> = {
  rewind: "/sfx/stories/rewind.wav",
  fortune: "/sfx/stories/fortune.wav",
  bank: "/sfx/stories/bank.wav",
  // A distinct filename also invalidates the earlier dry-tick asset in browser
  // caches. The reveal contains those contacts followed by its five-second score.
  watch: "/sfx/stories/watch-reveal.wav",
};

let context: AudioContext | null = null;
// AudioBuffers can be reused by a replacement context after the OS closes audio.
// The four decoded phrases are the entire cache; leaving a scene adds no entries.
const buffers = new Map<StorySound, AudioBuffer>();
let warming: Promise<void> | null = null;
const readinessListeners = new Set<() => void>();

function notifyReadiness() {
  readinessListeners.forEach((listener) => listener());
}

export function subscribeStoryAudio(listener: () => void) {
  readinessListeners.add(listener);
  return () => { readinessListeners.delete(listener); };
}

export function isStoryAudioReady() {
  return context?.state === "running";
}

/**
 * Preload from the entry card, before the reader reaches an illustration.
 * Concurrent callers share one job, including the first gesture during loading.
 * A partial network failure keeps good buffers and makes only missing files retry.
 */
export function warmStoryAudio(): Promise<void> {
  if (warming) return warming;
  if (typeof window === "undefined") return Promise.resolve();

  const pending = (Object.keys(SOURCES) as StorySound[]).filter((name) => !buffers.has(name));
  if (!pending.length) return Promise.resolve();

  try {
    const Offline = window.OfflineAudioContext ?? (window as Window & {
      webkitOfflineAudioContext?: typeof OfflineAudioContext;
    }).webkitOfflineAudioContext;
    // Offline decoding does not need autoplay permission or produce output.
    // Older browsers can use the live context once the entry gesture creates it.
    const decoder = Offline ? new Offline(1, 1, 22050) : context;
    if (!decoder) return Promise.resolve();

    warming = Promise.allSettled(pending.map(async (name) => {
      const response = await fetch(SOURCES[name]);
      if (!response.ok) throw new Error(`Story sound unavailable: ${name}`);
      const buffer = await decoder.decodeAudioData(await response.arrayBuffer());
      buffers.set(name, buffer);
      // A slow download may finish with its scene already visible. The observer's
      // subscriber checks visibility/mute again before starting this newly ready cue.
      notifyReadiness();
    })).then((results) => {
      // A failed file can retry on a later gesture without reloading good buffers.
      if (results.some((result) => result.status === "rejected")) warming = null;
    });
    return warming;
  } catch {
    warming = null;
    return Promise.resolve();
  }
}

/**
 * Unlock from the entry card or a later trusted pointer/key gesture.
 * resume() must be called before awaiting decoding, while browser activation is
 * still present. An intersection callback is never allowed to unlock audio.
 */
export function primeStoryAudio(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return Promise.resolve(false);
    if (!context || context.state === "closed") {
      // Detach the old context's lifecycle callback before replacing it. Keeping
      // decoded buffers is safe; keeping a closed context's subscription is not.
      context?.removeEventListener("statechange", notifyReadiness);
      const Ctor = window.AudioContext ?? (window as Window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;
      if (!Ctor) return Promise.resolve(false);
      context = new Ctor({ latencyHint: "interactive" });
      context.addEventListener("statechange", notifyReadiness);
    }
    const current = context;
    // Invoke resume synchronously while the browser still has activation.
    const resumed = current.state === "running"
      ? Promise.resolve(true)
      : current.resume().then(() => current.state === "running", () => false);
    return Promise.all([resumed, warmStoryAudio()]).then(([running]) => {
      notifyReadiness();
      return running && current.state === "running";
    });
  } catch {
    return Promise.resolve(false);
  }
}

/**
 * Start one cached phrase immediately and return a cancellation handle.
 * Visibility, mute and replay cadence belong to useStoryScene; this function
 * deliberately cannot resume a suspended context or schedule a surprise later play.
 */
export function playStorySound(sound: StorySound): StoryPlayback | null {
  const current = context;
  if (!current || current.state !== "running") return null;

  const buffer = buffers.get(sound);
  if (!buffer) {
    // Leave the scene unplayed until readiness notifies its visibility subscriber.
    // There is no queued source that could fire after the reader has scrolled away.
    void warmStoryAudio();
    return null;
  }

  let source: AudioBufferSourceNode | null = null;
  let gain: GainNode | null = null;
  let disposed = false;
  let stopping = false;
  // Natural completion and cancellation converge here. Both nodes are per-play;
  // disconnecting them releases the finished graph while retaining the audio data.
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (source) {
      source.onended = null;
      try { source.disconnect(); } catch { /* The context may have closed. */ }
    }
    try { gain?.disconnect(); } catch { /* The context may have closed. */ }
  };

  try {
    source = current.createBufferSource();
    gain = current.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(LEVEL, current.currentTime);
    source.connect(gain);
    gain.connect(current.destination);
    source.onended = dispose;
    // A fresh BufferSource is a one-shot Web Audio node. Start it directly, rather
    // than using an HTMLAudioElement or timer whose asynchronous start can drift.
    source.start();

    return {
      stop() {
        if (disposed || stopping) return;
        stopping = true;
        try {
          if (current.state !== "running") {
            // A suspended audio clock cannot advance through a fade. Dispose now
            // so an OS interruption cannot leave an old phrase waiting to resume.
            source?.stop();
            dispose();
            return;
          }
          const now = current.currentTime;
          // The brief ramp avoids a waveform discontinuity when a reader mutes
          // or leaves halfway through a contact. onended then releases both nodes.
          gain!.gain.cancelScheduledValues(now);
          gain!.gain.setValueAtTime(LEVEL, now);
          gain!.gain.linearRampToValueAtTime(0, now + 0.02);
          source!.stop(now + 0.025);
        } catch {
          dispose();
        }
      },
    };
  } catch {
    try { source?.stop(); } catch { /* It may not have started. */ }
    dispose();
    return null;
  }
}
