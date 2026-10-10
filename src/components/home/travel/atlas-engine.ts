/**
 * Atlas engine: a hand-rolled, dependency-free dot-matrix map renderer.
 *
 * Land is sampled from two grayscale masks (see scripts/generate_atlas_masks.py)
 * onto a world-anchored grid of tiny squares, the same pixel language as the
 * contribution graph. Routes, markers and labels are drawn on top in the same
 * canvas, so the whole map is a single compositor layer.
 *
 * Projection: equirectangular. Camera: centre (lng, lat) + k (px per degree).
 */

export type RGB = [number, number, number];

export type AtlasPlace = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  home?: boolean;
};

export type Camera = { lng: number; lat: number; k: number };
export type Insets = { top: number; right: number; bottom: number; left: number };

export type AtlasTheme = {
  bg: RGB;
  land: RGB;
  landAlpha: number;
  accent: RGB;
  text: RGB;
  dark: boolean;
  serif: string;
};

export type AtlasOptions = {
  /** cursor lens + hover hit-testing */
  interactive?: boolean;
  /** cap on simultaneously visible place names (home always wins) */
  maxLabels?: number;
};

export type AtlasCallbacks = {
  onHover?: (id: string | null) => void;
  onIntroDone?: () => void;
};

type Mask = {
  w: number;
  h: number;
  west: number;
  south: number;
  east: number;
  north: number;
  data: Uint8Array;
};

type Field = {
  xs: Float32Array;
  ys: Float32Array;
  /** proximity to a visited place, 0..1 */
  heat: Float32Array;
  /** distance from home in px (drives the intro ripple and the ping) */
  dist: Float32Array;
  count: number;
  pitch: number;
  far: number;
};

type Flight = { from: Camera; to: Camera; start: number; duration: number; bump: number };

/* ───────────────────────────── math ───────────────────────────── */

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
];
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Great-circle distance in km. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLng = (b.lng - a.lng) * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ───────────────────────────── land ───────────────────────────── */

async function loadMask(
  src: string,
  [west, south, east, north]: [number, number, number, number],
): Promise<Mask> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, c.width, c.height).data;
  const data = new Uint8Array(c.width * c.height);
  for (let i = 0, j = 0; i < data.length; i++, j += 4) data[i] = px[j];
  c.width = c.height = 0;
  return { w: img.naturalWidth, h: img.naturalHeight, west, south, east, north, data };
}

/** Bilinear coverage 0..1, or -1 outside the mask. */
function sampleMask(m: Mask, lng: number, lat: number): number {
  if (lng < m.west || lng > m.east || lat < m.south || lat > m.north) return -1;
  const fx = ((lng - m.west) / (m.east - m.west)) * m.w - 0.5;
  const fy = ((m.north - lat) / (m.north - m.south)) * m.h - 0.5;
  const x0 = clamp(Math.floor(fx), 0, m.w - 1);
  const y0 = clamp(Math.floor(fy), 0, m.h - 1);
  const x1 = Math.min(x0 + 1, m.w - 1);
  const y1 = Math.min(y0 + 1, m.h - 1);
  const tx = clamp(fx - x0, 0, 1);
  const ty = clamp(fy - y0, 0, 1);
  const d = m.data;
  const top = lerp(d[y0 * m.w + x0], d[y0 * m.w + x1], tx);
  const bot = lerp(d[y1 * m.w + x0], d[y1 * m.w + x1], tx);
  return lerp(top, bot, ty) / 255;
}

export type LandSampler = (lng: number, lat: number) => number;

let landPromise: Promise<LandSampler> | null = null;

/** Loads (once per page) the world mask + the high-detail South Asia patch. */
export function loadLand(): Promise<LandSampler> {
  if (!landPromise) {
    landPromise = Promise.all([
      loadMask("/atlas/world.png", [-180, -90, 180, 90]),
      loadMask("/atlas/south-asia.png", [60, 0, 100, 40]),
    ]).then(([world, detail]) => {
      const edge = 1.5; // degrees of cross-fade so the patch has no seam
      return (lng: number, lat: number) => {
        if (lat < -58 || lat > 84) return 0;
        lng = ((((lng + 180) % 360) + 360) % 360) - 180;
        const w = sampleMask(world, lng, lat);
        const d = sampleMask(detail, lng, lat);
        if (d < 0) return w;
        const inset = Math.min(lng - detail.west, detail.east - lng, lat - detail.south, detail.north - lat);
        return lerp(w, d, clamp(inset / edge, 0, 1));
      };
    });
    landPromise.catch(() => {
      landPromise = null;
    });
  }
  return landPromise;
}

/* ───────────────────────────── engine ───────────────────────────── */

const RIPPLE = 1.4; // s for the reveal to cross the view
const ARC_DRAW = 1.1; // s per route
const ARC_STAGGER = 0.09; // s between routes
const LENS_R = 70; // px
const COMET_CYCLE = 6.5; // s between comets on the same route
const COMET_TRAVEL = 2.4; // s a comet takes to arrive

export class AtlasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cache: HTMLCanvasElement;
  private cacheCtx: CanvasRenderingContext2D;

  private places: AtlasPlace[];
  private routes: AtlasPlace[];
  private home: AtlasPlace;
  private opts: Required<AtlasOptions>;
  private cb: AtlasCallbacks;
  private land: LandSampler | null = null;
  private theme: AtlasTheme | null = null;

  private w = 0;
  private h = 0;
  private dpr = 1;
  private insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

  cam: Camera = { lng: 78, lat: 18, k: 10 };
  private flight: Flight | null = null;
  private field: Field | null = null;
  private fieldDirty = true;
  private cacheDirty = true;

  private pointer: { x: number; y: number } | null = null;
  private lensAmt = 0;
  private hovered: string | null = null;
  private selected: string | null = null;
  private emphasis = new Map<string, number>();
  private focusAmt = 0; // 0..1, something is hovered/selected

  private raf = 0;
  private running = false;
  private last = 0;
  private clock = 0;

  /** clock time the intro started; -1 = waiting, Infinity = skipped */
  private introAt = -1;
  private introNotified = false;
  private reduced = false;

  constructor(
    canvas: HTMLCanvasElement,
    places: AtlasPlace[],
    opts: AtlasOptions = {},
    cb: AtlasCallbacks = {},
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.cache = document.createElement("canvas");
    const cctx = this.cache.getContext("2d", { alpha: false });
    if (!cctx) throw new Error("2d context unavailable");
    this.cacheCtx = cctx;
    this.places = places;
    this.home = places.find((p) => p.home) ?? places[0];
    this.routes = places.filter((p) => p !== this.home);
    this.opts = { interactive: opts.interactive ?? true, maxLabels: opts.maxLabels ?? 99 };
    this.cb = cb;
  }

  /* ── setup ── */

  setLand(land: LandSampler) {
    this.land = land;
    this.invalidate();
  }

  setTheme(theme: AtlasTheme) {
    this.theme = theme;
    this.cacheDirty = true;
    this.kick();
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
  }

  setInsets(insets: Insets) {
    this.insets = insets;
  }

  resize(w: number, h: number, dpr: number) {
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    const first = this.w === 0;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    for (const c of [this.canvas, this.cache]) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    if (first || !this.flight) this.cam = first ? this.homeView() : this.clampCam(this.cam);
    this.invalidate();
  }

  get size() {
    return { w: this.w, h: this.h };
  }

  /* ── camera ── */

  /** The resting view: every place in frame, inside the insets. */
  homeView(): Camera {
    const lngs = this.places.map((p) => p.lng);
    const lats = this.places.map((p) => p.lat);
    const pad = 2.2;
    return this.fit(
      Math.min(...lngs) - pad,
      Math.min(...lats) - pad,
      Math.max(...lngs) + pad,
      Math.max(...lats) + pad,
    );
  }

  /** Close-up on one place. */
  focusView(id: string): Camera | null {
    const p = this.places.find((q) => q.id === id);
    if (!p) return null;
    const i = this.insets;
    const span = 6; // degrees of latitude visible in the free area
    const k = this.clampK((this.h - i.top - i.bottom) / span);
    return this.centerOn(p.lng, p.lat, k);
  }

  private fit(west: number, south: number, east: number, north: number): Camera {
    const i = this.insets;
    const aw = Math.max(this.w - i.left - i.right, 40);
    const ah = Math.max(this.h - i.top - i.bottom, 40);
    const k = this.clampK(Math.min(aw / (east - west), ah / (north - south)));
    return this.centerOn((west + east) / 2, (south + north) / 2, k);
  }

  /** Camera that puts (lng, lat) in the centre of the inset area. */
  private centerOn(lng: number, lat: number, k: number): Camera {
    const i = this.insets;
    const cx = i.left + (this.w - i.left - i.right) / 2;
    const cy = i.top + (this.h - i.top - i.bottom) / 2;
    return { lng: lng - (cx - this.w / 2) / k, lat: lat + (cy - this.h / 2) / k, k };
  }

  private clampK(k: number) {
    return clamp(k, Math.max(this.w / 300, 0.8), 260);
  }

  private clampCam(c: Camera): Camera {
    const k = this.clampK(c.k);
    const halfW = this.w / 2 / k;
    const halfH = this.h / 2 / k;
    const lng = halfW >= 180 ? 0 : clamp(c.lng, -180 + halfW, 180 - halfW);
    const lat = halfH >= 70 ? 12 : clamp(c.lat, -58 + halfH, 82 - halfH);
    return { lng, lat, k };
  }

  /** True when the camera has drifted away from the resting view. */
  isAway() {
    const hv = this.homeView();
    const dx = Math.abs(hv.lng - this.cam.lng) * hv.k;
    const dy = Math.abs(hv.lat - this.cam.lat) * hv.k;
    return dx + dy > 24 || Math.abs(Math.log(this.cam.k / hv.k)) > 0.15;
  }

  jumpTo(cam: Camera) {
    this.flight = null;
    this.cam = this.clampCam(cam);
    this.invalidate();
  }

  flyTo(cam: Camera, duration = 1.4) {
    const to = this.clampCam(cam);
    if (this.reduced) return this.jumpTo(to);
    const from = { ...this.cam };
    const kMin = Math.min(from.k, to.k);
    const travel = Math.hypot((to.lng - from.lng) * kMin, (to.lat - from.lat) * kMin) / this.w;
    this.flight = { from, to, start: this.clock, duration, bump: clamp(travel * 0.8, 0, 1.1) };
    this.kick();
  }

  zoomBy(factor: number, anchor?: { x: number; y: number }) {
    const ax = anchor?.x ?? this.w / 2;
    const ay = anchor?.y ?? this.h / 2;
    const before = this.unproject(ax, ay);
    const k = this.clampK(this.cam.k * factor);
    this.flight = null;
    this.cam = this.clampCam({
      lng: before.lng - (ax - this.w / 2) / k,
      lat: before.lat + (ay - this.h / 2) / k,
      k,
    });
    this.invalidate();
  }

  /** Animated zoom for buttons. */
  zoomStep(factor: number) {
    this.flyTo({ ...this.cam, k: this.cam.k * factor }, 0.45);
  }

  panBy(dx: number, dy: number) {
    this.flight = null;
    this.cam = this.clampCam({
      ...this.cam,
      lng: this.cam.lng - dx / this.cam.k,
      lat: this.cam.lat + dy / this.cam.k,
    });
    this.invalidate();
  }

  /* ── intro ── */

  playIntro() {
    this.jumpTo(this.homeView());
    if (this.reduced) {
      this.introAt = Infinity;
      this.finishIntro();
      return;
    }
    this.introAt = this.clock + 0.05;
    this.introNotified = false;
    this.kick();
  }

  private get introT() {
    return this.introAt < 0 ? -1 : this.introAt === Infinity ? Infinity : this.clock - this.introAt;
  }

  private finishIntro() {
    if (this.introNotified) return;
    this.introNotified = true;
    this.cb.onIntroDone?.();
  }

  /* ── interaction ── */

  setPointer(p: { x: number; y: number } | null) {
    this.pointer = p;
    this.setHovered(p && this.opts.interactive ? this.hitTest(p.x, p.y) : null);
    this.kick();
  }

  setHovered(id: string | null) {
    if (id === this.hovered) return;
    this.hovered = id;
    this.cb.onHover?.(id);
    this.kick();
  }

  setSelected(id: string | null) {
    this.selected = id;
    this.kick();
  }

  hitTest(x: number, y: number): string | null {
    let best: string | null = null;
    let bestD = 18;
    for (const p of this.places) {
      const s = this.project(p.lng, p.lat);
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < bestD) {
        bestD = d;
        best = p.id;
      }
    }
    return best;
  }

  project(lng: number, lat: number) {
    return {
      x: this.w / 2 + (lng - this.cam.lng) * this.cam.k,
      y: this.h / 2 - (lat - this.cam.lat) * this.cam.k,
    };
  }

  unproject(x: number, y: number) {
    return {
      lng: this.cam.lng + (x - this.w / 2) / this.cam.k,
      lat: this.cam.lat - (y - this.h / 2) / this.cam.k,
    };
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
    this.cache.width = this.cache.height = 0;
  }

  private kick() {
    if (this.running && !this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  private invalidate() {
    this.fieldDirty = true;
    this.cacheDirty = true;
    this.kick();
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.clock += dt;
    this.step(dt);
    this.draw();
    // ambient motion keeps the loop alive; with reduced motion we only
    // animate while something is actually changing
    const settling =
      this.flight !== null ||
      Math.abs(this.lensAmt - (this.pointer ? 1 : 0)) > 0.01 ||
      [...this.emphasis.values()].some((v) => v > 0.01 && v < 0.99);
    if (!this.reduced || settling) this.raf = requestAnimationFrame(this.tick);
  };

  private step(dt: number) {
    if (this.flight) {
      const f = this.flight;
      const t = clamp((this.clock - f.start) / f.duration, 0, 1);
      const e = easeInOut(t);
      const logK = lerp(Math.log(f.from.k), Math.log(f.to.k), e) - f.bump * Math.sin(Math.PI * e);
      this.cam = this.clampCam({
        lng: lerp(f.from.lng, f.to.lng, e),
        lat: lerp(f.from.lat, f.to.lat, e),
        k: Math.exp(logK),
      });
      this.fieldDirty = true;
      this.cacheDirty = true;
      if (t >= 1) this.flight = null;
    }

    const it = this.introT;
    if (it !== Infinity && it > this.introLength()) this.finishIntro();

    const ease = Math.min(1, dt * 9);
    this.lensAmt += ((this.pointer ? 1 : 0) - this.lensAmt) * ease;
    let focus = 0;
    for (const p of this.places) {
      const target = p.id === this.hovered || p.id === this.selected ? 1 : 0;
      const cur = this.emphasis.get(p.id) ?? 0;
      const next = cur + (target - cur) * ease;
      this.emphasis.set(p.id, next);
      focus = Math.max(focus, next);
    }
    this.focusAmt = focus;
  }

  private introLength() {
    return RIPPLE * 0.55 + ARC_DRAW + ARC_STAGGER * this.routes.length + 0.5;
  }

  /* ── field ── */

  private buildField() {
    const land = this.land;
    if (!land || !this.w) return;
    const pitch = this.w < 480 ? 5 : this.w > 1300 ? 7 : 6;
    const k = this.cam.k;
    const ox = (((this.w / 2 - this.cam.lng * k) % pitch) + pitch) % pitch;
    const oy = (((this.h / 2 + this.cam.lat * k) % pitch) + pitch) % pitch;
    const cols = Math.ceil(this.w / pitch) + 1;
    const rows = Math.ceil(this.h / pitch) + 1;
    const cap = cols * rows;
    const xs = new Float32Array(cap);
    const ys = new Float32Array(cap);
    const heat = new Float32Array(cap);
    const dist = new Float32Array(cap);

    const home = this.project(this.home.lng, this.home.lat);
    const marks = this.places.map((p) => this.project(p.lng, p.lat));
    const sigma = clamp(k * 0.9, 8, 18);
    const cut = 9 * sigma * sigma;
    let far = 1;

    let n = 0;
    for (let r = 0; r < rows; r++) {
      const y = oy + r * pitch;
      if (y > this.h) break;
      const lat = this.cam.lat - (y - this.h / 2) / k;
      for (let c = 0; c < cols; c++) {
        const x = ox + c * pitch;
        if (x > this.w) break;
        if (land(this.cam.lng + (x - this.w / 2) / k, lat) < 0.5) continue;
        xs[n] = x;
        ys[n] = y;
        let hmax = 0;
        for (const m of marks) {
          const dx = m.x - x;
          const dy = m.y - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < cut) {
            const hv = Math.exp(-d2 / (2 * sigma * sigma));
            if (hv > hmax) hmax = hv;
          }
        }
        heat[n] = hmax;
        const d = Math.hypot(x - home.x, y - home.y);
        dist[n] = d;
        if (d > far) far = d;
        n++;
      }
    }
    this.field = { xs, ys, heat, dist, count: n, pitch, far };
    this.fieldDirty = false;
  }

  /* ── drawing ── */

  private draw() {
    const theme = this.theme;
    if (!theme || !this.w) return;
    if (this.fieldDirty) this.buildField();
    const ctx = this.ctx;
    const it = this.introT;
    const revealing = it >= 0 && it < RIPPLE + 0.4;

    if (it < 0 || revealing) {
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.drawDots(ctx, theme, it);
      this.cacheDirty = true;
    } else {
      if (this.cacheDirty) {
        this.cacheCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.drawDots(this.cacheCtx, theme, Infinity);
        this.cacheDirty = false;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(this.cache, 0, 0);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.drawPing(ctx, theme);
    }

    if (this.opts.interactive && this.lensAmt > 0.01 && this.pointer) this.drawLens(ctx, theme);
    this.drawRoutes(ctx, theme);
    this.drawMarkers(ctx, theme);
    this.drawLabels(ctx, theme);
  }

  private dotStyles(theme: AtlasTheme) {
    const levels = 6;
    const styles: string[] = [];
    for (let i = 0; i < levels; i++) {
      const h = i / (levels - 1);
      styles.push(rgba(mix(theme.land, theme.accent, h * 0.75), lerp(theme.landAlpha, theme.dark ? 0.55 : 0.6, h)));
    }
    return styles;
  }

  /** Background + land dots. `t` = seconds into the intro (Infinity = settled). */
  private drawDots(ctx: CanvasRenderingContext2D, theme: AtlasTheme, t: number) {
    ctx.fillStyle = rgba(theme.bg, 1);
    ctx.fillRect(0, 0, this.w, this.h);
    const f = this.field;
    if (!f || t < 0) return;
    const size = f.pitch * 0.38;
    const styles = this.dotStyles(theme);
    const top = styles.length - 1;
    const live = t !== Infinity;
    const front = (t / RIPPLE) * f.far;
    let last = -1;
    for (let i = 0; i < f.count; i++) {
      let s = size * (1 + f.heat[i] * 0.3);
      let lv = Math.round(f.heat[i] * top);
      if (live) {
        const behind = front - f.dist[i];
        if (behind <= 0) continue;
        const a = clamp(behind / 90, 0, 1);
        ctx.globalAlpha = a;
        // a soft swell rides the wavefront
        const crest = clamp(1 - behind / 60, 0, 1);
        if (crest > 0) {
          lv = Math.max(lv, Math.round(crest * top * 0.8));
          s *= 1 + crest * 0.5;
        }
      }
      if (lv !== last) {
        ctx.fillStyle = styles[lv];
        last = lv;
      }
      ctx.fillRect(f.xs[i] - s / 2, f.ys[i] - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  /** A slow, faint breath that rolls out from home every few seconds. */
  private drawPing(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const f = this.field;
    if (!f || this.reduced) return;
    const period = 7;
    const ph = ((this.clock - Math.max(0, this.introAt)) % period) / period;
    const r = easeOut(ph) * f.far;
    const band = 46;
    const fade = Math.pow(1 - ph, 1.5) * (1 - this.focusAmt * 0.7);
    if (fade < 0.03) return;
    const base = f.pitch * 0.38;
    ctx.fillStyle = rgba(theme.accent, 1);
    for (let i = 0; i < f.count; i++) {
      const t = 1 - Math.abs(f.dist[i] - r) / band;
      if (t <= 0) continue;
      const g = smooth(t) * fade;
      const s = base * (1 + f.heat[i] * 0.3);
      ctx.globalAlpha = g * (theme.dark ? 0.32 : 0.26);
      ctx.fillRect(f.xs[i] - s / 2, f.ys[i] - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  /** Gentle magnifier: dots near the cursor swell and lean outward. */
  private drawLens(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const f = this.field;
    const p = this.pointer;
    if (!f || !p) return;
    const R = LENS_R;
    const amt = this.lensAmt;
    const styles = this.dotStyles(theme);
    const top = styles.length - 1;
    const base = f.pitch * 0.38;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, R + f.pitch, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = rgba(theme.bg, 1);
    ctx.fillRect(p.x - R - 10, p.y - R - 10, R * 2 + 20, R * 2 + 20);
    let last = -1;
    for (let i = 0; i < f.count; i++) {
      const dx = f.xs[i] - p.x;
      const dy = f.ys[i] - p.y;
      if (dx > R + 10 || dx < -R - 10 || dy > R + 10 || dy < -R - 10) continue;
      const d = Math.hypot(dx, dy);
      const g = smooth(clamp(1 - d / R, 0, 1)) * amt;
      const push = g * 4;
      const nx = d > 0.001 ? dx / d : 0;
      const ny = d > 0.001 ? dy / d : 0;
      const s = base * (1 + f.heat[i] * 0.3) * (1 + g * 0.9);
      const lv = Math.min(top, Math.round(f.heat[i] * top + g * 2));
      if (lv !== last) {
        ctx.fillStyle = styles[lv];
        last = lv;
      }
      ctx.fillRect(f.xs[i] + nx * push - s / 2, f.ys[i] + ny * push - s / 2, s, s);
    }
    ctx.restore();
  }

  private control(a: { x: number; y: number }, b: { x: number; y: number }) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if (Math.abs(dy) > Math.abs(dx) * 2.2 ? nx > 0 : ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const lift = Math.min(len * 0.22, 120);
    return { x: mx + nx * lift, y: my + ny * lift };
  }

  private bez(a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) {
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  }

  private routeProgress(i: number) {
    const it = this.introT;
    if (it === Infinity) return 1;
    if (it < 0) return 0;
    return easeInOut(clamp((it - RIPPLE * 0.55 - i * ARC_STAGGER) / ARC_DRAW, 0, 1));
  }

  private drawRoutes(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const a = this.project(this.home.lng, this.home.lat);
    ctx.save();
    ctx.lineCap = "round";
    this.routes.forEach((p, i) => {
      const prog = this.routeProgress(i);
      if (prog <= 0) return;
      const b = this.project(p.lng, p.lat);
      const c = this.control(a, b);
      const em = this.emphasis.get(p.id) ?? 0;
      // when one place is in focus, the rest step back
      const dim = 1 - this.focusAmt * 0.65 * (1 - em);
      const segs = 40;
      const end = Math.max(1, Math.round(segs * prog));
      const path = new Path2D();
      path.moveTo(a.x, a.y);
      for (let s = 1; s <= end; s++) {
        const q = this.bez(a, c, b, s / segs);
        path.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = rgba(theme.accent, lerp(theme.dark ? 0.32 : 0.4, 0.85, em) * dim);
      ctx.lineWidth = lerp(1, 1.6, em);
      ctx.stroke(path);

      if (prog < 1 || this.reduced) return;

      // an occasional traveller, staggered so only a few are ever in flight
      const local = (this.clock + i * (COMET_CYCLE / this.routes.length) * 1.7) % COMET_CYCLE;
      if (local > COMET_TRAVEL) return;
      const t = easeInOut(local / COMET_TRAVEL);
      const tail = 0.18;
      const steps = 10;
      for (let s = 0; s < steps; s++) {
        const k0 = s / steps;
        const k1 = (s + 1) / steps;
        const t0 = t - tail * (1 - k0);
        const t1 = t - tail * (1 - k1);
        if (t1 <= 0) continue;
        const p0 = this.bez(a, c, b, clamp(t0, 0, 1));
        const p1 = this.bez(a, c, b, clamp(t1, 0, 1));
        ctx.strokeStyle = rgba(mix(theme.accent, theme.text, k1 * 0.4), k1 * 0.85 * dim);
        ctx.lineWidth = 0.8 + k1 * 1.2;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  private markerReveal(i: number) {
    const it = this.introT;
    if (it === Infinity) return 1;
    if (it < 0) return 0;
    if (i < 0) return clamp(it / 0.5, 0, 1); // home appears with the ripple
    return clamp((it - RIPPLE * 0.55 - i * ARC_STAGGER - ARC_DRAW * 0.9) / 0.4, 0, 1);
  }

  private drawMarkers(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const drawOne = (p: AtlasPlace, i: number) => {
      const rv = this.markerReveal(i);
      if (rv <= 0) return;
      const s = this.project(p.lng, p.lat);
      if (s.x < -30 || s.y < -30 || s.x > this.w + 30 || s.y > this.h + 30) return;
      const em = this.emphasis.get(p.id) ?? 0;
      const dim = p.home ? 1 : 1 - this.focusAmt * 0.5 * (1 - em);
      const pop = easeOutBack(rv);

      // only home breathes
      if (p.home && !this.reduced) {
        const period = 2.6;
        for (let r = 0; r < 2; r++) {
          const ph = ((this.clock + r * (period / 2)) % period) / period;
          ctx.strokeStyle = rgba(theme.accent, (1 - ph) * 0.45 * rv);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 5 + easeOut(ph) * 18, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      const glowR = (p.home ? 14 : 9 + em * 6) * pop;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
      g.addColorStop(0, rgba(theme.accent, (theme.dark ? 0.4 : 0.3) * rv * dim));
      g.addColorStop(1, rgba(theme.accent, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      const core = ((p.home ? 3.6 : 2.6) + em * 1.4) * pop;
      ctx.save();
      ctx.translate(s.x, s.y);
      if (p.home) ctx.rotate(Math.PI / 4);
      ctx.globalAlpha = dim;
      ctx.fillStyle = rgba(theme.bg, 1);
      ctx.fillRect(-core - 1.5, -core - 1.5, core * 2 + 3, core * 2 + 3);
      ctx.fillStyle = rgba(mix(theme.accent, theme.text, em * 0.3), 1);
      ctx.fillRect(-core, -core, core * 2, core * 2);
      ctx.restore();
    };
    this.routes.forEach((p, i) => drawOne(p, i));
    drawOne(this.home, -1);
  }

  /** Serif place names with a soft halo; greedy placement, no overlaps. */
  private drawLabels(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const ranked = [...this.places].sort((a, b) => {
      const ea = this.emphasis.get(a.id) ?? 0;
      const eb = this.emphasis.get(b.id) ?? 0;
      if (ea !== eb) return eb - ea;
      if (a.home !== b.home) return a.home ? -1 : 1;
      return 0;
    });
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    const markers = this.places.map((p) => ({ id: p.id, ...this.project(p.lng, p.lat) }));
    let shown = 0;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    for (const p of ranked) {
      const idx = p.home ? -1 : this.routes.indexOf(p);
      const rv = this.markerReveal(idx);
      if (rv <= 0) continue;
      const em = this.emphasis.get(p.id) ?? 0;
      if (shown >= this.opts.maxLabels && em < 0.05) continue;
      const size = p.home || em > 0.5 ? 15 : 13;
      ctx.font = `${size}px ${theme.serif}`;
      const tw = ctx.measureText(p.name).width;
      const bh = size + 2;
      const s = this.project(p.lng, p.lat);
      const gap = p.home ? 13 : 9;
      const cands = [
        { x: s.x + gap, y: s.y - bh / 2 },
        { x: s.x - gap - tw, y: s.y - bh / 2 },
        { x: s.x - tw / 2, y: s.y - gap - bh },
        { x: s.x - tw / 2, y: s.y + gap },
      ];
      const fits = (r: { x: number; y: number }) =>
        r.x > 6 &&
        r.y > 6 &&
        r.x + tw < this.w - 6 &&
        r.y + bh < this.h - 6 &&
        boxes.every((o) => r.x > o.x + o.w + 4 || r.x + tw < o.x - 4 || r.y > o.y + o.h + 1 || r.y + bh < o.y - 1) &&
        markers.every(
          (m) => m.id === p.id || m.x < r.x - 5 || m.x > r.x + tw + 5 || m.y < r.y - 5 || m.y > r.y + bh + 5,
        );
      const spot = cands.find(fits) ?? (em > 0.5 ? cands[0] : null);
      if (!spot) continue;
      boxes.push({ x: spot.x, y: spot.y, w: tw, h: bh });
      shown++;

      const dim = p.home ? 1 : 1 - this.focusAmt * 0.6 * (1 - em);
      const color = mix(mix(theme.text, theme.bg, p.home ? 0.05 : 0.22), theme.accent, em * 0.6);
      ctx.globalAlpha = rv * dim;
      ctx.strokeStyle = rgba(theme.bg, 0.92);
      ctx.lineWidth = 4;
      ctx.strokeText(p.name, spot.x, spot.y + bh / 2);
      ctx.fillStyle = rgba(color, 1);
      ctx.fillText(p.name, spot.x, spot.y + bh / 2);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

/* ───────────────────────────── theme ───────────────────────────── */

function parseColor(input: string): RGB {
  const s = input.trim();
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return [parts[0] | 0, parts[1] | 0, parts[2] | 0];
  }
  return [128, 128, 128];
}

/** Reads the site's design tokens so the map follows the theme. */
export function readTheme(el: HTMLElement): AtlasTheme {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name);
  const dark = document.documentElement.classList.contains("dark");
  const fg = parseColor(v("--foreground"));
  return {
    bg: parseColor(v("--background")),
    land: fg,
    landAlpha: dark ? 0.17 : 0.2,
    // the sky blue the contribution graph uses for its highlighted numbers
    accent: dark ? [135, 187, 234] : [74, 144, 205],
    text: fg,
    dark,
    serif: v("--font-instrument-serif").trim() || "Georgia, serif",
  };
}
