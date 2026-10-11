/**
 * Flock: the pigeons that live on the hero banner's rooftop.
 *
 * Everything is drawn procedurally on one small canvas, in "scene units"
 * (a 768 x 208 stage that matches the banner's SVG viewBox and is mapped
 * onto the canvas with the same xMaxYMid-slice transform).
 *
 * Life of a bird:
 *   away ──(timer)──▶ arriving ──(lands)──▶ perched ──(startled)──▶ fleeing ──(off-stage)──▶ away
 *                                            │  ▲
 *                                            ▼  │ wary: turns away and shuffles along its perch
 *
 * Perched birds peck, preen, look around and hop. A cursor (or finger)
 * coming close makes them wary; coming closer, or tapping near them,
 * scatters them, and neighbours startle a beat later. They return after a
 * few seconds from a random side (left, right, above or below).
 */

export const VW = 768;
export const VH = 208;

type Vec = { x: number; y: number };
type SurfaceId = "ledge" | "tank" | "wire";

type Surface = {
  id: SurfaceId;
  x0: number;
  x1: number;
  /** y of the standing line at x */
  y: (x: number) => number;
};

/* ───────────────────────── stage geometry (shared with the SVG) ───────────────────────── */

export const LEDGE_Y = 70;
/** left edge of the parapet; the type layout keeps clear of everything right of it */
export const BUILDING_X = 620;
export const TANK = { x0: 698, x1: 730, top: 41 };
export const POLE = { x: 646, top: 34 };
/** sagging cable from the antenna pole off the top of the stage */
export const WIRE = { p0: { x: 646, y: 36 }, c: { x: 572, y: 52 }, p2: { x: 470, y: -6 } };

function quad(a: Vec, c: Vec, b: Vec, t: number): Vec {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}

/** wire y at x via a small lookup (x is monotonic along the curve) */
const wireTable: Vec[] = Array.from({ length: 64 }, (_, i) => quad(WIRE.p0, WIRE.c, WIRE.p2, i / 63));
function wireY(x: number) {
  for (let i = 1; i < wireTable.length; i++) {
    const a = wireTable[i - 1];
    const b = wireTable[i];
    if ((x <= a.x && x >= b.x) || (x >= a.x && x <= b.x)) {
      const t = (x - a.x) / (b.x - a.x || 1);
      return a.y + (b.y - a.y) * t;
    }
  }
  return wireTable[0].y;
}

export const WIRE_PATH = `M${WIRE.p0.x} ${WIRE.p0.y} Q${WIRE.c.x} ${WIRE.c.y} ${WIRE.p2.x} ${WIRE.p2.y}`;

const SURFACES: Surface[] = [
  { id: "ledge", x0: 630, x1: 738, y: () => LEDGE_Y },
  { id: "tank", x0: TANK.x0 + 6, x1: TANK.x1 - 6, y: () => TANK.top },
  { id: "wire", x0: 528, x1: 632, y: wireY },
];

/* ───────────────────────── helpers ───────────────────────── */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function cubic(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/* ───────────────────────── birds ───────────────────────── */

type State = "away" | "arriving" | "perched" | "fleeing";
type Idle = "still" | "peck" | "look" | "preen" | "hop" | "walk";

type Bird = {
  id: number;
  state: State;
  t: number;
  x: number;
  y: number;
  dir: 1 | -1;
  size: number;
  /** subtle plumage variety: 0 = classic blue bar, 1 = darker, 2 = paler */
  morph: 0 | 1 | 2;
  flap: number;
  pitch: number;
  // arriving
  path: [Vec, Vec, Vec, Vec] | null;
  dur: number;
  surface: Surface | null;
  // perched
  idle: Idle;
  idleT: number;
  idleDur: number;
  nextIdle: number;
  walkTo: number;
  land: number;
  // fleeing
  vx: number;
  vy: number;
  // away
  wait: number;
};

type Crosser = { x: number; y: number; vx: number; flap: number; size: number; phase: number; glideAt: number };

export type FlockEvents = {
  /** birds burst off (count) because of the user */
  onScatter?: (count: number) => void;
};

export class Flock {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private birds: Bird[] = [];
  private crossers: Crosser[] = [];
  private nextFlock = rand(9, 16);
  private pointer: Vec | null = null;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private s = 1;
  private ox = 0;
  private oy = 0;
  private raf = 0;
  private running = false;
  private last = 0;
  private reduced = false;
  private ev: FlockEvents;
  private skip = false;

  constructor(canvas: HTMLCanvasElement, count = 7, ev: FlockEvents = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.ev = ev;
    for (let i = 0; i < count; i++) {
      this.birds.push({
        id: i,
        state: "away",
        t: 0,
        x: -40,
        y: -40,
        dir: 1,
        size: rand(0.92, 1.08),
        morph: (i % 5 === 3 ? 1 : i % 5 === 4 ? 2 : 0) as 0 | 1 | 2,
        flap: rand(0, Math.PI * 2),
        pitch: 0,
        path: null,
        dur: 1,
        surface: null,
        idle: "still",
        idleT: 0,
        idleDur: 0,
        nextIdle: rand(0.8, 2.5),
        walkTo: 0,
        land: 0,
        vx: 0,
        vy: 0,
        // the opening: birds arrive one by one
        wait: 0.35 + i * rand(0.35, 0.7),
      });
    }
  }

  /* ── setup ── */

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      // no flights at all: settle everyone where they'd perch
      for (const b of this.birds) {
        if (b.state !== "perched") this.placeImmediately(b);
      }
      this.crossers = [];
      this.kick();
    }
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    // same mapping as the SVG's preserveAspectRatio="xMaxYMid slice"
    this.s = Math.max(w / VW, h / VH);
    this.ox = w - VW * this.s;
    this.oy = (h - VH * this.s) / 2;
    this.kick();
  }

  /** css px (relative to the banner) -> scene units */
  toScene(x: number, y: number): Vec {
    return { x: (x - this.ox) / this.s, y: (y - this.oy) / this.s };
  }

  /* ── input ── */

  setPointer(p: Vec | null) {
    this.pointer = p;
    this.kick();
  }

  /** A tap/click at scene point p: scatter everyone close by. Returns how many flew. */
  tap(p: Vec) {
    let n = 0;
    for (const b of this.birds) {
      if (b.state !== "perched" && b.state !== "arriving") continue;
      const d = Math.hypot(b.x - p.x, b.y - 8 - p.y);
      if (d < 70) {
        this.flee(b, p, d < 30 ? 0 : (d / 70) * 0.18);
        n++;
      }
    }
    if (n) this.ev.onScatter?.(n);
    this.kick();
    return n;
  }

  /* ── loop ── */

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy() {
    this.stop();
  }

  private kick() {
    if (this.running && !this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (!this.running) return;
    const busy = this.birds.some((b) => b.state === "arriving" || b.state === "fleeing") || this.crossers.length > 0;
    // calm scenes (only idling birds) run at 30fps; flight runs at full rate
    this.skip = !this.skip;
    if (!busy && this.skip && !this.pointer) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    if (!this.reduced) this.update(dt);
    this.draw();
    if (!this.reduced) this.raf = requestAnimationFrame(this.tick);
  };

  /* ── behaviour ── */

  private occupied(except: Bird, x: number, surface: Surface) {
    return this.birds.some(
      (o) =>
        o !== except &&
        o.surface === surface &&
        (o.state === "perched" || o.state === "arriving") &&
        Math.abs((o.state === "arriving" && o.path ? o.path[3].x : o.x) - x) < 15,
    );
  }

  private pickSpot(b: Bird): { surface: Surface; x: number } | null {
    for (let tries = 0; tries < 24; tries++) {
      // the ledge is the favourite; the tank and the wire fill in
      const r = Math.random();
      const surface = r < 0.5 ? SURFACES[0] : r < 0.68 ? SURFACES[1] : SURFACES[2];
      const x = rand(surface.x0, surface.x1);
      if (!this.occupied(b, x, surface)) return { surface, x };
    }
    return null;
  }

  private placeImmediately(b: Bird) {
    const spot = this.pickSpot(b);
    if (!spot) return;
    b.surface = spot.surface;
    b.x = spot.x;
    b.y = spot.surface.y(spot.x);
    b.state = "perched";
    b.dir = Math.random() < 0.5 ? 1 : -1;
  }

  private arrive(b: Bird) {
    const spot = this.pickSpot(b);
    if (!spot) {
      b.wait = rand(1.5, 3);
      return;
    }
    const target = { x: spot.x, y: spot.surface.y(spot.x) };
    // come in from any side
    const side = Math.random();
    let p0: Vec;
    if (side < 0.34) p0 = { x: -30, y: rand(5, 110) };
    else if (side < 0.62) p0 = { x: VW + 30, y: rand(-10, 40) };
    else if (side < 0.85) p0 = { x: rand(300, VW - 40), y: -30 };
    else p0 = { x: rand(330, 600), y: VH + 30 };
    const dx = target.x - p0.x;
    const dist = Math.hypot(dx, target.y - p0.y);
    // swoop: leave the spawn on a lifted arc, drop onto the perch from above
    const p1 = { x: p0.x + dx * 0.35, y: Math.min(p0.y, target.y) - rand(20, 50) };
    const p2 = { x: target.x - Math.sign(dx || 1) * rand(24, 40), y: target.y - rand(26, 44) };
    b.path = [p0, p1, p2, target];
    b.dur = 0.9 + dist / rand(150, 190);
    b.surface = spot.surface;
    b.x = p0.x;
    b.y = p0.y;
    b.t = 0;
    b.state = "arriving";
    b.dir = dx >= 0 ? 1 : -1;
  }

  private flee(b: Bird, from: Vec, delay = 0) {
    if (b.state === "fleeing") return;
    b.state = "fleeing";
    b.t = -delay;
    const away = b.x >= from.x ? 1 : -1;
    b.dir = away as 1 | -1;
    b.vx = away * rand(60, 110);
    b.vy = rand(-120, -80);
    b.surface = null;
    b.path = null;
  }

  private update(dt: number) {
    const p = this.pointer;
    let scared = 0;

    for (const b of this.birds) {
      b.t += dt;
      switch (b.state) {
        case "away": {
          b.wait -= dt;
          if (b.wait <= 0) this.arrive(b);
          break;
        }
        case "arriving": {
          const path = b.path!;
          const u = clamp(b.t / b.dur, 0, 1);
          const pos = cubic(path[0], path[1], path[2], path[3], easeInOut(u));
          const prev = { x: b.x, y: b.y };
          b.x = pos.x;
          b.y = pos.y;
          const vx = b.x - prev.x;
          if (Math.abs(vx) > 0.05) b.dir = vx > 0 ? 1 : -1;
          // flapping hard early, a glide in the middle, a flare to land
          const flapRate = u < 0.4 ? 16 : u < 0.78 ? 7 : 20;
          b.flap += dt * flapRate;
          b.pitch = u > 0.82 ? -0.45 * ((u - 0.82) / 0.18) : Math.atan2(b.y - prev.y, Math.abs(vx) + 0.001) * 0.5;
          if (u >= 1) {
            b.state = "perched";
            b.land = 0.32;
            b.idle = "still";
            b.nextIdle = rand(0.6, 2);
            b.pitch = 0;
          }
          // a pointer right on the landing spot spooks them mid-approach
          if (p && u > 0.6 && Math.hypot(b.x - p.x, b.y - 8 - p.y) < 34) {
            this.flee(b, p);
            scared++;
          }
          break;
        }
        case "perched": {
          if (b.land > 0) b.land = Math.max(0, b.land - dt);
          const surface = b.surface!;
          // wary / scared by proximity
          if (p) {
            const d = Math.hypot(b.x - p.x, b.y - 8 - p.y);
            if (d < 26) {
              this.flee(b, p);
              scared++;
              break;
            }
            if (d < 72) {
              const away = b.x >= p.x ? 1 : -1;
              if (b.idle !== "walk") {
                b.dir = away as 1 | -1;
                const target = clamp(b.x + away * rand(10, 18), surface.x0, surface.x1);
                if (Math.abs(target - b.x) > 3 && !this.occupied(b, target, surface)) {
                  b.idle = "walk";
                  b.idleT = 0;
                  b.walkTo = target;
                  b.idleDur = Math.abs(target - b.x) / 26;
                } else if (d < 46) {
                  // cornered: nowhere to shuffle, so it goes
                  this.flee(b, p);
                  scared++;
                  break;
                }
              }
            }
          }
          // idle repertoire
          if (b.idle === "still") {
            b.nextIdle -= dt;
            if (b.nextIdle <= 0) {
              const r = Math.random();
              b.idle = r < 0.32 ? "peck" : r < 0.6 ? "look" : r < 0.78 ? "preen" : "hop";
              b.idleT = 0;
              b.idleDur = b.idle === "peck" ? 0.7 : b.idle === "preen" ? 1.1 : b.idle === "look" ? 0.35 : 0.4;
              if (b.idle === "look") b.dir = (b.dir * -1) as 1 | -1;
              if (b.idle === "hop") {
                const target = clamp(b.x + b.dir * rand(5, 9), surface.x0, surface.x1);
                if (this.occupied(b, target, surface)) b.idle = "still";
                else b.walkTo = target;
              }
            }
          } else {
            b.idleT += dt;
            if (b.idle === "walk" || b.idle === "hop") {
              // cover the remaining distance evenly over the remaining time
              const remaining = Math.max(0.016, b.idleDur - b.idleT + dt);
              b.x += (b.walkTo - b.x) * Math.min(1, dt / remaining);
            }
            if (b.idleT >= b.idleDur) {
              b.idle = "still";
              b.nextIdle = rand(1.2, 3.8);
            }
          }
          b.y = surface.y(b.x);
          break;
        }
        case "fleeing": {
          if (b.t < 0) break; // startled a beat after its neighbour
          b.vy -= 70 * dt;
          b.vx += Math.sign(b.vx) * 50 * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.flap += dt * 22;
          b.pitch = clamp(Math.atan2(b.vy, Math.abs(b.vx)) * 0.6, -0.9, 0.2);
          if (b.x < -50 || b.x > VW + 50 || b.y < -50) {
            b.state = "away";
            b.wait = rand(2.8, 7.5);
          }
          break;
        }
      }
    }

    // a scattering bird startles its neighbours a beat later
    if (scared) {
      const fleeing = this.birds.filter((b) => b.state === "fleeing" && b.t >= -0.01 && b.t < 0.05);
      for (const f of fleeing) {
        for (const o of this.birds) {
          if (o.state !== "perched") continue;
          const d = Math.hypot(o.x - f.x, o.y - f.y);
          if (d < 52) this.flee(o, { x: f.x, y: f.y }, rand(0.08, 0.26));
        }
      }
      this.ev.onScatter?.(scared);
    }

    // ambient: now and then a small flock crosses the sky
    this.nextFlock -= dt;
    if (this.nextFlock <= 0) {
      this.nextFlock = rand(16, 30);
      const n = Math.round(rand(3, 5));
      const y0 = rand(14, 60);
      const ltr = Math.random() < 0.6;
      for (let i = 0; i < n; i++) {
        this.crossers.push({
          x: ltr ? -30 - i * rand(22, 34) : VW + 30 + i * rand(22, 34),
          y: y0 + rand(-10, 14) + (i % 2) * 8,
          vx: (ltr ? 1 : -1) * rand(85, 105),
          flap: rand(0, 6),
          size: rand(0.75, 0.95),
          phase: rand(0, 6),
          glideAt: rand(1, 3),
        });
      }
    }
    for (const c of this.crossers) {
      c.x += c.vx * dt;
      c.phase += dt;
      c.y += Math.sin(c.phase * 1.3) * 3 * dt;
      // flap, then glide for a while, then flap again
      c.flap += dt * (Math.sin(c.phase * 0.7) > 0.2 ? 15 : 0);
    }
    this.crossers = this.crossers.filter((c) => c.x > -200 && c.x < VW + 200);
  }

  /* ── drawing ── */

  private draw() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr * this.s, 0, 0, this.dpr * this.s, this.dpr * this.ox, this.dpr * this.oy);

    for (const c of this.crossers) drawFlying(ctx, c.x, c.y, c.vx > 0 ? 1 : -1, c.size, Math.sin(c.flap), 0, 0, true);

    // perched birds sorted so lower (closer) ones draw on top
    const order = [...this.birds].sort((a, b) => a.y - b.y);
    for (const b of order) {
      if (b.state === "away") continue;
      if (b.state === "perched") drawPerched(ctx, b);
      else {
        const landing = b.state === "arriving" && b.path ? clamp(b.t / b.dur, 0, 1) : 0;
        const flare = landing > 0.82 ? (landing - 0.82) / 0.18 : 0;
        const wing = flare > 0 ? 0.95 : Math.sin(b.flap);
        drawFlying(ctx, b.x, b.y - 7 * b.size, b.dir, b.size, wing, b.pitch, flare, false, b.morph);
      }
    }
  }
}

/* ───────────────────────── pigeon art ───────────────────────── */

const PALETTE = [
  // classic blue-bar rock dove
  { back: "#6c7786", belly: "#a2abb6", wing: "#9aa4b0", bar: "#2d333c", tail: "#4a5260", head: "#5f6977" },
  // darker "checker"
  { back: "#4f5865", belly: "#7f8894", wing: "#6e7884", bar: "#22272e", tail: "#3a414c", head: "#4d5662" },
  // pale
  { back: "#8a93a0", belly: "#c3c9d0", wing: "#b5bdc6", bar: "#3a414b", tail: "#5f6774", head: "#7a8491" },
] as const;

let neckGrad: CanvasGradient | null = null;
let neckCtx: CanvasRenderingContext2D | null = null;

function neck(ctx: CanvasRenderingContext2D) {
  if (!neckGrad || neckCtx !== ctx) {
    neckGrad = ctx.createLinearGradient(3, -13, 6, -7);
    neckGrad.addColorStop(0, "#5a9479");
    neckGrad.addColorStop(0.55, "#6f7d6e");
    neckGrad.addColorStop(1, "#7d5f8c");
    neckCtx = ctx;
  }
  return neckGrad;
}

/** Side-view perched pigeon, feet at (0,0), facing +x before the dir flip. */
function drawPerched(ctx: CanvasRenderingContext2D, b: Bird) {
  const c = PALETTE[b.morph];
  const squash = b.land > 0 ? 1 - Math.sin((b.land / 0.32) * Math.PI) * 0.12 : 1;
  const walking = b.idle === "walk" || b.idle === "hop";
  const hopLift = b.idle === "hop" ? Math.sin(clamp(b.idleT / b.idleDur, 0, 1) * Math.PI) * 3 : 0;
  const bob = walking ? Math.sin(b.idleT * 22) * 0.9 : 0;

  ctx.save();
  ctx.translate(b.x, b.y);

  // contact shadow on the ledge / tank
  if (b.surface?.id !== "wire") {
    ctx.fillStyle = "rgba(30,40,55,0.16)";
    ctx.beginPath();
    ctx.ellipse(0, 0.4, 6.5 * b.size, 1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(0, -hopLift);
  ctx.scale(b.dir * b.size, b.size * squash);

  // legs
  ctx.strokeStyle = "#d0706f";
  ctx.lineWidth = 0.9;
  ctx.lineCap = "round";
  const step = walking ? Math.sin(b.idleT * 22) * 1.2 : 0;
  ctx.beginPath();
  ctx.moveTo(1, -2.4);
  ctx.lineTo(1.2 + step, 0);
  ctx.moveTo(-1.2, -2.4);
  ctx.lineTo(-1.4 - step, 0);
  ctx.stroke();

  // tail
  ctx.fillStyle = c.tail;
  ctx.beginPath();
  ctx.moveTo(-5.5, -5.6);
  ctx.lineTo(-13.4, -3.6);
  ctx.lineTo(-13.8, -1.8);
  ctx.lineTo(-5.5, -3.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.bar;
  ctx.beginPath();
  ctx.moveTo(-12.1, -3.9);
  ctx.lineTo(-13.4, -3.6);
  ctx.lineTo(-13.8, -1.8);
  ctx.lineTo(-12.4, -2.1);
  ctx.closePath();
  ctx.fill();

  // body
  const bodyG = ctx.createLinearGradient(0, -11, 0, -2);
  bodyG.addColorStop(0, c.back);
  bodyG.addColorStop(1, c.belly);
  ctx.fillStyle = bodyG;
  ctx.beginPath();
  ctx.ellipse(-0.6, -6.4, 7.6, 4.8, -0.12, 0, Math.PI * 2);
  ctx.fill();

  // folded wing with the two dark bars
  const preen = b.idle === "preen" ? Math.sin(clamp(b.idleT / b.idleDur, 0, 1) * Math.PI) : 0;
  ctx.save();
  ctx.rotate(-preen * 0.12);
  ctx.fillStyle = c.wing;
  ctx.beginPath();
  ctx.moveTo(4.6, -9.6);
  ctx.bezierCurveTo(0, -11.2, -6.4, -10.2, -9.6, -6.2);
  ctx.bezierCurveTo(-5.2, -5.2, 1, -5, 4.6, -6.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = c.bar;
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.moveTo(-0.8, -9.1);
  ctx.lineTo(-4.8, -7.1);
  ctx.moveTo(1.2, -8.5);
  ctx.lineTo(-3.2, -6.4);
  ctx.stroke();
  // primaries, darker wingtip
  ctx.fillStyle = c.bar;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(-6.4, -8.1);
  ctx.lineTo(-10.6, -6.4);
  ctx.lineTo(-7.2, -6.6);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // head + neck, posed by the current idle action
  let headRot = 0;
  let headDx = bob;
  if (b.idle === "peck") {
    const k = clamp(b.idleT / b.idleDur, 0, 1);
    headRot = Math.abs(Math.sin(k * Math.PI * 2)) * 1.05;
  } else if (b.idle === "preen") {
    headRot = -preen * 2.2;
    headDx = -preen * 2;
  } else if (b.idle === "look") {
    headDx = Math.sin(clamp(b.idleT / b.idleDur, 0, 1) * Math.PI) * 0.8;
  }
  ctx.save();
  ctx.translate(3.4 + headDx, -8.2);
  ctx.rotate(headRot);
  ctx.translate(-3.4, 8.2);

  ctx.fillStyle = neck(ctx);
  ctx.beginPath();
  ctx.ellipse(4.4, -9.8, 2.9, 3.4, 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.head;
  ctx.beginPath();
  ctx.arc(6.3, -12.6, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // beak + cere
  ctx.fillStyle = "#2b2f36";
  ctx.beginPath();
  ctx.moveTo(8.5, -12.9);
  ctx.lineTo(10.6, -12.3);
  ctx.lineTo(8.5, -11.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ebe8e1";
  ctx.beginPath();
  ctx.arc(8.4, -12.95, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // eye: orange ring, dark pupil, tiny catchlight
  ctx.fillStyle = "#e07b2c";
  ctx.beginPath();
  ctx.arc(7.05, -13.15, 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1d22";
  ctx.beginPath();
  ctx.arc(7.12, -13.15, 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(7.25, -13.3, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Side-view pigeon in flight. `wing` in [-1, 1] is the stroke position
 * (1 = wings up), `flare` in [0, 1] spreads wings and drops the feet to land.
 */
function drawFlying(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
  size: number,
  wing: number,
  pitch: number,
  flare: number,
  far: boolean,
  morph: 0 | 1 | 2 = 0,
) {
  const c = PALETTE[far ? 1 : morph];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * size, size);
  ctx.rotate(pitch);
  if (far) ctx.globalAlpha = 0.82;

  const L = 13.5;
  const wingShape = (lift: number, color: string, dx: number) => {
    // a wing seen from the side: its tip swings above/below the body
    const tipY = -L * lift;
    const tipX = -7.5 + dx - Math.abs(lift) * 2.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(3 + dx, -1);
    ctx.quadraticCurveTo(0 + dx, tipY * 0.6 - 1, tipX, tipY);
    // feathered trailing edge
    ctx.lineTo(tipX + 2.2, tipY + (lift >= 0 ? 2.4 : -2.4) * 0.6);
    ctx.lineTo(tipX + 3.4, tipY * 0.82);
    ctx.lineTo(tipX + 4.8, tipY * 0.7 + (lift >= 0 ? 1.5 : -1.5));
    ctx.quadraticCurveTo(-3 + dx, -0.5, -4 + dx, 0.4);
    ctx.closePath();
    ctx.fill();
  };

  // far wing (behind the body), slightly out of phase and darker
  wingShape(wing * 0.9 + (flare ? 0.05 : 0), c.tail, 1.2);

  // tail fan
  ctx.fillStyle = c.tail;
  ctx.beginPath();
  ctx.moveTo(-6, -1.4);
  ctx.lineTo(-14.5, -2.6 - flare * 2);
  ctx.lineTo(-14.5, 1.6 + flare * 2);
  ctx.lineTo(-6, 1.2);
  ctx.closePath();
  ctx.fill();

  // body
  const g = ctx.createLinearGradient(0, -3.5, 0, 3.5);
  g.addColorStop(0, c.back);
  g.addColorStop(1, c.belly);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.2, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // neck sheen + head + beak
  if (!far) {
    ctx.fillStyle = "#5f8a77";
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(6.2, -0.9, 2.4, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = c.head;
  ctx.beginPath();
  ctx.arc(8.4, -1.3, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b2f36";
  ctx.beginPath();
  ctx.moveTo(10.4, -1.6);
  ctx.lineTo(12.2, -1.1);
  ctx.lineTo(10.4, -0.6);
  ctx.closePath();
  ctx.fill();
  if (!far) {
    ctx.fillStyle = "#e07b2c";
    ctx.beginPath();
    ctx.arc(9.1, -1.8, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // feet out for landing
  if (flare > 0) {
    ctx.strokeStyle = "#d0706f";
    ctx.lineWidth = 0.9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0.5, 2.8);
    ctx.lineTo(1.5, 2.8 + 4 * flare);
    ctx.moveTo(-1.5, 2.8);
    ctx.lineTo(-0.6, 2.8 + 4 * flare);
    ctx.stroke();
  }

  // near wing, lighter, with bars
  wingShape(wing, c.wing, 0);
  ctx.strokeStyle = c.bar;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6 * (far ? 0.82 : 1);
  ctx.beginPath();
  ctx.moveTo(1, -1 - wing * 3.2);
  ctx.lineTo(-3, -1 - wing * 5.6);
  ctx.stroke();
  ctx.restore();
}
