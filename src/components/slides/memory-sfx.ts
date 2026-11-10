/**
 * Scene sounds for the memories, synthesised on the Web Audio API.
 *
 * Nothing is downloaded or decoded. Every sound is built as it plays from
 * oscillators, one short noise buffer, a few filters and gain envelopes. The
 * sounds sit on top of the music bed. They are warm and short, with soft
 * attacks, a light low end and nothing bright above about 6 kHz, so a key tap
 * or a bicycle bell reads as part of the picture, not as an effect laid on it.
 *
 * The story calls `update` every frame with the scene on screen and its scroll
 * progress. A cue plays once as the reader scrolls forward past its mark, and
 * is ready again after they leave the scene and come back. Scrolling backward,
 * or jumping past a mark, plays nothing. On the bicycle, `ride` turns scroll
 * speed into pedalling: a chain tick as each pedal goes down, the freewheel's
 * clicks and the hiss of the road, all gone soon after the reader stops. On
 * the Avenger it turns into the engine's thump, quickening as the reader does.
 *
 * Every voice is built per play and disconnects itself when its last source
 * ends. Mute, fades and tab visibility belong to `output`. This module only
 * promises that nothing it schedules can sound after `dispose`.
 */
export type MemorySfx = {
  /** Called every animation frame with the scene on screen (its art key) and its scroll progress 0..1. Fire cues as progress passes their marks moving forward; never when scrolling backward; re-arm a scene's cues once the reader has left it and comes back; skip any cue whose mark was jumped over by more than about 0.2 in a single frame (fast scrolling or jumping should stay silent). */
  update(art: string, progress: number): void;
  /** Called every frame on the bicycle scenes with how fast the reader is scrolling, in screen heights per second (0 when still). In `rush` and `ride` it plays pedalling that follows the speed and is silent within about a quarter second of stopping, even if frames stop arriving. */
  ride(art: string, speed: number): void;
  /** Stop everything and disconnect. */
  dispose(): void;
};

export type Cue =
  | "tap" | "cheat" | "brick" | "powerDown" | "wonder" | "sigh" | "clock" | "horn"
  | "rustle" | "take" | "thought" | "arpeggio" | "bell" | "shutter" | "sink"
  | "crinkle" | "glint" | "musicBox" | "chime" | "swish" | "chord"
  | "warmth" | "kick" | "whistle" | "cheer" | "carrom" | "page" | "scribble" | "flick" | "knock" | "yes"
  | "hurry" | "done" | "puff" | "sparkle" | "rev" | "crunch" | "slurp" | "dim" | "projector" | "heartbeat"
  | "sting" | "popcorn" | "fridge" | "fizz" | "sip" | "wrapper" | "toy" | "camera" | "clink" | "steps"
  | "clap" | "phrase"
  | "schoolbell" | "zip" | "jingle" | "chalk" | "chatter" | "bus" | "sticker" | "byebye";

/** A cue at a point in its scene's scroll. `step` picks the key, note or heave in a series. */
export type Mark = { art: string; at: number; cue: Cue; step?: number };

/** Every cue in Game Console & Ice Tubes, where it plays. Retime here. Scenes left out stay silent on purpose. */
export const GAME_CONSOLE_MARKS: readonly Mark[] = [
  // HESOYAM, one key at a time, unevenly as a child types, then the game's little nod
  { art: "laptop", at: 0.25, cue: "tap", step: 0 },
  { art: "laptop", at: 0.272, cue: "tap", step: 1 },
  { art: "laptop", at: 0.291, cue: "tap", step: 2 },
  { art: "laptop", at: 0.316, cue: "tap", step: 3 },
  { art: "laptop", at: 0.337, cue: "tap", step: 4 },
  { art: "laptop", at: 0.358, cue: "tap", step: 5 },
  { art: "laptop", at: 0.384, cue: "tap", step: 6 },
  { art: "laptop", at: 0.5, cue: "cheat" },
  // the brick game's tune, and then the day it stopped working
  { art: "brick", at: 0.2, cue: "brick" },
  { art: "brick", at: 0.7, cue: "powerDown" },
  // the thought cloud filling in as he talks (.05–.35): one rising glint per part of it
  { art: "console", at: 0.1, cue: "wonder", step: 0 },
  { art: "console", at: 0.16, cue: "wonder", step: 1 },
  { art: "console", at: 0.22, cue: "wonder", step: 2 },
  { art: "console", at: 0.28, cue: "wonder", step: 3 },
  { art: "price", at: 0.3, cue: "sigh" },
  { art: "packed", at: 0.1, cue: "clock" },
  { art: "packed", at: 0.55, cue: "horn" },
  { art: "gift", at: 0.3, cue: "rustle" },
  { art: "taking", at: 0.2, cue: "take" },
  { art: "pocket", at: 0.12, cue: "clock" },
  { art: "pocket", at: 0.24, cue: "thought" },
  { art: "permission", at: 0.45, cue: "arpeggio" },
  { art: "rush", at: 0.15, cue: "bell" },
  // the shutter lifted in two heaves, across .3–.55
  { art: "shop", at: 0.3, cue: "shutter", step: 0 },
  { art: "shop", at: 0.44, cue: "shutter", step: 1 },
  // The hard cut to his face lands halfway through the shop's handover
  // (HANDOVER .8 plus half of the last .2), before `empty` has progress of its
  // own, so the note is marked on the shop. If the cut moves into `empty`,
  // this becomes { art: "empty", at: 0.02 }.
  { art: "shop", at: 0.9, cue: "sink" },
  { art: "ice", at: 0.2, cue: "crinkle" },
  { art: "ice", at: 0.5, cue: "glint" },
  { art: "after", at: 0.35, cue: "musicBox" },
  // the five tubes fanning out (.44–.72), the console sliding in (.58–.76), the title (.78)
  { art: "finale", at: 0.47, cue: "chime", step: 0 },
  { art: "finale", at: 0.51, cue: "chime", step: 1 },
  { art: "finale", at: 0.55, cue: "chime", step: 2 },
  { art: "finale", at: 0.59, cue: "chime", step: 3 },
  { art: "finale", at: 0.63, cue: "chime", step: 4 },
  { art: "finale", at: 0.61, cue: "swish" },
  { art: "finale", at: 0.79, cue: "chord" },
];

/** Every cue in First Movie & a Burger, where it plays. Its own sounds, in the same warm, short hand. */
export const FIRST_MOVIE_MARKS: readonly Mark[] = [
  // a film starting up behind the title
  { art: "cover", at: 0.18, cue: "projector" },
  { art: "couple", at: 0.2, cue: "warmth" },
  // two shots on the carrom board, each a click, a clack, and a coin dropping into the pocket
  { art: "games", at: 0.22, cue: "carrom", step: 0 },
  { art: "games", at: 0.56, cue: "carrom", step: 1 },
  { art: "english", at: 0.2, cue: "page" },
  { art: "english", at: 0.5, cue: "scribble", step: 0 },
  // FIFA on Anna's phone: two touches, the crowd, the whistle
  { art: "phone", at: 0.22, cue: "kick", step: 0 },
  { art: "phone", at: 0.3, cue: "kick", step: 1 },
  { art: "phone", at: 0.4, cue: "cheer" },
  { art: "phone", at: 0.62, cue: "whistle" },
  { art: "ticket", at: 0.25, cue: "flick" },
  // a knock at our door, and Amma's yes
  { art: "asking", at: 0.1, cue: "knock" },
  { art: "asking", at: 0.45, cue: "yes" },
  // the clock running while I race through it, and done
  { art: "homework", at: 0.1, cue: "hurry", step: 0 },
  { art: "homework", at: 0.35, cue: "scribble", step: 1 },
  { art: "homework", at: 0.55, cue: "hurry", step: 1 },
  { art: "homework", at: 0.76, cue: "done" },
  { art: "ready", at: 0.2, cue: "puff" },
  { art: "ready", at: 0.45, cue: "sparkle" },
  { art: "avenger", at: 0.08, cue: "rev" },
  { art: "panipuri", at: 0.25, cue: "crunch", step: 0 },
  { art: "panipuri", at: 0.5, cue: "slurp" },
  { art: "panipuri", at: 0.66, cue: "crunch", step: 1 },
  // the lights going down, the projector, the man on the screen, my heart
  { art: "theatre", at: 0.08, cue: "dim" },
  { art: "theatre", at: 0.2, cue: "projector" },
  { art: "theatre", at: 0.36, cue: "sting" },
  { art: "theatre", at: 0.56, cue: "heartbeat" },
  { art: "counter", at: 0.15, cue: "popcorn" },
  { art: "counter", at: 0.5, cue: "fridge" },
  { art: "drink", at: 0.15, cue: "fizz" },
  { art: "drink", at: 0.4, cue: "sip" },
  { art: "drink", at: 0.62, cue: "crunch", step: 1 },
  { art: "burger", at: 0.2, cue: "wrapper" },
  { art: "burger", at: 0.48, cue: "toy" },
  { art: "photo", at: 0.26, cue: "camera" },
  { art: "home", at: 0.2, cue: "clink" },
  { art: "home", at: 0.5, cue: "sip" },
  // the nightmare: my heart, his steps coming, and him
  { art: "night", at: 0.1, cue: "heartbeat" },
  { art: "night", at: 0.34, cue: "steps" },
  { art: "night", at: 0.56, cue: "sting" },
  { art: "after", at: 0.35, cue: "warmth" },
  { art: "money", at: 0.4, cue: "musicBox" },
  { art: "life", at: 0.4, cue: "phrase" },
  // the turtle stepping out of my hand (.44–.66), the clapperboard landing (.66), the title (.78)
  { art: "finale", at: 0.3, cue: "chime", step: 0 },
  { art: "finale", at: 0.46, cue: "swish" },
  { art: "finale", at: 0.52, cue: "chime", step: 2 },
  { art: "finale", at: 0.66, cue: "clap" },
  { art: "finale", at: 0.72, cue: "chime", step: 4 },
  { art: "finale", at: 0.79, cue: "chord" },
];

/** Every cue in Last Exam & a Heart Keychain. */
export const HEART_KEYCHAIN_MARKS: readonly Mark[] = [
  { art: "cover", at: 0.2, cue: "jingle" },
  // the last paper: my pencil, the holidays in my head, a page turned
  { art: "exam", at: 0.16, cue: "scribble", step: 0 },
  { art: "exam", at: 0.36, cue: "thought" },
  { art: "exam", at: 0.62, cue: "page" },
  // the clock I kept checking, and my answers getting shorter until I knew I'd pass
  { art: "clock", at: 0.1, cue: "clock" },
  { art: "clock", at: 0.42, cue: "scribble", step: 0 },
  { art: "clock", at: 0.62, cue: "scribble", step: 1 },
  { art: "clock", at: 0.78, cue: "done" },
  { art: "shy", at: 0.35, cue: "warmth" },
  { art: "chat", at: 0.2, cue: "chatter" },
  { art: "chat", at: 0.6, cue: "thought" },
  // packing the gifts: the bag's zip, toffee wrappers, a sticker
  { art: "gifts", at: 0.12, cue: "zip" },
  { art: "gifts", at: 0.35, cue: "crinkle" },
  { art: "gifts", at: 0.56, cue: "sticker" },
  { art: "keychain", at: 0.2, cue: "jingle" },
  { art: "keychain", at: 0.45, cue: "sparkle" },
  { art: "bag", at: 0.35, cue: "zip" },
  // the bell after the last paper, chalk on the board, the class talking
  { art: "holidays", at: 0.06, cue: "schoolbell" },
  { art: "holidays", at: 0.3, cue: "chalk" },
  { art: "holidays", at: 0.52, cue: "chatter" },
  { art: "giving", at: 0.22, cue: "jingle" },
  { art: "giving", at: 0.5, cue: "thought" },
  { art: "bye", at: 0.3, cue: "byebye" },
  { art: "bus", at: 0.12, cue: "bus" },
  // the years after: a bell as seventh and eighth begin, then my books
  { art: "apart", at: 0.08, cue: "schoolbell" },
  { art: "apart", at: 0.36, cue: "schoolbell" },
  { art: "apart", at: 0.66, cue: "page" },
  { art: "innocence", at: 0.4, cue: "musicBox" },
  { art: "first", at: 0.4, cue: "phrase" },
  // the keychain stepping out of my hand (.44–.66), the pad and pencil arriving, the title (.78)
  { art: "finale", at: 0.3, cue: "chime", step: 0 },
  { art: "finale", at: 0.46, cue: "swish" },
  { art: "finale", at: 0.52, cue: "chime", step: 2 },
  { art: "finale", at: 0.7, cue: "chime", step: 4 },
  { art: "finale", at: 0.79, cue: "chord" },
];

/**
 * The pedalling texture `ride` plays, per scene. Stroke counts follow the
 * drawing: the cranks turn 7 times across `rush` and 2.4 times across `ride`
 * (TURNS in memory-bicycle), two pedal strokes a turn, so each chain tick
 * lands as a pedal goes down.
 */
type Ride = {
  /** pedal strokes across the scene */
  strokes: number;
  /** freewheel clicks a second, per screen height a second of scrolling, and their ceiling */
  clicks: number;
  maxClicks: number;
  /** the scroll speed, in screen heights a second, that reaches full level */
  full: number;
  /** the chain tick's peak at full speed; the clicks and road hiss sit under it */
  level: number;
  /** centres of the road hiss, the chain tick and the freewheel click (Hz) */
  hiss: number;
  tick: number;
  click: number;
};
/** The Avenger's engine `ride` plays, per scene: its firing rate and exhaust tone across the reader's speed. */
type Motor = { pulse: readonly [number, number]; tone: readonly [number, number]; level: number; full: number };
const MOTORBIKE: Partial<Record<string, Motor>> = {
  // setting off: an eager thump that climbs as the reader hurries
  avenger: { pulse: [11, 26], tone: [74, 112], level: db(-13), full: 1 },
  // home late at night: a low, lazy putter
  home: { pulse: [9, 16], tone: [62, 82], level: db(-17), full: 0.7 },
};

const BICYCLE: Partial<Record<string, Ride>> = {
  // the ride there: brisk, bright and clearly there
  rush: { strokes: 14, clicks: 24, maxClicks: 34, full: 1.1, level: db(-10), hiss: 1400, tick: 1700, click: 3200 },
  // the ride home: unhurried strokes, darker and softer
  ride: { strokes: 4.8, clicks: 11, maxClicks: 14, full: 0.7, level: db(-15), hiss: 700, tick: 1150, click: 2400 },
};

// The bed is in F major, so the tunes stay on F major pentatonic (F G A C D),
// which sits under every one of its chords.
const NOTE = {
  D3: 146.83, F3: 174.61, A3: 220, C4: 261.63, F4: 349.23, G4: 392, A4: 440, C5: 523.25, D5: 587.33,
  F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66, F6: 1396.91, G6: 1567.98, A6: 1760,
} as const;

/** HESOYAM: each key a little higher or lower, firmer or lighter. [pitch, level] */
const KEYS = [[1, 1], [0.94, 0.85], [1.05, 0.95], [0.98, 0.8], [1.08, 1], [0.96, 0.9], [1.02, 1.05]] as const;
const WONDER = [NOTE.A5, NOTE.C6, NOTE.D6, NOTE.F6] as const;
const WONDER_PAN = [-0.3, 0.2, -0.1, 0.3] as const;
const CHIMES = [NOTE.C6, NOTE.D6, NOTE.F6, NOTE.G6, NOTE.A6] as const;
/** The brick game's start-up tune. [seconds, pitch, held for] */
const BRICK = [[0, NOTE.A5, 0.055], [0.085, NOTE.C6, 0.055], [0.17, NOTE.D6, 0.055], [0.255, NOTE.F6, 0.15]] as const;
/** Four clock ticks that come up out of the quiet and go back into it. */
const CLOCK = [0.7, 0.9, 1, 0.75] as const;
/** Paper crinkles. [seconds, centre Hz, decay, level] */
const PAPER = [
  [0, 2400, 0.05, 0.7], [0.045, 3100, 0.03, 0.5], [0.1, 2000, 0.07, 1],
  [0.135, 3500, 0.025, 0.45], [0.19, 2700, 0.05, 0.8], [0.27, 2200, 0.08, 0.6],
] as const;
/** Felt piano partials. [ratio, level, decay scale]; levels sum to 1, so a peak is the worst case. */
const FELT = [[1, 0.74, 1], [2, 0.2, 0.5], [3, 0.06, 0.28]] as const;
/** A thin bell dome over F6: inharmonic partials, the strongest doubled a few cents sharp so it shimmers. [ratio, level, ring] */
const BELL = [[1, 0.55, 1.2], [1.0032, 0.4, 1], [1.52, 0.42, 0.8], [2.21, 0.26, 0.55], [2.93, 0.12, 0.35]] as const;
/** Tring tring: each ring is the thumb lever's striker hitting the dome four times. [seconds, level] */
const TRING = [
  [0, 0.8], [0.032, 1], [0.064, 0.85], [0.096, 0.7],
  [0.3, 0.75], [0.332, 0.95], [0.364, 0.8], [0.396, 0.62],
] as const;
/** The title chord: F major with the ninth on top, as the bed's own first chord. [pitch, level] */
const CHORD = [[NOTE.F3, 0.85], [NOTE.C4, 0.8], [NOTE.A4, 0.7], [NOTE.G5, 0.3]] as const;

/** master trim; each voice sets its own peak in dBFS */
const LEVEL = 1;
/** -80 dB: where exponential fades end, since they can never reach 0 */
const FLOOR = 0.0001;
/** schedule just ahead of the audio clock, so no attack starts late and clicks */
const LEAD = 0.015;
/** cues crossed in one frame play in order, this far apart... */
const GAP = 0.05;
/** ...and one that would have to wait longer than this is let go */
const BACKLOG = 0.3;
/** a forward step larger than this in one frame is a jump, and plays nothing */
const MAX_STEP = 0.2;
/** how far ahead the freewheel's clicks are scheduled */
const AHEAD = 0.05;
/** screen heights a second; slower than this is standing still */
const STILL = 0.03;
/** Web Audio's low/high-pass Q is in dB: -3.01 dB is Q 0.707, a flat Butterworth with no peak. */
const BUTTERWORTH = -3.01;
/** RMS of uniform white noise in -1..1 */
const NOISE_RMS = 1 / Math.sqrt(3);

const NO_MARKS: Mark[] = [];

function db(value: number) {
  return 10 ** (value / 20);
}

/** Silent at `at`, a linear rise to `peak`, then an exponential fall to silence. Returns the end time. */
function strike(param: AudioParam, at: number, peak: number, attack: number, decay: number) {
  const top = at + Math.max(0.002, attack);
  const end = top + Math.max(0.005, decay);
  param.setValueAtTime(0, at);
  param.linearRampToValueAtTime(Math.max(peak, FLOOR * 2), top);
  param.exponentialRampToValueAtTime(FLOOR, end);
  return end;
}

/** Silent at `at`, a linear rise to `peak`, held, then an exponential release. Returns the end time. */
function swell(param: AudioParam, at: number, peak: number, attack: number, hold: number, release: number) {
  const top = at + Math.max(0.002, attack);
  const fall = top + Math.max(0, hold);
  const end = fall + Math.max(0.005, release);
  const level = Math.max(peak, FLOOR * 2);
  param.setValueAtTime(0, at);
  param.linearRampToValueAtTime(level, top);
  param.setValueAtTime(level, fall);
  param.exponentialRampToValueAtTime(FLOOR, end);
  return end;
}

/**
 * Quick repeated strikes on one envelope, for the bell. Each hit rises in 2 ms.
 * Close together, the striker damps the dome to half before the next; further
 * apart, it rings freely. The last hit rings out over `ring`. Every segment
 * starts where the last ended, so nothing steps. Returns the end time.
 */
function hits(param: AudioParam, at: number, pattern: readonly (readonly [number, number])[], peak: number, ring: number) {
  param.setValueAtTime(0, at);
  let top = at;
  pattern.forEach(([offset, level], index) => {
    const height = Math.max(peak * level, FLOOR * 2);
    top = at + offset + 0.002;
    param.linearRampToValueAtTime(height, top);
    const next = pattern[index + 1];
    if (!next) return;
    const gap = at + next[0] - top;
    const left = gap < 0.06 ? height * 0.5 : height * (FLOOR / height) ** (gap / ring);
    param.exponentialRampToValueAtTime(Math.max(left, FLOOR), at + next[0]);
  });
  param.exponentialRampToValueAtTime(FLOOR, top + ring);
  return top + ring;
}

/** Two seconds of white noise, made once and shared by every grain and the road hiss. */
function makeNoise(context: BaseAudioContext) {
  const length = Math.round(context.sampleRate * 2);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 7919;
  for (let i = 0; i < length; i++) {
    seed = (seed * 16807) % 2147483647;
    data[i] = (seed / 2147483647) * 2 - 1;
  }
  return buffer;
}

type Source = OscillatorNode | AudioBufferSourceNode;
type Add = (source: Source, own: AudioNode[], start: number, end: number, offset?: number) => void;
type Tone = { at: number; freq: number; peak: number; attack: number; decay: number; type?: OscillatorType };
type Grain = { at: number; freq: number; q: number; peak: number; attack: number; decay: number; hold?: number; type?: "bandpass" | "lowpass" };
type Engine = {
  art: string;
  motor: Motor;
  bus: GainNode;
  osc: OscillatorNode;
  lfo: OscillatorNode;
  rumble: AudioBufferSourceNode;
  speed: number;
  clock: number;
  moved: number;
};
type Bike = {
  art: string;
  ride: Ride;
  bus: GainNode;
  band: BiquadFilterNode;
  hiss: AudioBufferSourceNode;
  /** smoothed scroll speed */
  speed: number;
  /** main-thread seconds at the last frame, and when the reader last moved */
  clock: number;
  moved: number;
  nextClick: number;
  stroke: number;
};

const silent: MemorySfx = { update() {}, ride() {}, dispose() {} };

export function createMemorySfx(context: AudioContext, output: AudioNode, cues: readonly Mark[]): MemorySfx {
  const marksByArt = new Map<string, Mark[]>();
  for (const mark of [...cues].sort((a, b) => a.at - b.at)) {
    marksByArt.set(mark.art, [...(marksByArt.get(mark.art) ?? []), mark]);
  }
  let input: BiquadFilterNode;
  let ceiling: BiquadFilterNode;
  let master: GainNode;
  let noise: AudioBuffer;
  try {
    // Everything meets here: a high-pass keeps the low end light, a low-pass
    // keeps the top soft, and one gain goes on to `output`.
    input = context.createBiquadFilter();
    input.type = "highpass";
    input.frequency.value = 120;
    input.Q.value = BUTTERWORTH;
    ceiling = context.createBiquadFilter();
    ceiling.type = "lowpass";
    ceiling.frequency.value = 6000;
    ceiling.Q.value = BUTTERWORTH;
    master = context.createGain();
    master.gain.value = LEVEL;
    input.connect(ceiling);
    ceiling.connect(master);
    master.connect(output);
    noise = makeNoise(context);
  } catch {
    // A closed or broken context: the story still runs, silently.
    return silent;
  }

  const sampleRate = context.sampleRate;
  const live = new Set<Source>();
  let disposed = false;
  let nextFree = 0;
  let scene = "";
  let progress = 0;
  let marks = NO_MARKS;
  // which of this scene's marks have played on this visit, one bit each
  let fired = 0;
  let bike: Bike | null = null;
  let engine: Engine | null = null;

  const filter = (type: BiquadFilterType, frequency: number, q: number) => {
    const node = context.createBiquadFilter();
    node.type = type;
    node.frequency.value = frequency;
    node.Q.value = q;
    return node;
  };

  const panner = (pan: number) => {
    if (!pan || typeof context.createStereoPanner !== "function") return null;
    const node = context.createStereoPanner();
    node.pan.value = pan;
    return node;
  };
  const panned = (pan: number): AudioNode[] => {
    const node = panner(pan);
    return node ? [node] : [];
  };

  /**
   * The likely peak of the shared noise through a filter: its RMS, scaled by
   * the filter's noise bandwidth, times a crest factor. Measured offline, short
   * strikes peak lower than long held swells, so each has its own crest.
   */
  const noisePeak = (type: "bandpass" | "lowpass", frequency: number, q: number, held: boolean) => {
    const bandwidth = type === "bandpass" ? (Math.PI / 2) * (frequency / q) : 1.11 * frequency;
    return (held ? 4.2 : 2.7) * NOISE_RMS * Math.sqrt(Math.min(1, bandwidth / (sampleRate / 2)));
  };

  /**
   * A group of sources sharing `shared` nodes (chained in order) into `into`.
   * Each source disconnects with its own nodes when it ends; the shared ones
   * go once the last source has.
   */
  const voiceInto = (into: AudioNode, ...shared: AudioNode[]): Add => {
    const chain = (nodes: AudioNode[]) => {
      for (let i = 1; i < nodes.length; i++) nodes[i - 1].connect(nodes[i]);
    };
    chain([...shared, into]);
    const head = shared[0] ?? into;
    let pending = 0;
    return (source, own, start, end, offset) => {
      chain([source, ...own, head]);
      pending++;
      live.add(source);
      source.onended = () => {
        live.delete(source);
        source.disconnect();
        own.forEach((node) => node.disconnect());
        if (--pending === 0) shared.forEach((node) => node.disconnect());
      };
      if ("buffer" in source) source.start(start, offset ?? 0);
      else source.start(start);
      source.stop(end + 0.01);
    };
  };
  const voice = (...shared: AudioNode[]) => voiceInto(input, ...shared);

  /** One oscillator under a percussive envelope, returned so a caller can bend its pitch. */
  const tone = (add: Add, { at, freq, peak, attack, decay, type = "sine" }: Tone) => {
    const osc = context.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = context.createGain();
    add(osc, [gain], at, strike(gain.gain, at, peak, attack, decay));
    return osc;
  };

  /** A slice of the shared noise through one filter, under a strike, or a held swell when `hold` is given. */
  const grain = (add: Add, { at, freq, q, peak, attack, decay, hold, type = "bandpass" }: Grain) => {
    const source = context.createBufferSource();
    source.buffer = noise;
    const band = filter(type, freq, q);
    const gain = context.createGain();
    const level = peak / noisePeak(type, freq, q, hold !== undefined);
    const end = hold === undefined ? strike(gain.gain, at, level, attack, decay) : swell(gain.gain, at, level, attack, hold, decay);
    // a different stretch of the noise each time, so no two grains are alike
    const offset = Math.random() * Math.max(0, noise.duration - (end - at) - 0.05);
    add(source, [band, gain], at, end, offset);
  };

  /** Glass: a pure tone, a twin a few cents above that slowly beats against it, and a faint overtone gone almost at once. */
  const glass = (at: number, freq: number, peak: number, decay: number, pan = 0) => {
    const add = voice(filter("lowpass", 5200, BUTTERWORTH), ...panned(pan));
    tone(add, { at, freq, peak: peak * 0.5, attack: 0.006, decay });
    tone(add, { at, freq: freq * 1.0035, peak: peak * 0.38, attack: 0.006, decay: decay * 0.9 });
    tone(add, { at, freq: freq * 2.76, peak: peak * 0.12, attack: 0.004, decay: 0.3 });
  };

  /** Music box: a clear fundamental, a whisper of octave, and the tine's tiny 'ting', gone in a few milliseconds. */
  const musicBox = (at: number, freq: number, peak: number, decay: number, pan = 0) => {
    const add = voice(filter("lowpass", 5600, BUTTERWORTH), ...panned(pan));
    tone(add, { at, freq, peak: peak * 0.84, attack: 0.003, decay });
    tone(add, { at, freq: freq * 2, peak: peak * 0.1, attack: 0.003, decay: decay * 0.35 });
    tone(add, { at, freq: freq * 4.2, peak: peak * 0.06, attack: 0.002, decay: 0.05 });
  };

  /** Felt piano: a round fundamental and two quieter partials that fade sooner, under a soft low-pass. */
  const felt = (at: number, freq: number, peak: number, decay: number, cutoff = 1600) => {
    const add = voice(filter("lowpass", cutoff, BUTTERWORTH));
    return FELT.map(([ratio, level, fade]) => tone(add, { at, freq: freq * ratio, peak: peak * level, attack: 0.012, decay: decay * fade }));
  };

  /** A warm held tone for the last chord: mostly fundamental, swelling in softly and ringing long. */
  const warm = (at: number, freq: number, peak: number, decay: number) => {
    const add = voice(filter("lowpass", 2000, BUTTERWORTH));
    tone(add, { at, freq, peak: peak * 0.82, attack: 0.06, decay });
    tone(add, { at, freq: freq * 2, peak: peak * 0.14, attack: 0.05, decay: decay * 0.5 });
    tone(add, { at, freq: freq * 3, peak: peak * 0.04, attack: 0.04, decay: decay * 0.25 });
  };

  /** A warm pluck: a triangle string whose brightness closes quickly after it is picked. */
  const pluck = (at: number, freq: number, peak: number) => {
    const shade = filter("lowpass", 2800, BUTTERWORTH);
    shade.frequency.setValueAtTime(2800, at);
    shade.frequency.exponentialRampToValueAtTime(650, at + 0.25);
    const add = voice(shade);
    tone(add, { at, freq, type: "triangle", peak: peak * 0.8, attack: 0.003, decay: 1.2 });
    tone(add, { at, freq: freq * 2, peak: peak * 0.2, attack: 0.003, decay: 0.45 });
  };

  // Peaks are dBFS at the master. Noise grains are set by their likely peak, so
  // most land a few dB under the figure written and the loudest about on it.
  const voices: Record<Cue, (at: number, step: number) => void> = {
    // An old laptop key: a short plastic click over a small rounded thump,
    // then the faint knock of it bottoming out.
    tap(at, step) {
      const [pitch, level] = KEYS[step % KEYS.length];
      const add = voice();
      grain(add, { at, freq: 1700 * pitch, q: 1.6, peak: db(-13) * level, attack: 0.002, decay: 0.03 });
      grain(add, { at: at + 0.009, freq: 3000 * pitch, q: 2, peak: db(-20) * level, attack: 0.002, decay: 0.014 });
      const body = tone(add, { at, freq: 240 * pitch, peak: db(-19) * level, attack: 0.002, decay: 0.05 });
      body.frequency.setValueAtTime(240 * pitch, at);
      body.frequency.exponentialRampToValueAtTime(170 * pitch, at + 0.04);
    },
    // Cheat activated: two small soft blips, up a fourth.
    cheat(at) {
      const add = voice(filter("lowpass", 3200, BUTTERWORTH));
      tone(add, { at, freq: NOTE.C6, type: "triangle", peak: db(-12), attack: 0.004, decay: 0.14 });
      tone(add, { at: at + 0.085, freq: NOTE.F6, type: "triangle", peak: db(-12), attack: 0.004, decay: 0.34 });
    },
    // The brick game's start-up tune: square-wave notes gated on and off like
    // its little speaker, with the corners taken off by a low-pass.
    brick(at) {
      const add = voice(filter("lowpass", 2300, BUTTERWORTH));
      for (const [offset, freq, gate] of BRICK) {
        const osc = context.createOscillator();
        osc.type = "square";
        osc.frequency.value = freq;
        const gain = context.createGain();
        add(osc, [gain], at + offset, swell(gain.gain, at + offset, db(-14), 0.003, gate, 0.04));
      }
    },
    // ...and then it stopped working: the pitch steps down three octaves, as
    // the old chips did, while the tone dulls and fades.
    powerDown(at) {
      const shade = filter("lowpass", 2400, BUTTERWORTH);
      shade.frequency.setValueAtTime(2400, at);
      shade.frequency.exponentialRampToValueAtTime(320, at + 0.56);
      const add = voice(shade);
      const osc = context.createOscillator();
      osc.type = "square";
      for (let index = 0; index < 12; index++) osc.frequency.setValueAtTime(NOTE.C6 * 0.125 ** (index / 11), at + index * 0.047);
      const gain = context.createGain();
      add(osc, [gain], at, swell(gain.gain, at, db(-14), 0.004, 0.1, 0.52));
    },
    // The thought cloud filling in: a rising glint for each part of it, over one
    // soft breath of air at the start.
    wonder(at, step) {
      glass(at, WONDER[step % WONDER.length], db(-13), 1.6, WONDER_PAN[step % WONDER_PAN.length]);
      if (step === 0) grain(voice(filter("lowpass", 4200, BUTTERWORTH)), { at, freq: 2800, q: 0.9, peak: db(-21), attack: 0.3, hold: 0.1, decay: 0.7 });
    },
    // The thought letting go: a step down from G to F on a soft felted note,
    // the second sagging a little as it fades.
    sigh(at) {
      felt(at, NOTE.G4, db(-13), 1.1);
      const second = at + 0.34;
      felt(second, NOTE.F4, db(-11), 1.9).forEach((osc) => {
        osc.detune.setValueAtTime(0, second + 0.2);
        osc.detune.linearRampToValueAtTime(-14, second + 1.6);
      });
    },
    // A clock in the quiet house: four ticks, each 'tock' lower and woodier.
    clock(at) {
      const add = voice();
      CLOCK.forEach((level, index) => {
        const time = at + index * 0.56;
        const tock = index % 2 === 1;
        grain(add, { at: time, freq: tock ? 2050 : 2500, q: 4, peak: db(-11) * level, attack: 0.002, decay: 0.024 });
        grain(add, { at: time, freq: tock ? 820 : 950, q: 6, peak: db(-19) * level, attack: 0.002, decay: 0.04 });
      });
    },
    // A train far off across the town: two reedy tones a minor third apart,
    // smothered by two low-passes, sagging up to pitch as the air arrives.
    horn(at) {
      const add = voice(filter("lowpass", 560, BUTTERWORTH), filter("lowpass", 900, BUTTERWORTH));
      for (const [freq, level] of [[NOTE.A3, 0.55], [NOTE.C4, 0.45]] as const) {
        const osc = context.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.detune.setValueAtTime(-30, at);
        osc.detune.linearRampToValueAtTime(0, at + 0.3);
        const gain = context.createGain();
        add(osc, [gain], at, swell(gain.gain, at, db(-14) * level, 0.45, 0.9, 1.3));
      }
    },
    // Folded notes held out: a few soft, broad crinkles of paper.
    rustle(at) {
      const add = voice(filter("lowpass", 4800, BUTTERWORTH));
      for (const [offset, freq, decay, level] of PAPER) grain(add, { at: at + offset, freq, q: 0.9, peak: db(-10) * level, attack: 0.004, decay });
    },
    // Taking them: a smaller rustle, then a warm pluck as they are in his hand.
    take(at) {
      const add = voice(filter("lowpass", 4800, BUTTERWORTH));
      for (const [offset, freq, decay, level] of PAPER.slice(0, 3)) grain(add, { at: at + offset, freq, q: 0.9, peak: db(-12) * level, attack: 0.004, decay });
      pluck(at + 0.16, NOTE.A4, db(-11));
    },
    // The console as a thought: two small glints, up a fourth.
    thought(at) {
      glass(at, NOTE.C6, db(-14), 1.3, -0.2);
      glass(at + 0.13, NOTE.F6, db(-14), 1.7, 0.2);
    },
    // Amma's yes: a small music-box run up the F major chord, the top note left ringing.
    arpeggio(at) {
      [NOTE.F5, NOTE.A5, NOTE.C6, NOTE.F6].forEach((freq, index) => {
        musicBox(at + index * 0.11, freq, db(-13) * (0.85 + index * 0.05), index === 3 ? 2.4 : 1.3, -0.24 + index * 0.16);
      });
    },
    // Tring tring: the dome's partials struck four times for each ring, with the
    // striker's light touch on the metal, softened above 4 kHz.
    bell(at) {
      const add = voice(filter("lowpass", 4200, BUTTERWORTH), ...panned(0.18));
      const unit = db(-12) / BELL.reduce((sum, [, level]) => sum + level, 0);
      for (const [ratio, level, ring] of BELL) {
        const osc = context.createOscillator();
        osc.frequency.value = NOTE.F6 * ratio;
        const gain = context.createGain();
        add(osc, [gain], at, hits(gain.gain, at, TRING, unit * level, ring));
      }
      for (const [offset, level] of TRING) grain(add, { at: at + offset, freq: 2600, q: 2.5, peak: db(-22) * level, attack: 0.002, decay: 0.008 });
    },
    // The shutter heaved up: corrugated slats knocking as they wind onto the
    // drum, low and muffled, quickening and easing with each pull, over the
    // drum's soft roll. The second heave ends with it settling at the top.
    shutter(at, step) {
      const length = step ? 0.85 : 1.05;
      const add = voice(filter("lowpass", 1500, BUTTERWORTH));
      grain(add, { type: "lowpass", at, freq: 260, q: BUTTERWORTH, peak: db(-15), attack: 0.18, hold: length - 0.4, decay: 0.3 });
      let time = 0.03;
      for (let index = 0; time < length - 0.06; index++) {
        const lift = Math.sin((Math.PI * time) / length);
        const level = (0.45 + 0.55 * lift) * (0.7 + 0.3 * Math.random());
        grain(add, { at: at + time, freq: 420 + Math.random() * 320, q: 2.6, peak: db(-10) * level, attack: 0.002, decay: 0.03 + Math.random() * 0.02 });
        // now and then, the faint ring of the metal itself
        if (index % 4 === 2) grain(add, { at: at + time + 0.004, freq: 1650 + Math.random() * 550, q: 9, peak: db(-18) * level, attack: 0.002, decay: 0.08 });
        time += (0.85 + Math.random() * 0.3) / (13 + 21 * lift ** 0.7);
      }
      if (step) {
        const top = at + length + 0.03;
        grain(add, { type: "lowpass", at: top, freq: 420, q: BUTTERWORTH, peak: db(-12), attack: 0.004, decay: 0.14 });
        tone(add, { at: top, freq: 165, peak: db(-16), attack: 0.004, decay: 0.16 });
      }
    },
    // Sold out: one low, felted D, the relative minor's root under the bed's F,
    // sagging as it fades.
    sink(at) {
      felt(at, NOTE.D3, db(-9), 3.4, 1100).forEach((osc) => {
        osc.detune.setValueAtTime(0, at + 0.3);
        osc.detune.linearRampToValueAtTime(-22, at + 3);
      });
    },
    // Ice tubes in his hands: thin plastic crackling in tiny bright grains, over
    // the soft give of the pouches.
    crinkle(at) {
      const add = voice(filter("lowpass", 5200, BUTTERWORTH));
      let time = 0;
      for (let index = 0; index < 11; index++) {
        grain(add, { at: at + time, freq: 2800 + Math.random() * 1800, q: 1.5, peak: db(-12) * (0.45 + Math.random() * 0.55), attack: 0.002, decay: 0.008 + Math.random() * 0.016 });
        time += 0.012 + Math.random() * 0.04;
      }
      grain(add, { at: at + 0.04, freq: 1300, q: 1.1, peak: db(-16), attack: 0.02, decay: 0.12 });
    },
    // the cold on them: one high glass glint
    glint(at) {
      glass(at, NOTE.A6, db(-14), 1.8, 0.22);
    },
    // what stayed: one music-box note, the bed's own first A
    musicBox(at) {
      musicBox(at, NOTE.A5, db(-14), 2.6, 0.1);
    },
    // The tubes fanning out: a rising glass note for each, moving left to right with the fan.
    chime(at, step) {
      glass(at, CHIMES[step % CHIMES.length], db(-13), 2.2, -0.4 + (step % CHIMES.length) * 0.2);
    },
    // The console sliding in from the left: a breath of air over cloth, not a
    // whoosh. A broad band drifts up a little as it passes toward the middle.
    swish(at) {
      const band = filter("bandpass", 900, 0.7);
      band.frequency.setValueAtTime(900, at);
      band.frequency.exponentialRampToValueAtTime(1700, at + 0.6);
      const travel = panner(-0.45);
      travel?.pan.setValueAtTime(-0.45, at);
      travel?.pan.linearRampToValueAtTime(0, at + 0.55);
      const add = voice(band, filter("lowpass", 3600, BUTTERWORTH), ...(travel ? [travel] : []));
      const source = context.createBufferSource();
      source.buffer = noise;
      const gain = context.createGain();
      const end = swell(gain.gain, at, db(-13) / noisePeak("bandpass", 1200, 0.7, true), 0.16, 0.06, 0.42);
      add(source, [gain], at, end, Math.random() * (noise.duration - 1));
    },
    // Their door: a warm hello, three soft notes up the chord.
    warmth(at) {
      [NOTE.F4, NOTE.A4, NOTE.C5].forEach((freq, index) => felt(at + index * 0.16, freq, db(-16), 1.6 + index * 0.3));
    },
    // FIFA: a boot on the ball, a thud and the slap of leather; the second touch lighter.
    kick(at, step) {
      const level = step ? 0.7 : 1;
      const add = voice(filter("lowpass", 3000, BUTTERWORTH));
      const thud = tone(add, { at, freq: 210, peak: db(-11) * level, attack: 0.002, decay: 0.09 });
      thud.frequency.setValueAtTime(210, at);
      thud.frequency.exponentialRampToValueAtTime(120, at + 0.08);
      grain(add, { at, freq: 1400, q: 1.2, peak: db(-14) * level, attack: 0.002, decay: 0.022 });
    },
    // The referee's pea whistle: a short toot, then a long one, trilling.
    whistle(at) {
      const add = voice(filter("lowpass", 4200, BUTTERWORTH), ...panned(0.15));
      for (const [offset, length] of [[0, 0.12], [0.2, 0.46]] as const) {
        const osc = context.createOscillator();
        const start = at + offset;
        for (let time = 0, high = true; time < length; time += 1 / 28, high = !high) osc.frequency.setValueAtTime(high ? 2960 : 2840, start + time);
        const gain = context.createGain();
        add(osc, [gain], start, swell(gain.gain, start, db(-20), 0.012, length - 0.06, 0.05));
      }
    },
    // The crowd as the ball goes in: a wide breath of voices, rising and falling away.
    cheer(at) {
      const add = voice(filter("lowpass", 3600, BUTTERWORTH));
      grain(add, { at, freq: 1050, q: 0.6, peak: db(-14), attack: 0.35, hold: 0.55, decay: 1.2 });
      grain(add, { at: at + 0.1, freq: 2100, q: 0.8, peak: db(-19), attack: 0.3, hold: 0.4, decay: 0.9 });
    },
    // A carrom shot: the striker's click, the coins clacking apart, one dropping into the pocket.
    carrom(at, step) {
      const add = voice(...panned(step ? 0.2 : -0.15));
      grain(add, { at, freq: 2600, q: 3, peak: db(-10), attack: 0.002, decay: 0.012 });
      grain(add, { at: at + 0.035, freq: 3400, q: 4, peak: db(-14), attack: 0.002, decay: 0.01 });
      grain(add, { at: at + 0.075, freq: 2900, q: 4, peak: db(-17), attack: 0.002, decay: 0.01 });
      const drop = at + 0.32 + step * 0.06;
      grain(add, { type: "lowpass", at: drop, freq: 420, q: BUTTERWORTH, peak: db(-13), attack: 0.003, decay: 0.08 });
      tone(add, { at: drop, freq: 220, peak: db(-18), attack: 0.003, decay: 0.07 });
    },
    // A page turned in her book: a soft sweep of paper, settling.
    page(at) {
      const band = filter("bandpass", 1800, 0.9);
      band.frequency.setValueAtTime(1800, at);
      band.frequency.exponentialRampToValueAtTime(3600, at + 0.22);
      const add = voice(band);
      const source = context.createBufferSource();
      source.buffer = noise;
      const gain = context.createGain();
      add(source, [gain], at, swell(gain.gain, at, db(-15) / noisePeak("bandpass", 2600, 0.9, true), 0.05, 0.05, 0.16), Math.random() * (noise.duration - 1));
      grain(voice(), { type: "lowpass", at: at + 0.24, freq: 700, q: BUTTERWORTH, peak: db(-18), attack: 0.004, decay: 0.05 });
    },
    // A pencil writing: three quick strokes of graphite on paper; faster when I'm in a hurry.
    scribble(at, step) {
      const add = voice(filter("lowpass", 5600, BUTTERWORTH));
      const pace = step ? 0.7 : 1;
      for (let stroke = 0; stroke < 3; stroke++) {
        const begin = at + stroke * 0.26 * pace;
        for (let index = 0; index < 6; index++) {
          grain(add, { at: begin + index * 0.024 * pace, freq: 3800 + Math.random() * 900, q: 2.5, peak: db(-19) * (0.6 + Math.random() * 0.4), attack: 0.003, decay: 0.025 + Math.random() * 0.02 });
        }
      }
    },
    // Akka holding up the tickets: two crisp flicks of card.
    flick(at) {
      const add = voice(filter("lowpass", 5000, BUTTERWORTH), ...panned(-0.15));
      grain(add, { at, freq: 3000, q: 1.4, peak: db(-12), attack: 0.002, decay: 0.02 });
      grain(add, { at: at + 0.09, freq: 2600, q: 1.4, peak: db(-14), attack: 0.002, decay: 0.025 });
      grain(add, { at: at + 0.12, freq: 2200, q: 0.9, peak: db(-20), attack: 0.01, decay: 0.08 });
    },
    // Three knocks on our wooden door.
    knock(at) {
      const add = voice(filter("lowpass", 1800, BUTTERWORTH));
      [1, 0.85, 0.95].forEach((level, index) => {
        const time = at + index * 0.18;
        grain(add, { at: time, freq: 380, q: 1.5, peak: db(-9) * level, attack: 0.002, decay: 0.05 });
        tone(add, { at: time, freq: 180, peak: db(-16) * level, attack: 0.002, decay: 0.06 });
      });
    },
    // Amma's yes: a warm plucked run up the chord, the top note left ringing.
    yes(at) {
      [NOTE.F4, NOTE.A4, NOTE.C5, NOTE.F5].forEach((freq, index) => pluck(at + index * 0.09, freq, db(-13) * (0.8 + index * 0.06)));
    },
    // The clock racing: ticks coming quicker and quicker.
    hurry(at, step) {
      const add = voice();
      let time = 0;
      for (let index = 0; index < 8; index++) {
        const tock = index % 2 === 1;
        grain(add, { at: at + time, freq: tock ? 2050 : 2500, q: 4, peak: db(-14) * (step ? 1 : 0.85), attack: 0.002, decay: 0.022 });
        time += 0.24 - index * 0.018;
      }
    },
    // Homework done: one small bell, and its fifth.
    done(at) {
      glass(at, NOTE.C6, db(-14), 1.5, 0.1);
      glass(at + 0.09, NOTE.G6, db(-17), 1.9, 0.25);
    },
    // Powder from the tin: two soft puffs.
    puff(at) {
      const add = voice();
      grain(add, { type: "lowpass", at, freq: 1600, q: BUTTERWORTH, peak: db(-15), attack: 0.01, decay: 0.13 });
      grain(add, { type: "lowpass", at: at + 0.24, freq: 1400, q: BUTTERWORTH, peak: db(-17), attack: 0.01, decay: 0.16 });
    },
    // The javadhu's scent: a little shimmer falling through the air.
    sparkle(at) {
      [NOTE.A6, NOTE.F6, NOTE.D6, NOTE.C6, NOTE.A5].forEach((freq, index) => glass(at + index * 0.07, freq, db(-19), 1, 0.3 - index * 0.12));
    },
    // The Avenger setting off: the single cylinder's thump quickening into a pull.
    rev(at) {
      const shade = filter("lowpass", 520, BUTTERWORTH);
      shade.frequency.setValueAtTime(420, at);
      shade.frequency.linearRampToValueAtTime(760, at + 1.2);
      const add = voice(shade);
      const osc = context.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(72, at);
      osc.frequency.linearRampToValueAtTime(118, at + 1.3);
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, at);
      let time = 0;
      for (let index = 0; time < 1.5; index++) {
        const rate = 10 + 18 * Math.min(1, time / 1.2);
        const level = db(-11) * Math.min(1, 0.55 + time) * (time > 1.2 ? 1 - (time - 1.2) / 0.3 : 1);
        gain.gain.linearRampToValueAtTime(Math.max(level, FLOOR * 2), at + time + 0.006);
        gain.gain.exponentialRampToValueAtTime(Math.max(level * 0.12, FLOOR), at + time + 0.8 / rate);
        time += 1 / rate;
      }
      gain.gain.exponentialRampToValueAtTime(FLOOR, at + time + 0.1);
      add(osc, [gain], at, at + time + 0.1);
    },
    // A puri cracking in my mouth, then a smaller crunch as I chew.
    crunch(at, step) {
      const add = voice(filter("lowpass", 4600, BUTTERWORTH));
      const level = step ? 0.75 : 1;
      let time = 0;
      for (let index = 0; index < 7; index++) {
        grain(add, { at: at + time, freq: 1500 + Math.random() * 1700, q: 1.2, peak: db(-11) * level * (0.5 + Math.random() * 0.5), attack: 0.002, decay: 0.015 + Math.random() * 0.02 });
        time += 0.008 + Math.random() * 0.014;
      }
      for (let index = 0; index < 3; index++) grain(add, { at: at + 0.24 + index * 0.17, freq: 1300 + Math.random() * 900, q: 1, peak: db(-18) * level, attack: 0.003, decay: 0.03 });
    },
    // The pani: a slurp, and a gulp.
    slurp(at) {
      const band = filter("bandpass", 700, 1.4);
      band.frequency.setValueAtTime(700, at);
      band.frequency.exponentialRampToValueAtTime(1600, at + 0.32);
      const add = voice(band);
      const source = context.createBufferSource();
      source.buffer = noise;
      const gain = context.createGain();
      add(source, [gain], at, swell(gain.gain, at, db(-17) / noisePeak("bandpass", 1100, 1.4, true), 0.05, 0.2, 0.14), Math.random() * (noise.duration - 1));
      const gulp = tone(voice(filter("lowpass", 900, BUTTERWORTH)), { at: at + 0.46, freq: 260, peak: db(-18), attack: 0.01, decay: 0.12 });
      gulp.frequency.setValueAtTime(260, at + 0.46);
      gulp.frequency.exponentialRampToValueAtTime(170, at + 0.56);
    },
    // The lights going down in the hall: a hush, and a tone sinking with them.
    dim(at) {
      const add = voice(filter("lowpass", 1200, BUTTERWORTH));
      const glide = tone(add, { at, freq: 520, peak: db(-19), attack: 0.3, decay: 1.4 });
      glide.frequency.setValueAtTime(520, at);
      glide.frequency.exponentialRampToValueAtTime(260, at + 1.3);
      grain(add, { type: "lowpass", at, freq: 800, q: BUTTERWORTH, peak: db(-22), attack: 0.4, hold: 0.3, decay: 0.9 });
    },
    // The projector at the back: film flickering through the gate, coming up and away.
    projector(at) {
      const add = voice(filter("bandpass", 1800, 2));
      const source = context.createBufferSource();
      source.buffer = noise;
      const gain = context.createGain();
      // shorter than the shared noise, so the slice always fits in it
      const length = 1.7;
      const top = db(-21) / noisePeak("bandpass", 1800, 2, false);
      gain.gain.setValueAtTime(0, at);
      for (let time = 0; time < length; time += 1 / 24) {
        const level = top * Math.sin((Math.PI * time) / length);
        gain.gain.linearRampToValueAtTime(Math.max(level, FLOOR * 2), at + time + 0.004);
        gain.gain.exponentialRampToValueAtTime(Math.max(level * 0.25, FLOOR), at + time + 0.035);
      }
      gain.gain.exponentialRampToValueAtTime(FLOOR, at + length + 0.05);
      add(source, [gain], at, at + length + 0.05, Math.random() * (noise.duration - length - 0.1));
    },
    // My heart: three beats, each a lub and a quieter dub.
    heartbeat(at) {
      const add = voice(filter("lowpass", 400, BUTTERWORTH));
      for (let beat = 0; beat < 3; beat++) {
        for (const [offset, level] of [[0, 1], [0.18, 0.65]] as const) {
          const time = at + beat * 0.82 + offset;
          const thump = tone(add, { at: time, freq: 165, peak: db(-9) * level, attack: 0.008, decay: 0.11 });
          thump.frequency.setValueAtTime(165, time);
          thump.frequency.exponentialRampToValueAtTime(125, time + 0.1);
        }
      }
    },
    // Him: three low felted notes that don't belong together, sagging, under a breath of air.
    sting(at) {
      for (const [freq, level] of [[NOTE.D3, 1], [NOTE.D3 * 1.0595, 0.75], [NOTE.D3 * 1.414, 0.55]] as const) {
        felt(at, freq, db(-12) * level, 2.6, 900).forEach((osc) => {
          osc.detune.setValueAtTime(0, at + 0.4);
          osc.detune.linearRampToValueAtTime(-30, at + 2.4);
        });
      }
      grain(voice(filter("lowpass", 1400, BUTTERWORTH)), { at, freq: 600, q: 0.7, peak: db(-20), attack: 0.5, hold: 0.4, decay: 1.2 });
    },
    // The popcorn machine at the counter, popping away.
    popcorn(at) {
      let time = 0;
      for (let index = 0; index < 12; index++) {
        grain(voice(...panned(-0.35 + Math.random() * 0.4)), { at: at + time, freq: 1800 + Math.random() * 1200, q: 2, peak: db(-13) * (0.55 + Math.random() * 0.45), attack: 0.002, decay: 0.012 });
        time += 0.04 + Math.random() * 0.12;
      }
    },
    // The fridge door: the seal letting go, the glass rattling, its hum.
    fridge(at) {
      const add = voice(...panned(-0.1));
      grain(add, { type: "lowpass", at, freq: 900, q: BUTTERWORTH, peak: db(-14), attack: 0.004, decay: 0.06 });
      grain(add, { at: at + 0.05, freq: 2400, q: 6, peak: db(-20), attack: 0.002, decay: 0.05 });
      tone(add, { at: at + 0.04, freq: 240, peak: db(-26), attack: 0.2, decay: 1.2 });
    },
    // The can: the tab cracking, a pop, and the fizz.
    fizz(at) {
      const add = voice(filter("lowpass", 5800, BUTTERWORTH));
      grain(add, { at, freq: 3200, q: 2.5, peak: db(-9), attack: 0.002, decay: 0.01 });
      grain(add, { at: at + 0.012, freq: 1200, q: 1, peak: db(-14), attack: 0.002, decay: 0.03 });
      grain(add, { at: at + 0.02, freq: 5000, q: 0.8, peak: db(-17), attack: 0.01, hold: 0.15, decay: 0.9 });
    },
    // Sipping through the straw: a few small bubbling pulls.
    sip(at) {
      const add = voice(filter("lowpass", 2400, BUTTERWORTH));
      for (let index = 0; index < 4; index++) {
        grain(add, { at: at + index * 0.11, freq: 900 - index * 70, q: 3, peak: db(-17), attack: 0.01, decay: 0.05 });
      }
    },
    // The burger's paper, unwrapped.
    wrapper(at) {
      const add = voice(filter("lowpass", 5200, BUTTERWORTH));
      let time = 0;
      for (let index = 0; index < 14; index++) {
        grain(add, { at: at + time, freq: 2200 + Math.random() * 2000, q: 1.3, peak: db(-13) * (0.4 + Math.random() * 0.6), attack: 0.002, decay: 0.01 + Math.random() * 0.02 });
        time += 0.015 + Math.random() * 0.04;
      }
    },
    // The toy in the box: a little plucked 'ta-da', and a glint.
    toy(at) {
      pluck(at, NOTE.C5, db(-13));
      pluck(at + 0.12, NOTE.F5, db(-12));
      glass(at + 0.24, NOTE.A6, db(-18), 1.4, 0.2);
    },
    // Akka's phone: the flash charging up, then the shutter.
    camera(at) {
      const add = voice(filter("lowpass", 5000, BUTTERWORTH), ...panned(0.25));
      const whine = tone(add, { at, freq: 1800, peak: db(-27), attack: 0.4, decay: 0.15 });
      whine.frequency.setValueAtTime(1800, at);
      whine.frequency.exponentialRampToValueAtTime(4200, at + 0.5);
      grain(add, { at: at + 0.55, freq: 2800, q: 3, peak: db(-10), attack: 0.002, decay: 0.008 });
      grain(add, { at: at + 0.6, freq: 1900, q: 3, peak: db(-12), attack: 0.002, decay: 0.012 });
      grain(add, { type: "lowpass", at: at + 0.55, freq: 3000, q: BUTTERWORTH, peak: db(-19), attack: 0.002, decay: 0.06 });
    },
    // The ice in my cup knocking about.
    clink(at) {
      const add = voice(filter("lowpass", 5400, BUTTERWORTH));
      let time = 0;
      for (let index = 0; index < 4; index++) {
        const freq = 2600 + Math.random() * 800;
        tone(add, { at: at + time, freq, peak: db(-19), attack: 0.002, decay: 0.08 });
        tone(add, { at: at + time, freq: freq * 1.47, peak: db(-25), attack: 0.002, decay: 0.05 });
        time += 0.09 + Math.random() * 0.12;
      }
    },
    // His steps in the dream: heavy, slow, dragging closer.
    steps(at) {
      const add = voice(filter("lowpass", 1200, BUTTERWORTH));
      [0.7, 0.85, 1].forEach((level, index) => {
        const time = at + index * 0.7;
        grain(add, { type: "lowpass", at: time, freq: 260, q: BUTTERWORTH, peak: db(-11) * level, attack: 0.004, decay: 0.12 });
        grain(add, { at: time + 0.14, freq: 700, q: 0.8, peak: db(-21) * level, attack: 0.05, hold: 0.12, decay: 0.2 });
      });
    },
    // The clapperboard landing: one sharp wooden clap.
    clap(at) {
      const add = voice(filter("lowpass", 4800, BUTTERWORTH));
      grain(add, { at, freq: 2000, q: 1, peak: db(-9), attack: 0.002, decay: 0.02 });
      grain(add, { at, freq: 900, q: 1.2, peak: db(-12), attack: 0.002, decay: 0.04 });
      const knock = tone(add, { at, freq: 330, peak: db(-18), attack: 0.002, decay: 0.06 });
      knock.frequency.setValueAtTime(330, at);
      knock.frequency.exponentialRampToValueAtTime(250, at + 0.05);
    },
    // This is life: three music-box notes falling home, the last left ringing.
    phrase(at) {
      [NOTE.C6, NOTE.A5, NOTE.F5].forEach((freq, index) => musicBox(at + index * 0.36, freq, db(-14), index === 2 ? 3 : 1.6, 0.15 - index * 0.12));
    },
    // The school bell after the last paper: the hammer beating a small metal dome, for a second and a half.
    schoolbell(at) {
      const add = voice(filter("lowpass", 4200, BUTTERWORTH), ...panned(0.2));
      const length = 1.5;
      for (const [ratio, level] of [[1, 0.6], [2.42, 0.28], [3.9, 0.12]] as const) {
        const osc = context.createOscillator();
        osc.frequency.value = 900 * ratio;
        const gain = context.createGain();
        const top = db(-15) * level;
        gain.gain.setValueAtTime(0, at);
        for (let time = 0; time < length; time += 1 / 21) {
          gain.gain.linearRampToValueAtTime(top, at + time + 0.003);
          gain.gain.exponentialRampToValueAtTime(top * 0.35, at + time + 1 / 21 - 0.002);
        }
        gain.gain.exponentialRampToValueAtTime(FLOOR, at + length + 0.4);
        add(osc, [gain], at, at + length + 0.4);
      }
    },
    // The bag's zip: fine teeth clicking past, quickening and rising.
    zip(at) {
      const add = voice(filter("lowpass", 5400, BUTTERWORTH));
      let time = 0;
      for (let index = 0; index < 26; index++) {
        const lift = index / 25;
        grain(add, { at: at + time, freq: 2600 + 1400 * lift, q: 3, peak: db(-17) * (0.6 + 0.4 * Math.random()), attack: 0.002, decay: 0.01 });
        time += 0.024 - 0.012 * lift;
      }
    },
    // The keyring: a few small metal clinks, the chain settling.
    jingle(at) {
      const add = voice(filter("lowpass", 5600, BUTTERWORTH), ...panned(0.1));
      let time = 0;
      for (let index = 0; index < 4; index++) {
        const freq = 2900 + Math.random() * 900;
        tone(add, { at: at + time, freq, peak: db(-19) * (1 - index * 0.15), attack: 0.002, decay: 0.22 });
        tone(add, { at: at + time, freq: freq * 1.52, peak: db(-25), attack: 0.002, decay: 0.12 });
        time += 0.05 + Math.random() * 0.07;
      }
    },
    // Chalk on the board: two short, dry strokes.
    chalk(at) {
      const add = voice(filter("lowpass", 5200, BUTTERWORTH));
      grain(add, { at, freq: 3100, q: 5, peak: db(-19), attack: 0.02, hold: 0.16, decay: 0.05 });
      grain(add, { at: at + 0.32, freq: 2800, q: 5, peak: db(-20), attack: 0.02, hold: 0.22, decay: 0.05 });
    },
    // The class talking at once: a soft murmur rising and falling in syllables.
    chatter(at) {
      const add = voice(filter("bandpass", 750, 0.8));
      const source = context.createBufferSource();
      source.buffer = noise;
      const gain = context.createGain();
      const length = 1.6;
      const top = db(-21) / noisePeak("bandpass", 750, 0.8, false);
      gain.gain.setValueAtTime(0, at);
      for (let time = 0; time < length; time += 0.12 + Math.random() * 0.08) {
        const level = top * Math.sin((Math.PI * time) / length) * (0.5 + Math.random() * 0.5);
        gain.gain.linearRampToValueAtTime(Math.max(level, FLOOR * 2), at + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(Math.max(level * 0.4, FLOOR), at + time + 0.11);
      }
      gain.gain.exponentialRampToValueAtTime(FLOOR, at + length + 0.1);
      add(source, [gain], at, at + length + 0.1, Math.random() * (noise.duration - length - 0.2));
    },
    // The bus pulling away: its diesel rumble, and one honk of its horn.
    bus(at) {
      const body = filter("lowpass", 380, BUTTERWORTH);
      const add = voice(body);
      const osc = context.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(58, at);
      osc.frequency.linearRampToValueAtTime(82, at + 1.6);
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, at);
      let time = 0;
      while (time < 1.8) {
        const level = db(-13) * Math.min(1, 0.4 + time) * (time > 1.4 ? 1 - (time - 1.4) / 0.4 : 1);
        gain.gain.linearRampToValueAtTime(Math.max(level, FLOOR * 2), at + time + 0.01);
        gain.gain.exponentialRampToValueAtTime(Math.max(level * 0.2, FLOOR), at + time + 0.07);
        time += 1 / (9 + 5 * Math.min(1, time));
      }
      gain.gain.exponentialRampToValueAtTime(FLOOR, at + time + 0.1);
      add(osc, [gain], at, at + time + 0.1);
      const horn = voice(filter("lowpass", 1400, BUTTERWORTH), ...panned(-0.2));
      for (const freq of [330, 415]) {
        const reed = context.createOscillator();
        reed.type = "square";
        reed.frequency.value = freq;
        const level = context.createGain();
        horn(reed, [level], at + 0.5, swell(level.gain, at + 0.5, db(-22), 0.02, 0.28, 0.08));
      }
    },
    // A sticker peeled off its sheet.
    sticker(at) {
      const band = filter("bandpass", 1500, 1.2);
      band.frequency.setValueAtTime(1500, at);
      band.frequency.exponentialRampToValueAtTime(4500, at + 0.16);
      const add = voice(band);
      const source = context.createBufferSource();
      source.buffer = noise;
      const gain = context.createGain();
      add(source, [gain], at, swell(gain.gain, at, db(-16) / noisePeak("bandpass", 2600, 1.2, true), 0.02, 0.1, 0.05), Math.random() * (noise.duration - 1));
    },
    // Her goodbye, see you after the holidays: two music-box notes, the second a little lower.
    byebye(at) {
      musicBox(at, NOTE.C6, db(-15), 1.2, -0.15);
      musicBox(at + 0.24, NOTE.A5, db(-15), 1.8, 0.15);
    },
    // The title: F major, home, rolled gently up from the bottom.
    chord(at) {
      const unit = db(-8) / CHORD.reduce((sum, [, level]) => sum + level, 0);
      CHORD.forEach(([freq, level], index) => warm(at + index * 0.045, freq, unit * level, 4.6));
    },
  };

  /** Start a cue just ahead of the clock, after any cue still queued from this frame. */
  const play = (cue: Cue, step: number) => {
    if (context.state !== "running") return;
    const now = context.currentTime;
    const at = Math.max(now + LEAD, nextFree);
    if (at > now + BACKLOG) return;
    nextFree = at + GAP;
    try {
      voices[cue](at, step);
    } catch {
      // A context closing between frames: this cue simply doesn't play.
    }
  };

  /** A chain tick as a pedal goes down: a small dull click and the short breath of the stroke. */
  const chainTick = (current: Bike, at: number) => {
    const add = voiceInto(current.bus);
    const centre = current.ride.tick * (0.95 + Math.random() * 0.1);
    grain(add, { at, freq: centre, q: 2.2, peak: 1, attack: 0.002, decay: 0.035 });
    grain(add, { at, freq: centre * 0.55, q: 0.8, peak: 0.35, attack: 0.025, decay: 0.11 });
  };

  /** One click of the freewheel's pawls: tiny, bright, and a little different each time. */
  const freewheel = (current: Bike, at: number) => {
    const centre = current.ride.click * (0.92 + Math.random() * 0.16);
    grain(voiceInto(current.bus), { at, freq: centre, q: 5, peak: 0.5 * (0.7 + Math.random() * 0.3), attack: 0.002, decay: 0.012 });
  };

  /** The bicycle's own bus, with the road's hiss looping underneath until the bike is let go. */
  const startBike = (art: string, ride: Ride, clock: number): Bike => {
    const bus = context.createGain();
    bus.gain.value = 0;
    const band = filter("bandpass", ride.hiss, 0.6);
    const level = context.createGain();
    level.gain.value = 0.3 / noisePeak("bandpass", ride.hiss, 0.6, true);
    const hiss = context.createBufferSource();
    hiss.buffer = noise;
    hiss.loop = true;
    hiss.connect(band);
    band.connect(level);
    level.connect(bus);
    bus.connect(input);
    live.add(hiss);
    hiss.onended = () => {
      live.delete(hiss);
      [hiss, band, level, bus].forEach((node) => node.disconnect());
    };
    hiss.start(context.currentTime + LEAD, Math.random() * noise.duration);
    return { art, ride, bus, band, hiss, speed: 0, clock, moved: clock, nextClick: 0, stroke: -1 };
  };

  /** Let the bicycle go: a quick fade, then the hiss stops and its nodes disconnect. */
  const stopBike = () => {
    const current = bike;
    bike = null;
    if (!current) return;
    try {
      const now = context.currentTime;
      current.bus.gain.cancelScheduledValues(now);
      current.bus.gain.setTargetAtTime(0, now, 0.03);
      current.hiss.stop(now + 0.25);
    } catch {
      try { current.bus.disconnect(); } catch { /* The context may have closed. */ }
    }
  };

  /** The Avenger's engine: a sawtooth exhaust tone and a breath of noise, pulsed at the firing rate. */
  const startEngine = (art: string, motor: Motor, clock: number): Engine => {
    const bus = context.createGain();
    bus.gain.value = 0;
    const pulse = context.createGain();
    pulse.gain.value = 0.55;
    const lfo = context.createOscillator();
    lfo.type = "square";
    lfo.frequency.value = motor.pulse[0];
    const depth = context.createGain();
    depth.gain.value = 0.45;
    const osc = context.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = motor.tone[0];
    const rumble = context.createBufferSource();
    rumble.buffer = noise;
    rumble.loop = true;
    const breath = filter("bandpass", 280, 0.9);
    const breathLevel = context.createGain();
    breathLevel.gain.value = 0.5 / noisePeak("bandpass", 280, 0.9, true);
    const body = filter("lowpass", 560, BUTTERWORTH);
    lfo.connect(depth);
    depth.connect(pulse.gain);
    osc.connect(pulse);
    rumble.connect(breath);
    breath.connect(breathLevel);
    breathLevel.connect(pulse);
    pulse.connect(body);
    body.connect(bus);
    bus.connect(input);
    const sources = [osc, lfo, rumble];
    sources.forEach((source) => live.add(source));
    osc.onended = () => {
      sources.forEach((source) => live.delete(source));
      [osc, lfo, rumble, depth, pulse, breath, breathLevel, body, bus].forEach((node) => node.disconnect());
    };
    const start = context.currentTime + LEAD;
    osc.start(start);
    lfo.start(start);
    rumble.start(start, Math.random() * noise.duration);
    return { art, motor, bus, osc, lfo, rumble, speed: 0, clock, moved: clock };
  };

  /** Let the engine go: a quick fade, then everything stops and disconnects. */
  const stopEngine = () => {
    const current = engine;
    engine = null;
    if (!current) return;
    try {
      const now = context.currentTime;
      current.bus.gain.cancelScheduledValues(now);
      current.bus.gain.setTargetAtTime(0, now, 0.04);
      for (const source of [current.osc, current.lfo, current.rumble]) source.stop(now + 0.3);
    } catch {
      try { current.bus.disconnect(); } catch { /* The context may have closed. */ }
    }
  };

  /** The engine follows the reader's speed like the pedals do: louder and quicker, and quiet soon after they stop. */
  const runEngine = (art: string, speed: number) => {
    const motor = MOTORBIKE[art];
    if (engine && (engine.art !== art || !motor)) stopEngine();
    if (!motor || context.state !== "running") return;
    const clock = performance.now() / 1000;
    const pace = Number.isFinite(speed) ? Math.abs(speed) : 0;
    if (!engine) {
      if (pace < STILL) return;
      engine = startEngine(art, motor, clock);
    }
    const current = engine;
    const elapsed = Math.min(0.1, Math.max(0, clock - current.clock));
    current.clock = clock;
    current.speed += (pace - current.speed) * (1 - Math.exp(-elapsed / (pace > current.speed ? 0.12 : 0.06)));
    const amount = current.speed < STILL ? 0 : Math.min(1, current.speed / motor.full) ** 0.6;
    try {
      const now = context.currentTime;
      const gain = current.bus.gain;
      gain.cancelScheduledValues(now);
      gain.setTargetAtTime(motor.level * amount, now, 0.05);
      gain.setTargetAtTime(0, now + 0.08, 0.06);
      current.lfo.frequency.setTargetAtTime(motor.pulse[0] + (motor.pulse[1] - motor.pulse[0]) * amount, now, 0.12);
      current.osc.frequency.setTargetAtTime(motor.tone[0] + (motor.tone[1] - motor.tone[0]) * amount, now, 0.12);
      if (amount > 0) current.moved = clock;
      else if (clock - current.moved > 1.5) stopEngine();
    } catch {
      stopEngine();
    }
  };

  return {
    update(art, value) {
      if (disposed || !Number.isFinite(value)) return;
      if (art !== scene) {
        // A new visit: every mark here is ready again, from the very start.
        scene = art;
        marks = marksByArt.get(art) ?? NO_MARKS;
        fired = 0;
        progress = -0.001;
        if (bike && bike.art !== art) stopBike();
        if (engine && engine.art !== art) stopEngine();
      }
      if (value > progress && value - progress <= MAX_STEP) {
        for (let index = 0; index < marks.length; index++) {
          const mark = marks[index];
          if (mark.at > progress && mark.at <= value && !(fired & (1 << index))) {
            fired |= 1 << index;
            play(mark.cue, mark.step ?? 0);
          }
        }
      }
      progress = value;
    },

    ride(art, speed) {
      if (disposed) return;
      runEngine(art, speed);
      const setting = BICYCLE[art];
      if (bike && (bike.art !== art || !setting)) stopBike();
      if (!setting || context.state !== "running") return;
      const clock = performance.now() / 1000;
      const pace = Number.isFinite(speed) ? Math.abs(speed) : 0;
      if (!bike) {
        // nothing to build until the reader moves
        if (pace < STILL) return;
        bike = startBike(art, setting, clock);
      }
      const current = bike;
      const elapsed = Math.min(0.1, Math.max(0, clock - current.clock));
      current.clock = clock;
      // Scroll speed arrives in bursts (wheel notches, frame jitter). Smooth it,
      // rising a little slower than it falls, so stopping is heard at once.
      current.speed += (pace - current.speed) * (1 - Math.exp(-elapsed / (pace > current.speed ? 0.08 : 0.05)));
      // Half speed still sounds clearly there; the curve only tops out at `full`.
      const amount = current.speed < STILL ? 0 : Math.min(1, current.speed / setting.full) ** 0.6;
      try {
        const now = context.currentTime;
        const gain = current.bus.gain;
        gain.cancelScheduledValues(now);
        gain.setTargetAtTime(setting.level * amount, now, 0.04);
        // If frames stop arriving, the texture lets go by itself within about a quarter second.
        gain.setTargetAtTime(0, now + 0.07, 0.045);
        // faster is brighter
        current.band.frequency.setTargetAtTime(setting.hiss * (0.7 + 0.6 * amount), now, 0.08);

        const stroke = scene === art ? Math.floor(progress * setting.strokes) : current.stroke;
        if (amount > 0 && current.stroke >= 0 && stroke > current.stroke && stroke - current.stroke <= 2) chainTick(current, now + LEAD);
        current.stroke = stroke;

        const rate = Math.min(setting.maxClicks, setting.clicks * current.speed);
        if (amount > 0 && rate >= 1.5) {
          if (current.nextClick < now + LEAD) current.nextClick = now + LEAD + Math.random() / rate;
          while (current.nextClick < now + AHEAD) {
            freewheel(current, current.nextClick);
            current.nextClick += (0.8 + Math.random() * 0.4) / rate;
          }
        }

        if (amount > 0) current.moved = clock;
        else if (clock - current.moved > 1.5) stopBike();
      } catch {
        stopBike();
      }
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      bike = null;
      engine = null;
      live.forEach((source) => {
        source.onended = null;
        try { source.stop(); } catch { /* It may never have started. */ }
        try { source.disconnect(); } catch { /* The context may have closed. */ }
      });
      live.clear();
      for (const node of [input, ceiling, master]) {
        try { node.disconnect(); } catch { /* The context may have closed. */ }
      }
    },
  };
}
