/**
 * Atlas engine: a hand-rolled, dependency-free dot-matrix map renderer.
 *
 * The world is sampled from two grayscale land masks (see
 * scripts/generate_atlas_masks.py) onto a grid of tiny square "pixels" that
 * share the visual language of the GitHub contribution graph. Everything
 * else (graticule, routes, markers, labels, the cursor lens) is drawn on top
 * in the same canvas, so the whole map is one compositor layer.
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

export type AtlasTheme = {
  bg: RGB;
  land: RGB;
  landAlpha: number;
  accent: RGB;
  text: RGB;
  faint: RGB;
  dark: boolean;
  mono: string;
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
  /** screen positions of land dots (css px) */
  xs: Float32Array;
  ys: Float32Array;
  /** heat 0..1: proximity to a visited place */
  heat: Float32Array;
  /** reveal delay (s) for the intro ripple */
  delay: Float32Array;
  count: number;
  pitch: number;
};

type Flight = {
  from: Camera;
  to: Camera;
  start: number;
  duration: number;
  bump: number;
};

export type AtlasCallbacks = {
  onHover?: (id: string | null) => void;
  onCursor?: (pos: { lng: number; lat: number } | null) => void;
  onSelect?: (id: string | null) => void;
  onCamera?: (cam: Camera) => void;
};

/* ───────────────────────────── math helpers ───────────────────────────── */

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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

/** Formats a coordinate pair as `12.97°N 77.59°E`. */
export function formatLngLat(lng: number, lat: number, digits = 2) {
  const la = `${Math.abs(lat).toFixed(digits)}°${lat >= 0 ? "N" : "S"}`;
  const lo = `${Math.abs(lng).toFixed(digits)}°${lng >= 0 ? "E" : "W"}`;
  return `${la} ${lo}`;
}

/* ───────────────────────────── land masks ───────────────────────────── */

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
  c.width = c.height = 0; // release backing store
  return { w: img.naturalWidth, h: img.naturalHeight, west, south, east, north, data };
}

/** Bilinear coverage 0..1, or -1 when the point is outside the mask. */
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
  const a = d[y0 * m.w + x0];
  const b = d[y0 * m.w + x1];
  const c = d[y1 * m.w + x0];
  const e = d[y1 * m.w + x1];
  return (lerp(lerp(a, b, tx), lerp(c, e, tx), ty)) / 255;
}

export type LandSampler = (lng: number, lat: number) => number;

let maskPromise: Promise<LandSampler> | null = null;

/** Loads (once per page) the world + South Asia detail masks. */
export function loadLand(): Promise<LandSampler> {
  if (!maskPromise) {
    maskPromise = Promise.all([
      loadMask("/atlas/world.png", [-180, -90, 180, 90]),
      loadMask("/atlas/south-asia.png", [60, 0, 100, 40]),
    ]).then(([world, detail]) => {
      // Fade from the detail mask into the world mask near the patch edge so
      // there is no visible seam while panning.
      const edge = 1.5;
      return (lng: number, lat: number) => {
        if (lat < -58 || lat > 84) return 0;
        lng = ((((lng + 180) % 360) + 360) % 360) - 180;
        const w = sampleMask(world, lng, lat);
        const d = sampleMask(detail, lng, lat);
        if (d < 0) return w;
        const inset = Math.min(
          lng - detail.west,
          detail.east - lng,
          lat - detail.south,
          detail.north - lat,
        );
        return lerp(w, d, clamp(inset / edge, 0, 1));
      };
    });
    maskPromise.catch(() => {
      maskPromise = null;
    });
  }
  return maskPromise;
}

/* ───────────────────────────── engine ───────────────────────────── */

const INTRO_RIPPLE = 1.5; // s, wave from home to the far edge
const ARC_DRAW = 0.9; // s per arc
const ARC_STAGGER = 0.11; // s between arcs
const LENS_R = 78; // px

export class AtlasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cache: HTMLCanvasElement;
  private cacheCtx: CanvasRenderingContext2D;

  private places: AtlasPlace[];
  private home: AtlasPlace;
  private cb: AtlasCallbacks;
  private land: LandSampler | null = null;
  private theme: AtlasTheme | null = null;

  private w = 0;
  private h = 0;
  private dpr = 1;

  cam: Camera = { lng: 20, lat: 14, k: 2 };
  private flight: Flight | null = null;
  private field: Field | null = null;
  private fieldDirty = true;
  private cacheDirty = true;

  private pointer: { x: number; y: number } | null = null;
  private lensAmt = 0; // eased 0..1
  private hovered: string | null = null;
  private selected: string | null = null;
  private hoverAmt = new Map<string, number>();

  private raf = 0;
  private running = false;
  private last = 0;
  private clock = 0;

  /** clock time the intro ripple / arcs started; -1 = not yet, Infinity = done */
  private rippleAt = -1;
  private arcsAt = -1;
  private reduced = false;

  constructor(canvas: HTMLCanvasElement, places: AtlasPlace[], cb: AtlasCallbacks = {}) {
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

  resize(w: number, h: number, dpr: number) {
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    const prevW = this.w;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    for (const c of [this.canvas, this.cache]) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    // keep the same geographic framing across resizes
    if (prevW > 0) this.cam = { ...this.cam, k: (this.cam.k * w) / prevW };
    this.invalidate();
  }

  /* ── views ── */

  /** Camera that fits a lng/lat box (with padding in px). */
  fit(west: number, south: number, east: number, north: number, pad = 28): Camera {
    const k = Math.min(
      (this.w - pad * 2) / Math.max(east - west, 0.01),
      (this.h - pad * 2) / Math.max(north - south, 0.01),
    );
    return { lng: (west + east) / 2, lat: (south + north) / 2, k: this.clampK(k) };
  }

  worldView(): Camera {
    const k = Math.max(this.w / 360, this.h / 172);
    return { lng: this.w / k >= 359 ? 0 : 22, lat: 16, k };
  }

  placesView(): Camera {
    const lngs = this.places.map((p) => p.lng);
    const lats = this.places.map((p) => p.lat);
    const padLng = 3.5;
    const padLat = 2.5;
    return this.fit(
      Math.min(...lngs) - padLng,
      Math.min(...lats) - padLat,
      Math.max(...lngs) + padLng,
      Math.max(...lats) + padLat,
    );
  }

  focusView(id: string): Camera | null {
    const p = this.places.find((q) => q.id === id);
    if (!p) return null;
    const span = 7.5; // degrees of latitude in view
    return { lng: p.lng, lat: p.lat, k: this.clampK(this.h / span) };
  }

  private clampK(k: number) {
    return clamp(k, Math.max(this.w / 360, 0.5), 220);
  }

  jumpTo(cam: Camera) {
    this.flight = null;
    this.cam = this.clampCam(cam);
    this.invalidate();
  }

  flyTo(cam: Camera, duration = 1.6) {
    const to = this.clampCam(cam);
    if (this.reduced) return this.jumpTo(to);
    const from = { ...this.cam };
    // how far the view travels, in screen widths at the wider zoom
    const kMin = Math.min(from.k, to.k);
    const travel = Math.hypot((to.lng - from.lng) * kMin, (to.lat - from.lat) * kMin) / this.w;
    const bump = clamp(travel * 0.9, 0, 1.4);
    this.flight = { from, to, start: this.clock, duration, bump };
    this.kick();
  }

  zoomBy(factor: number, anchor?: { x: number; y: number }) {
    const ax = anchor?.x ?? this.w / 2;
    const ay = anchor?.y ?? this.h / 2;
    const before = this.unproject(ax, ay);
    const k = this.clampK(this.cam.k * factor);
    const cam = { ...this.cam, k };
    // keep the anchor fixed under the cursor
    cam.lng = before.lng - (ax - this.w / 2) / k;
    cam.lat = before.lat + (ay - this.h / 2) / k;
    this.flight = null;
    this.cam = this.clampCam(cam);
    this.invalidate();
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

  private clampCam(c: Camera): Camera {
    const k = this.clampK(c.k);
    const halfW = this.w / 2 / k;
    const halfH = this.h / 2 / k;
    const lng = halfW >= 180 ? 0 : clamp(c.lng, -180 + halfW, 180 - halfW);
    const lat = halfH >= 75 ? 14 : clamp(c.lat, -60 + halfH, 85 - halfH);
    return { lng, lat, k };
  }

  /* ── intro ── */

  playIntro() {
    if (this.reduced) {
      this.rippleAt = Infinity;
      this.arcsAt = Infinity;
      this.jumpTo(this.placesView());
      return;
    }
    this.jumpTo(this.worldView());
    this.rippleAt = this.clock + 0.05;
    this.arcsAt = -1;
    this.kick();
  }

  get introDone() {
    return this.arcsAt === Infinity || (this.arcsAt >= 0 && this.clock - this.arcsAt > this.arcsTotal());
  }

  private arcsTotal() {
    return ARC_DRAW + ARC_STAGGER * this.places.length;
  }

  /* ── interaction ── */

  setPointer(p: { x: number; y: number } | null) {
    this.pointer = p;
    if (p) {
      const ll = this.unproject(p.x, p.y);
      this.cb.onCursor?.(ll);
      const hit = this.hitTest(p.x, p.y);
      this.setHovered(hit);
    } else {
      this.cb.onCursor?.(null);
      this.setHovered(null);
    }
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
    let bestD = 16;
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

  /* ── projection ── */

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

    // keep animating: markers pulse forever unless motion is reduced
    const busy =
      !this.reduced ||
      this.flight !== null ||
      Math.abs(this.lensAmt - (this.pointer ? 1 : 0)) > 0.01;
    if (busy) this.raf = requestAnimationFrame(this.tick);
  };

  private step(dt: number) {
    // camera flight
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
      if (t >= 1) {
        this.flight = null;
        this.cb.onCamera?.(this.cam);
      }
    }

    // intro choreography: ripple → fly to places → arcs
    if (this.rippleAt >= 0 && this.rippleAt !== Infinity && this.arcsAt < 0) {
      if (this.clock - this.rippleAt > INTRO_RIPPLE * 0.75 && !this.flight) {
        this.flyTo(this.placesView(), 2.1);
        this.arcsAt = this.clock + 1.7;
      }
    }

    // lens + hover easing
    const lensTarget = this.pointer ? 1 : 0;
    this.lensAmt += (lensTarget - this.lensAmt) * Math.min(1, dt * 10);
    for (const p of this.places) {
      const target = p.id === this.hovered || p.id === this.selected ? 1 : 0;
      const cur = this.hoverAmt.get(p.id) ?? 0;
      this.hoverAmt.set(p.id, cur + (target - cur) * Math.min(1, dt * 12));
    }
  }

  /* ── field (land dots for the current camera) ── */

  private buildField() {
    const land = this.land;
    if (!land || !this.w) return;
    const pitch = this.w < 480 ? 5 : 6;
    const k = this.cam.k;
    // world-anchored grid: dots slide with the map while panning
    const ox = (((this.w / 2 - this.cam.lng * k) % pitch) + pitch) % pitch;
    const oy = (((this.h / 2 + this.cam.lat * k) % pitch) + pitch) % pitch;
    const cols = Math.ceil(this.w / pitch) + 1;
    const rows = Math.ceil(this.h / pitch) + 1;
    const cap = cols * rows;
    const xs = new Float32Array(cap);
    const ys = new Float32Array(cap);
    const heat = new Float32Array(cap);
    const delay = new Float32Array(cap);

    const homeS = this.project(this.home.lng, this.home.lat);
    const far = Math.hypot(this.w, this.h);
    const marks = this.places.map((p) => this.project(p.lng, p.lat));
    const sigma = clamp(k * 1.1, 9, 22);

    let n = 0;
    for (let r = 0; r < rows; r++) {
      const y = oy + r * pitch;
      if (y < 0 || y > this.h) continue;
      const lat = this.cam.lat - (y - this.h / 2) / k;
      for (let c = 0; c < cols; c++) {
        const x = ox + c * pitch;
        if (x < 0 || x > this.w) continue;
        const lng = this.cam.lng + (x - this.w / 2) / k;
        if (land(lng, lat) < 0.5) continue;
        xs[n] = x;
        ys[n] = y;
        let hmax = 0;
        for (const m of marks) {
          const dx = m.x - x;
          const dy = m.y - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 9 * sigma * sigma) {
            const hv = Math.exp(-d2 / (2 * sigma * sigma));
            if (hv > hmax) hmax = hv;
          }
        }
        heat[n] = hmax;
        delay[n] = (Math.hypot(x - homeS.x, y - homeS.y) / far) * INTRO_RIPPLE;
        n++;
      }
    }
    this.field = { xs, ys, heat, delay, count: n, pitch };
    this.fieldDirty = false;
  }

  /* ── drawing ── */

  private draw() {
    const theme = this.theme;
    if (!theme || !this.w) return;
    if (this.fieldDirty) this.buildField();

    const ctx = this.ctx;
    const introing = this.rippleAt >= 0 && this.rippleAt !== Infinity && this.clock - this.rippleAt < INTRO_RIPPLE + 0.4;

    if (introing || this.rippleAt < 0) {
      // draw dots live (ripple reveal); nothing visible before the intro
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.drawBase(ctx, theme, this.rippleAt < 0 ? -1 : this.clock - this.rippleAt);
      this.cacheDirty = true;
    } else {
      if (this.cacheDirty) {
        this.cacheCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.drawBase(this.cacheCtx, theme, Infinity);
        this.cacheDirty = false;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(this.cache, 0, 0);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    if (!introing && this.rippleAt >= 0) this.drawSonar(ctx, theme);
    if (this.lensAmt > 0.01 && this.pointer && this.field) this.drawLens(ctx, theme);
    this.drawFocusCrosshair(ctx, theme);
    this.drawArcs(ctx, theme);
    this.drawMarkers(ctx, theme);
    this.drawLabels(ctx, theme);
    this.drawHud(ctx, theme);
  }

  /** Background, graticule and land dots. `t` = seconds since ripple start. */
  private drawBase(ctx: CanvasRenderingContext2D, theme: AtlasTheme, t: number) {
    ctx.fillStyle = rgba(theme.bg, 1);
    ctx.fillRect(0, 0, this.w, this.h);
    this.drawGraticule(ctx, theme);

    const f = this.field;
    if (!f || t < 0) return;
    const size = f.pitch * 0.4;
    const landC = theme.land;
    const accent = theme.accent;
    const levels = 6;
    const styles: string[] = [];
    for (let i = 0; i < levels; i++) {
      const h = i / (levels - 1);
      styles.push(rgba(mix(landC, accent, h * 0.9), lerp(theme.landAlpha, 0.85, h * h)));
    }
    let last = -1;
    const live = t !== Infinity;
    for (let i = 0; i < f.count; i++) {
      let s = size;
      let a = 1;
      let lv = Math.round(f.heat[i] * (levels - 1));
      if (live) {
        const local = t - f.delay[i];
        if (local <= 0) continue;
        a = clamp(local / 0.35, 0, 1);
        // bright wavefront
        const front = clamp(1 - Math.abs(local - 0.08) / 0.16, 0, 1);
        if (front > 0) lv = Math.max(lv, Math.round(front * (levels - 1)));
        s = size * (1 + front * 0.9);
      }
      s *= 1 + f.heat[i] * 0.45;
      if (lv !== last) {
        ctx.fillStyle = styles[lv];
        last = lv;
      }
      if (live) ctx.globalAlpha = a;
      ctx.fillRect(f.xs[i] - s / 2, f.ys[i] - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  private gridStep() {
    const steps = [1, 2, 5, 10, 15, 30, 60];
    return steps.find((s) => s * this.cam.k >= 70) ?? 60;
  }

  private drawGraticule(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const step = this.gridStep();
    const tl = this.unproject(0, 0);
    const br = this.unproject(this.w, this.h);
    ctx.save();
    ctx.strokeStyle = rgba(theme.text, theme.dark ? 0.045 : 0.06);
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 3]);
    ctx.beginPath();
    for (let lng = Math.ceil(tl.lng / step) * step; lng <= br.lng; lng += step) {
      const x = Math.round(this.project(lng, 0).x) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.h);
    }
    for (let lat = Math.ceil(br.lat / step) * step; lat <= tl.lat; lat += step) {
      const y = Math.round(this.project(0, lat).y) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // edge ticks
    ctx.fillStyle = rgba(theme.faint, 0.9);
    ctx.font = `9px ${theme.mono}`;
    ctx.textBaseline = "top";
    for (let lng = Math.ceil(tl.lng / step) * step; lng <= br.lng; lng += step) {
      const x = this.project(lng, 0).x;
      if (x < 24 || x > this.w - 24) continue;
      const label = `${Math.abs(lng)}°${lng === 0 ? "" : lng > 0 ? "E" : "W"}`;
      ctx.textAlign = "center";
      ctx.fillText(label, x, 6);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let lat = Math.ceil(br.lat / step) * step; lat <= tl.lat; lat += step) {
      const y = this.project(0, lat).y;
      if (y < 22 || y > this.h - 22) continue;
      const label = `${Math.abs(lat)}°${lat === 0 ? "" : lat > 0 ? "N" : "S"}`;
      ctx.fillText(label, 6, y);
    }

    // blueprint corner crosshairs
    ctx.strokeStyle = rgba(theme.faint, 0.6);
    ctx.beginPath();
    const m = 10;
    const l = 4;
    for (const [cx, cy] of [
      [m, m],
      [this.w - m, m],
      [m, this.h - m],
      [this.w - m, this.h - m],
    ]) {
      ctx.moveTo(cx - l, cy + 0.5);
      ctx.lineTo(cx + l, cy + 0.5);
      ctx.moveTo(cx + 0.5, cy - l);
      ctx.lineTo(cx + 0.5, cy + l);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** A soft ping that rolls out from home through the dot field. */
  private drawSonar(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const f = this.field;
    if (!f || this.reduced) return;
    const period = 5.5;
    const ph = ((this.clock - this.rippleAt) % period) / period;
    const home = this.project(this.home.lng, this.home.lat);
    const far = Math.hypot(Math.max(home.x, this.w - home.x), Math.max(home.y, this.h - home.y));
    const r = smooth(ph) * far;
    const band = 34;
    const fade = 1 - ph;
    if (fade <= 0.02) return;
    const base = f.pitch * 0.4;
    ctx.fillStyle = rgba(mix(theme.accent, theme.text, 0.25), 1);
    for (let i = 0; i < f.count; i++) {
      const d = Math.hypot(f.xs[i] - home.x, f.ys[i] - home.y);
      const t = 1 - Math.abs(d - r) / band;
      if (t <= 0) continue;
      const g = smooth(t) * fade;
      const s = base * (1 + f.heat[i] * 0.45) * (1 + g * 0.6);
      ctx.globalAlpha = g * (theme.dark ? 0.55 : 0.45);
      ctx.fillRect(f.xs[i] - s / 2, f.ys[i] - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  /** Magnifying glass that follows the cursor: dots swell and push outward. */
  private drawLens(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const f = this.field;
    const p = this.pointer;
    if (!f || !p) return;
    const R = LENS_R * this.lensAmt;
    if (R < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, R + 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = rgba(mix(theme.bg, theme.accent, theme.dark ? 0.035 : 0.05), 1);
    ctx.fillRect(p.x - R - 3, p.y - R - 3, R * 2 + 6, R * 2 + 6);

    const base = f.pitch * 0.4;
    for (let i = 0; i < f.count; i++) {
      const dx = f.xs[i] - p.x;
      const dy = f.ys[i] - p.y;
      if (dx > R + 8 || dx < -R - 8 || dy > R + 8 || dy < -R - 8) continue;
      const d = Math.hypot(dx, dy);
      const g = smooth(clamp(1 - d / (R + 8), 0, 1));
      const push = g * 6;
      const nx = d > 0.001 ? dx / d : 0;
      const ny = d > 0.001 ? dy / d : 0;
      const s = base * (1 + f.heat[i] * 0.45) * (1 + g * 1.5);
      const c = mix(mix(theme.land, theme.accent, f.heat[i] * 0.9), theme.text, g * 0.35);
      ctx.fillStyle = rgba(c, lerp(lerp(theme.landAlpha, 0.85, f.heat[i]), 0.95, g * 0.7));
      ctx.fillRect(f.xs[i] + nx * push - s / 2, f.ys[i] + ny * push - s / 2, s, s);
    }
    ctx.restore();

    // lens rim
    ctx.save();
    ctx.strokeStyle = rgba(theme.text, 0.12 * this.lensAmt);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R + 2, 0, Math.PI * 2);
    ctx.stroke();
    // centre reticle
    ctx.strokeStyle = rgba(theme.accent, 0.7 * this.lensAmt);
    ctx.beginPath();
    ctx.moveTo(p.x - 5, p.y + 0.5);
    ctx.lineTo(p.x - 2, p.y + 0.5);
    ctx.moveTo(p.x + 2, p.y + 0.5);
    ctx.lineTo(p.x + 5, p.y + 0.5);
    ctx.moveTo(p.x + 0.5, p.y - 5);
    ctx.lineTo(p.x + 0.5, p.y - 2);
    ctx.moveTo(p.x + 0.5, p.y + 2);
    ctx.lineTo(p.x + 0.5, p.y + 5);
    ctx.stroke();
    ctx.restore();
  }

  private arcControl(a: { x: number; y: number }, b: { x: number; y: number }) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    // bend "up" on screen; mostly-vertical routes bend left
    if (Math.abs(dy) > Math.abs(dx) * 2.2 ? nx > 0 : ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const lift = Math.min(len * 0.3, 160);
    return { x: mx + nx * lift, y: my + ny * lift };
  }

  private bez(a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) {
    const u = 1 - t;
    return {
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    };
  }

  private arcProgress(i: number) {
    if (this.arcsAt === Infinity) return 1;
    if (this.arcsAt < 0) return 0;
    return easeInOut(clamp((this.clock - this.arcsAt - i * ARC_STAGGER) / ARC_DRAW, 0, 1));
  }

  private drawArcs(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const a = this.project(this.home.lng, this.home.lat);
    const others = this.places.filter((p) => !p.home);
    ctx.save();
    ctx.lineCap = "round";
    others.forEach((p, i) => {
      const prog = this.arcProgress(i);
      if (prog <= 0) return;
      const b = this.project(p.lng, p.lat);
      const c = this.arcControl(a, b);
      const hl = this.hoverAmt.get(p.id) ?? 0;
      const segs = 48;
      const end = Math.max(1, Math.round(segs * prog));

      // base route
      ctx.strokeStyle = rgba(theme.accent, lerp(theme.dark ? 0.42 : 0.5, 0.9, hl));
      ctx.lineWidth = lerp(1.1, 1.8, hl);
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let s = 1; s <= end; s++) {
        const q = this.bez(a, c, b, s / segs);
        ctx.lineTo(q.x, q.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // drawing head during intro
      if (prog < 1) {
        const q = this.bez(a, c, b, prog);
        ctx.fillStyle = rgba(theme.accent, 1);
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      // travelling comet
      if (this.reduced) return;
      const speed = 0.38;
      const phase = (this.clock * speed + i * 0.173) % 1;
      const tail = 0.16;
      const steps = 12;
      for (let s = 0; s < steps; s++) {
        const t0 = phase - tail * (1 - s / steps);
        const t1 = phase - tail * (1 - (s + 1) / steps);
        if (t1 <= 0) continue;
        const p0 = this.bez(a, c, b, clamp(t0, 0, 1));
        const p1 = this.bez(a, c, b, clamp(t1, 0, 1));
        const k = (s + 1) / steps;
        ctx.strokeStyle = rgba(mix(theme.accent, theme.text, k * 0.55), k);
        ctx.lineWidth = 0.8 + k * 1.8;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      // comet head
      const head = this.bez(a, c, b, phase);
      const fade = Math.min(1, phase * 8, (1 - phase) * 8);
      const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 7);
      hg.addColorStop(0, rgba(mix(theme.accent, theme.text, 0.6), 0.9 * fade));
      hg.addColorStop(1, rgba(theme.accent, 0));
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private markerReveal(i: number, home: boolean) {
    if (this.arcsAt === Infinity) return 1;
    if (home) {
      if (this.rippleAt < 0) return 0;
      return clamp((this.clock - this.rippleAt) / 0.5, 0, 1);
    }
    if (this.arcsAt < 0) return 0;
    const t = (this.clock - this.arcsAt - i * ARC_STAGGER - ARC_DRAW * 0.92) / 0.45;
    return clamp(t, 0, 1);
  }

  private drawMarkers(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    let i = 0;
    for (const p of this.places) {
      const idx = p.home ? -1 : i++;
      const rv = this.markerReveal(idx, !!p.home);
      if (rv <= 0) continue;
      const pop = easeOutBack(rv);
      const s = this.project(p.lng, p.lat);
      if (s.x < -20 || s.y < -20 || s.x > this.w + 20 || s.y > this.h + 20) continue;
      const hl = this.hoverAmt.get(p.id) ?? 0;

      // pulse rings
      if (!this.reduced) {
        const period = p.home ? 2.2 : 2.8;
        for (let r = 0; r < (p.home ? 2 : 1); r++) {
          const ph = ((this.clock + (idx + 2) * 0.37 + r * (period / 2)) % period) / period;
          const rad = (p.home ? 6 : 4) + ph * (p.home ? 22 : 15) * (1 + hl * 0.4);
          ctx.strokeStyle = rgba(theme.accent, (1 - ph) * (p.home ? 0.55 : 0.4) * rv);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, rad, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // glow
      const glowR = (p.home ? 16 : 11) * (1 + hl * 0.6) * pop;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
      g.addColorStop(0, rgba(theme.accent, (theme.dark ? 0.45 : 0.35) * rv));
      g.addColorStop(1, rgba(theme.accent, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // core: home is a rotated square (diamond), places are squares
      const core = ((p.home ? 4.2 : 3.2) + hl * 1.6) * pop;
      ctx.save();
      ctx.translate(s.x, s.y);
      if (p.home) ctx.rotate(Math.PI / 4);
      ctx.fillStyle = rgba(theme.bg, 1);
      ctx.fillRect(-core - 1.5, -core - 1.5, core * 2 + 3, core * 2 + 3);
      ctx.fillStyle = rgba(mix(theme.accent, theme.text, hl * 0.35), 1);
      ctx.fillRect(-core, -core, core * 2, core * 2);
      if (p.home) {
        ctx.fillStyle = rgba(theme.bg, 1);
        ctx.fillRect(-core * 0.38, -core * 0.38, core * 0.76, core * 0.76);
      }
      ctx.restore();
    }
  }

  private drawFocusCrosshair(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    for (const p of this.places) {
      const hl = this.hoverAmt.get(p.id) ?? 0;
      if (hl < 0.02) continue;
      const s = this.project(p.lng, p.lat);
      ctx.save();
      ctx.strokeStyle = rgba(theme.accent, 0.32 * hl);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(0, Math.round(s.y) + 0.5);
      ctx.lineTo(this.w, Math.round(s.y) + 0.5);
      ctx.moveTo(Math.round(s.x) + 0.5, 0);
      ctx.lineTo(Math.round(s.x) + 0.5, this.h);
      ctx.stroke();
      ctx.setLineDash([]);

      // edge readouts
      ctx.font = `9px ${theme.mono}`;
      ctx.fillStyle = rgba(theme.accent, 0.9 * hl);
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(`${p.lat.toFixed(2)}°N`, 6, s.y - 3);
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${p.lng.toFixed(2)}°E`, s.x, this.h - 6);
      ctx.restore();
    }
  }

  private drawLabels(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const showAll = this.cam.k >= 9 && (this.arcsAt === Infinity || this.arcsAt >= 0);
    const order = [...this.places].sort((a, b) => {
      const pa = (this.hoverAmt.get(a.id) ?? 0) * 10 + (a.home ? 5 : 0);
      const pb = (this.hoverAmt.get(b.id) ?? 0) * 10 + (b.home ? 5 : 0);
      return pb - pa;
    });
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    // marker footprints are obstacles too
    for (const p of this.places) {
      const s = this.project(p.lng, p.lat);
      placed.push({ x: s.x - 6, y: s.y - 6, w: 12, h: 12 });
    }
    ctx.save();
    ctx.font = `500 9.5px ${theme.mono}`;
    ctx.textBaseline = "middle";
    let i = 0;
    for (const p of order) {
      const hl = this.hoverAmt.get(p.id) ?? 0;
      const idx = p.home ? -1 : this.places.filter((q) => !q.home).indexOf(p);
      const rv = this.markerReveal(idx, !!p.home);
      if (rv <= 0) continue;
      if (!showAll && hl < 0.05 && !p.home) continue;
      i++;
      const text = p.home ? `${p.name.toUpperCase()} · HOME` : p.name.toUpperCase();
      const tw = ctx.measureText(text).width;
      const bw = tw + 10;
      const bh = 16;
      const s = this.project(p.lng, p.lat);
      const gap = 10;
      const cands = [
        { x: s.x + gap, y: s.y - bh / 2 },
        { x: s.x - gap - bw, y: s.y - bh / 2 },
        { x: s.x - bw / 2, y: s.y - gap - bh },
        { x: s.x - bw / 2, y: s.y + gap },
      ];
      const fits = (r: { x: number; y: number }) =>
        r.x > 4 &&
        r.y > 4 &&
        r.x + bw < this.w - 4 &&
        r.y + bh < this.h - 4 &&
        placed.every(
          (o) =>
            (o.x === s.x - 6 && o.y === s.y - 6) ||
            r.x > o.x + o.w + 2 ||
            r.x + bw < o.x - 2 ||
            r.y > o.y + o.h + 2 ||
            r.y + bh < o.y - 2,
        );
      const spot = cands.find(fits) ?? (hl > 0.5 ? cands[0] : null);
      if (!spot) continue;
      placed.push({ x: spot.x, y: spot.y, w: bw, h: bh });

      const alpha = rv * lerp(showAll ? 0.9 : 0, 1, Math.max(hl, p.home ? 1 : 0));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = rgba(theme.bg, 0.88);
      ctx.strokeStyle = hl > 0.5 ? rgba(theme.accent, 0.6) : rgba(theme.text, 0.14);
      ctx.lineWidth = 1;
      roundRect(ctx, spot.x + 0.5, spot.y + 0.5, bw, bh, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = hl > 0.5 ? rgba(theme.text, 1) : rgba(theme.text, 0.78);
      ctx.textAlign = "left";
      ctx.fillText(text, spot.x + 5.5, spot.y + bh / 2 + 1);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    void i;
  }

  /** Scale bar (bottom-left). */
  private drawHud(ctx: CanvasRenderingContext2D, theme: AtlasTheme) {
    const kmPerPx = (111.32 * Math.cos((this.cam.lat * Math.PI) / 180)) / this.cam.k;
    const nice = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
    const km = nice.find((n) => n / kmPerPx >= 44) ?? 5000;
    const px = km / kmPerPx;
    const x = 14;
    const y = this.h - 14;
    ctx.save();
    ctx.strokeStyle = rgba(theme.faint, 0.9);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, y - 4);
    ctx.lineTo(x + 0.5, y + 0.5);
    ctx.lineTo(x + px + 0.5, y + 0.5);
    ctx.lineTo(x + px + 0.5, y - 4);
    ctx.stroke();
    ctx.fillStyle = rgba(theme.faint, 1);
    ctx.font = `9px ${theme.mono}`;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillText(`${km.toLocaleString()} KM`, x + px + 6, y + 3);
    ctx.restore();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ───────────────────────────── theme ───────────────────────────── */

function parseColor(input: string): { rgb: RGB; a: number } {
  const s = input.trim();
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex.slice(0, 6), 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], a: 1 };
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: [parts[0] | 0, parts[1] | 0, parts[2] | 0], a: parts[3] ?? 1 };
  }
  return { rgb: [128, 128, 128], a: 1 };
}

/** Reads the site's design tokens off the DOM so the map follows the theme. */
export function readTheme(el: HTMLElement): AtlasTheme {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name);
  const dark = document.documentElement.classList.contains("dark");
  const bg = parseColor(v("--background")).rgb;
  const fg = parseColor(v("--foreground")).rgb;
  const faint = parseColor(v("--faint")).rgb;
  // the sky-blue used by the contribution graph's highlighted numbers
  const accent: RGB = dark ? [135, 187, 234] : [74, 144, 205];
  const mono = v("--font-geist-mono").trim() || "ui-monospace, monospace";
  return {
    bg,
    land: fg,
    landAlpha: dark ? 0.2 : 0.24,
    accent,
    text: fg,
    faint,
    dark,
    mono,
  };
}
