/**
 * GPU dot layer for the atlas.
 *
 * Two passes, both on a single WebGL1 context:
 *  1. CELLS (runs only when the camera / size changes): one fragment per grid
 *     cell (~10k) samples the land masks (hardware bilinear filtering) and the
 *     glow around every place, writing land + heat into a tiny RGBA texture.
 *  2. DOTS (every frame): one full-screen pass reads that texture and draws
 *     each square, pixel-aligned, plus the intro ripple, the ping and the
 *     cursor lens. Per-frame CPU cost is a handful of uniforms.
 *
 * Requires high-precision floats in fragment shaders (world coordinates need
 * them); `create()` returns null otherwise and the engine keeps its Canvas2D
 * path. Context loss is reported via `onLost` so the engine can fall back.
 */

import type { RGB } from "./atlas-engine";

export type MaskData = {
  w: number;
  h: number;
  west: number;
  south: number;
  east: number;
  north: number;
  data: Uint8Array;
};

export type DotFrame = {
  w: number;
  h: number;
  dpr: number;
  cam: { lng: number; lat: number; k: number };
  pitch: number;
  ox: number;
  oy: number;
  cols: number;
  rows: number;
  /** base dot size in css px */
  base: number;
  bg: RGB;
  land: RGB;
  accent: RGB;
  landAlpha: number;
  heatAlpha: number;
  heatMix: number;
  home: { x: number; y: number };
  /** place positions in css px (screen space) */
  places: { x: number; y: number }[];
  sigma: number;
  /** intro: enabled, wavefront radius in px (-1 = nothing revealed yet) */
  intro: { on: boolean; front: number };
  ping: { r: number; band: number; strength: number };
  lens: { x: number; y: number; r: number; amt: number };
  /** set when the cell texture must be recomputed */
  cellsDirty: boolean;
};

const MAX_PLACES = 64;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const CELLS_FRAG = `
precision highp float;
uniform vec2 u_cells;
uniform vec2 u_origin;
uniform float u_pitch;
uniform vec2 u_view;
uniform vec3 u_cam;
uniform sampler2D u_world;
uniform sampler2D u_detail;
uniform vec4 u_box;
uniform vec2 u_places[${MAX_PLACES}];
uniform int u_count;
uniform float u_sigma;

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 p = u_origin + cell * u_pitch;
  float lng = u_cam.x + (p.x - u_view.x * 0.5) / u_cam.z;
  float lat = u_cam.y - (p.y - u_view.y * 0.5) / u_cam.z;
  float land = 0.0;
  if (lat > -58.0 && lat < 84.0) {
    float L = mod(lng + 180.0, 360.0) - 180.0;
    float w = texture2D(u_world, vec2((L + 180.0) / 360.0, (90.0 - lat) / 180.0)).r;
    float inset = min(min(L - u_box.x, u_box.z - L), min(lat - u_box.y, u_box.w - lat));
    if (inset > 0.0) {
      vec2 duv = vec2((L - u_box.x) / (u_box.z - u_box.x), (u_box.w - lat) / (u_box.w - u_box.y));
      float d = texture2D(u_detail, duv).r;
      land = mix(w, d, clamp(inset / 1.5, 0.0, 1.0));
    } else {
      land = w;
    }
  }
  float heat = 0.0;
  float inv = 1.0 / (2.0 * u_sigma * u_sigma);
  for (int i = 0; i < ${MAX_PLACES}; i++) {
    if (i >= u_count) break;
    vec2 d = u_places[i] - p;
    heat = max(heat, exp(-dot(d, d) * inv));
  }
  gl_FragColor = vec4(step(0.5, land), heat, 0.0, 1.0);
}
`;

const DOTS_FRAG = `
precision highp float;
uniform sampler2D u_cellTex;
uniform vec2 u_cells;
uniform vec2 u_origin;
uniform float u_pitch;
uniform float u_dpr;
uniform float u_hpx;
uniform float u_base;
uniform vec3 u_bg;
uniform vec3 u_land;
uniform vec3 u_accent;
uniform float u_landA;
uniform float u_heatA;
uniform float u_heatMix;
uniform vec2 u_home;
uniform vec2 u_intro;
uniform vec3 u_ping;
uniform vec4 u_lens;

void main() {
  vec2 fc = vec2(gl_FragCoord.x, u_hpx - gl_FragCoord.y);
  vec2 css = fc / u_dpr;
  vec2 cell = floor((css - u_origin) / u_pitch + 0.5);
  vec3 rgb = u_bg;
  if (cell.x >= 0.0 && cell.y >= 0.0 && cell.x < u_cells.x && cell.y < u_cells.y) {
    vec4 c = texture2D(u_cellTex, (cell + 0.5) / u_cells);
    if (c.r > 0.5) {
      vec2 center = u_origin + cell * u_pitch;
      float heat = c.g;
      float s = u_base * (1.0 + heat * 0.3);
      float lv = heat;
      float a = 1.0;
      float d = distance(center, u_home);
      bool show = true;
      if (u_intro.x > 0.5) {
        float behind = u_intro.y - d;
        if (behind <= 0.0) {
          show = false;
        } else {
          a = clamp(behind / 90.0, 0.0, 1.0);
          float crest = clamp(1.0 - behind / 60.0, 0.0, 1.0);
          lv = max(lv, crest * 0.8);
          s *= 1.0 + crest * 0.5;
        }
      }
      if (show) {
        if (u_lens.w > 0.01) {
          float g = smoothstep(0.0, 1.0, clamp(1.0 - distance(center, u_lens.xy) / u_lens.z, 0.0, 1.0)) * u_lens.w;
          s *= 1.0 + g * 0.9;
          lv = min(1.0, lv + g * 0.4);
        }
        float sd = max(1.0, floor(s * u_dpr + 0.5));
        vec2 c0 = floor(center * u_dpr - sd * 0.5 + 0.5);
        vec2 q = fc - c0;
        if (q.x >= 0.0 && q.y >= 0.0 && q.x < sd && q.y < sd) {
          vec3 col = mix(u_land, u_accent, lv * u_heatMix);
          float alpha = mix(u_landA, u_heatA, lv) * a;
          rgb = mix(u_bg, col, alpha);
          if (u_ping.z > 0.0) {
            float t = 1.0 - abs(d - u_ping.x) / u_ping.y;
            if (t > 0.0) rgb = mix(rgb, u_accent, smoothstep(0.0, 1.0, t) * u_ping.z);
          }
        }
      }
    }
  }
  gl_FragColor = vec4(rgb, 1.0);
}
`;

type Program = { prog: WebGLProgram; loc: Record<string, WebGLUniformLocation | null> };

export class DotLayerGL {
  private gl: WebGLRenderingContext;
  private cells: Program;
  private dots: Program;
  private quad: WebGLBuffer;
  private world: WebGLTexture | null = null;
  private detail: WebGLTexture | null = null;
  private box: [number, number, number, number] = [0, 0, 1, 1];
  private cellTex: WebGLTexture;
  private fbo: WebGLFramebuffer;
  private cellSize = { cols: 0, rows: 0 };
  private placeBuf = new Float32Array(MAX_PLACES * 2);
  private lost = false;
  onLost: (() => void) | null = null;

  /** Returns null when WebGL or high-precision fragment floats are unavailable. */
  static create(canvas: HTMLCanvasElement): DotLayerGL | null {
    try {
      const gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      }) as WebGLRenderingContext | null;
      if (!gl) return null;
      const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      if (!hp || hp.precision < 16) return null;
      // software-emulated WebGL (blocklisted GPUs, VMs) is slower than our
      // Canvas2D path, so treat it as unavailable
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return null;
      }
      return new DotLayerGL(canvas, gl);
    } catch {
      return null;
    }
  }

  private constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.gl = gl;
    this.cells = this.program(CELLS_FRAG, [
      "u_cells", "u_origin", "u_pitch", "u_view", "u_cam", "u_world", "u_detail", "u_box", "u_places", "u_count", "u_sigma",
    ]);
    this.dots = this.program(DOTS_FRAG, [
      "u_cellTex", "u_cells", "u_origin", "u_pitch", "u_dpr", "u_hpx", "u_base", "u_bg", "u_land", "u_accent",
      "u_landA", "u_heatA", "u_heatMix", "u_home", "u_intro", "u_ping", "u_lens",
    ]);
    // one oversized triangle covers the viewport
    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.cellTex = this.texture(gl.NEAREST);
    this.fbo = gl.createFramebuffer()!;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.lost = true;
      this.onLost?.();
    });
  }

  get ok() {
    return !this.lost && !this.gl.isContextLost();
  }

  private program(frag: string, uniforms: string[]): Program {
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh) ?? "shader compile failed");
      }
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(prog, 0, "a_pos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) ?? "program link failed");
    }
    const loc: Program["loc"] = {};
    for (const u of uniforms) loc[u] = gl.getUniformLocation(prog, u);
    return { prog, loc };
  }

  private texture(filter: number) {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /** Uploads both land masks once (single-channel, hardware-filtered). */
  setMasks(world: MaskData, detail: MaskData) {
    const gl = this.gl;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    this.world = this.texture(gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, world.w, world.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, world.data);
    this.detail = this.texture(gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, detail.w, detail.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, detail.data);
    this.box = [detail.west, detail.south, detail.east, detail.north];
  }

  get hasMasks() {
    return this.world !== null;
  }

  resize(wPx: number, hPx: number) {
    this.gl.canvas.width = wPx;
    this.gl.canvas.height = hPx;
  }

  render(f: DotFrame) {
    const gl = this.gl;
    if (!this.ok || !this.world || !this.detail) return;
    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // ── pass 1: cells (only when the view changed) ──
    if (f.cellsDirty || f.cols !== this.cellSize.cols || f.rows !== this.cellSize.rows) {
      if (f.cols !== this.cellSize.cols || f.rows !== this.cellSize.rows) {
        gl.bindTexture(gl.TEXTURE_2D, this.cellTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, f.cols, f.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.cellTex, 0);
        this.cellSize = { cols: f.cols, rows: f.rows };
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.viewport(0, 0, f.cols, f.rows);
      const { prog, loc } = this.cells;
      gl.useProgram(prog);
      gl.uniform2f(loc.u_cells, f.cols, f.rows);
      gl.uniform2f(loc.u_origin, f.ox, f.oy);
      gl.uniform1f(loc.u_pitch, f.pitch);
      gl.uniform2f(loc.u_view, f.w, f.h);
      gl.uniform3f(loc.u_cam, f.cam.lng, f.cam.lat, f.cam.k);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.world);
      gl.uniform1i(loc.u_world, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.detail);
      gl.uniform1i(loc.u_detail, 1);
      gl.uniform4f(loc.u_box, ...this.box);
      const n = Math.min(f.places.length, MAX_PLACES);
      for (let i = 0; i < n; i++) {
        this.placeBuf[i * 2] = f.places[i].x;
        this.placeBuf[i * 2 + 1] = f.places[i].y;
      }
      gl.uniform2fv(loc.u_places, this.placeBuf);
      gl.uniform1i(loc.u_count, n);
      gl.uniform1f(loc.u_sigma, f.sigma);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // ── pass 2: dots ──
    const wPx = gl.drawingBufferWidth;
    const hPx = gl.drawingBufferHeight;
    gl.viewport(0, 0, wPx, hPx);
    const { prog, loc } = this.dots;
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.cellTex);
    gl.uniform1i(loc.u_cellTex, 0);
    gl.uniform2f(loc.u_cells, f.cols, f.rows);
    gl.uniform2f(loc.u_origin, f.ox, f.oy);
    gl.uniform1f(loc.u_pitch, f.pitch);
    gl.uniform1f(loc.u_dpr, wPx / f.w);
    gl.uniform1f(loc.u_hpx, hPx);
    gl.uniform1f(loc.u_base, f.base);
    const c = (v: RGB) => [v[0] / 255, v[1] / 255, v[2] / 255] as const;
    gl.uniform3f(loc.u_bg, ...c(f.bg));
    gl.uniform3f(loc.u_land, ...c(f.land));
    gl.uniform3f(loc.u_accent, ...c(f.accent));
    gl.uniform1f(loc.u_landA, f.landAlpha);
    gl.uniform1f(loc.u_heatA, f.heatAlpha);
    gl.uniform1f(loc.u_heatMix, f.heatMix);
    gl.uniform2f(loc.u_home, f.home.x, f.home.y);
    gl.uniform2f(loc.u_intro, f.intro.on ? 1 : 0, f.intro.front);
    gl.uniform3f(loc.u_ping, f.ping.r, f.ping.band, f.ping.strength);
    gl.uniform4f(loc.u_lens, f.lens.x, f.lens.y, f.lens.r, f.lens.amt);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroy() {
    const gl = this.gl;
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  }
}
