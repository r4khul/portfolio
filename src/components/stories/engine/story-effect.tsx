"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/lib/contexts/audio-context";

type EffectType = "float" | "shatter" | "pulse" | "girl" | "room";

interface StoryEffectProps {
  type: EffectType;
  /** Height of the canvas container. Default: "50vh" */
  height?: string;
  /** Label for accessibility */
  label?: string;
}

// ---------- Float Effect ----------
// Particles drift upward — the feeling of lifting, flying
function runFloat(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.classList.contains("dark");
  const particleColor = isDark ? "255,255,255" : "42,42,44";

  type Particle = { x: number; y: number; r: number; speed: number; opacity: number; drift: number; phase: number };

  const count = Math.min(Math.floor((W * H) / 4500), 120);
  const particles: Particle[] = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: H + Math.random() * H * 0.5,
    r: Math.random() * 2.5 + 0.5,
    speed: Math.random() * 0.6 + 0.2,
    opacity: 0,
    drift: (Math.random() - 0.5) * 0.4,
    phase: Math.random() * Math.PI * 2,
  }));

  let frame = 0;
  let raf: number;

  function draw() {
    if (signal.aborted) return;
    ctx.clearRect(0, 0, W, H);
    frame++;

    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift + Math.sin(frame * 0.01 + p.phase) * 0.3;
      const progress = 1 - p.y / H;
      p.opacity = Math.min(1, progress * 3) * Math.max(0, 1 - Math.max(0, (1 - p.y / H - 0.6) * 5));

      if (p.y < -20) {
        p.y = H + Math.random() * 40;
        p.x = Math.random() * W;
        p.opacity = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor},${p.opacity * 0.6})`;
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  draw();
  signal.addEventListener("abort", () => cancelAnimationFrame(raf));
}

function runShatter(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const voidColor = "#050505";
  const skyTop = "#ffffff";
  const skyBottom = "#f8fafc";
  const edgeColor = "rgba(0,0,0,0.08)";

  const isMobile = W < 640;
  const cols = isMobile ? 8 : 10;
  const rows = isMobile ? 6 : 8;
  const cellW = W / cols;
  const cellH = H / rows;

  type Tile = {
    x: number; y: number;
    cx: number; cy: number;
    origCy: number;
    vy: number; vrot: number; vx: number;
    angle: number;
    life: number; delay: number;
    w: number; h: number;
    opacity: number;
    grad: CanvasGradient;
  };

  const tiles: Tile[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (Math.random() - 0.5) * cellW * 0.4;
      const jy = (Math.random() - 0.5) * cellH * 0.4;
      const cx = c * cellW + cellW / 2 + jx;
      const cy = r * cellH + cellH / 2 + jy;
      const dist = Math.sqrt((cx - W / 2) ** 2 + (cy - H / 2) ** 2);
      const maxDist = Math.sqrt((W / 2) ** 2 + (H / 2) ** 2);
      
      const grad = ctx.createLinearGradient(0, -cy, 0, H - cy);
      grad.addColorStop(0, skyTop);
      grad.addColorStop(1, skyBottom);

      tiles.push({
        x: cx - (cellW * 0.45) / 2,
        y: cy - (cellH * 0.45) / 2,
        cx, cy,
        origCy: cy,
        vy: 1.5 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 2,
        vrot: (Math.random() - 0.5) * 0.08,
        angle: 0,
        life: 1,
        delay: (dist / maxDist) * 60 + Math.random() * 20,
        w: cellW * (0.9 + Math.random() * 0.3),
        h: cellH * (0.9 + Math.random() * 0.3),
        opacity: 1,
        grad,
      });
    }
  }

  const voidGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
  voidGrad.addColorStop(0, "transparent");
  voidGrad.addColorStop(1, "rgba(0,0,0,0.8)");

  let frame = 0;
  let raf: number;

  function draw() {
    if (signal.aborted) return;
    
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = voidColor;
    ctx.fillRect(0, 0, W, H);
    
    ctx.fillStyle = voidGrad;
    ctx.fillRect(0, 0, W, H);

    frame++;

    let allDone = true;
    for (const t of tiles) {
      if (frame < t.delay) {
        allDone = false;
        ctx.save();
        ctx.translate(t.cx, t.cy);
        
        ctx.fillStyle = t.grad;
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 1;
        roundRect(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 1);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        continue;
      }
      
      const elapsed = frame - t.delay;
      t.vy += 0.2;
      t.cy += t.vy;
      t.cx += t.vx;
      t.angle += t.vrot;
      t.opacity = Math.max(0, 1 - elapsed / 60);

      if (t.opacity <= 0) continue;
      allDone = false;

      ctx.save();
      ctx.translate(t.cx, t.cy);
      ctx.rotate(t.angle);
      ctx.globalAlpha = t.opacity;
      
      ctx.fillStyle = t.grad;
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1;
      roundRect(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 1);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (allDone) {
      return;
    }

    raf = requestAnimationFrame(draw);
  }

  draw();
  signal.addEventListener("abort", () => cancelAnimationFrame(raf));
}

// ---------- Girl Effect ----------
// ---------- Girl Effect ----------
// A child's silhouette emerges from a lit doorway and rushes at the viewer
function runGirl(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const TOTAL = 240; 
  let frame = 0;
  let raf: number;

  const dW = W * 0.12; 
  const dH = dW * 2.2;
  const dX = W / 2 - dW / 2;
  const dY = H * 0.5 - dH * 0.45;

  const isMobile = W < 640;

  function drawGirlSilhouette(ctx: CanvasRenderingContext2D, runCycle: number) {
    const legSwingLeft = Math.sin(runCycle);
    const legSwingRight = Math.sin(runCycle + Math.PI);
    const armSwingLeft = Math.cos(runCycle);
    const armSwingRight = Math.cos(runCycle + Math.PI);

    ctx.fillStyle = "#020202";
    ctx.shadowColor = "#020202";
    ctx.shadowBlur = isMobile ? 0 : 3;
    
    ctx.beginPath();
    ctx.arc(0, -45, 16, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-16, -45);
    ctx.bezierCurveTo(-25, -20, -35, -5, -28, 5);
    ctx.lineTo(28, 5);
    ctx.bezierCurveTo(35, -5, 25, -20, 16, -45);
    ctx.fill();
    
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 9;
    ctx.strokeStyle = "#020202";
    
    ctx.moveTo(-16, -12);
    ctx.lineTo(-24 - armSwingLeft * 4, 15 - Math.abs(armSwingLeft) * 5);
    ctx.lineTo(-20 - armSwingLeft * 8, 35 - Math.abs(armSwingLeft) * 10);
    
    ctx.moveTo(16, -12);
    ctx.lineTo(24 - armSwingRight * 4, 15 - Math.abs(armSwingRight) * 5);
    ctx.lineTo(20 - armSwingRight * 8, 35 - Math.abs(armSwingRight) * 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 11;
    
    ctx.moveTo(-12, 80);
    ctx.lineTo(-14, 105 - Math.max(0, legSwingLeft) * 15);
    ctx.lineTo(-14, 130 - Math.max(0, legSwingLeft) * 20);
    
    ctx.moveTo(12, 80);
    ctx.lineTo(14, 105 - Math.max(0, legSwingRight) * 15);
    ctx.lineTo(14, 130 - Math.max(0, legSwingRight) * 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-14, -15);
    ctx.lineTo(14, -15);
    const flare = Math.sin(runCycle * 2) * 3;
    ctx.bezierCurveTo(20, 20, 32 + flare, 60, 36 + flare, 95);
    ctx.quadraticCurveTo(0, 105, -36 - flare, 95);
    ctx.bezierCurveTo(-32 - flare, 60, -20, 20, -14, -15);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  // Pre-create static radial and linear gradients once
  const glowGrad = ctx.createRadialGradient(W / 2, dY + dH / 2, 0, W / 2, dY + dH / 2, dW * 8);
  glowGrad.addColorStop(0, "rgba(253,250,235,0.55)");
  glowGrad.addColorStop(0.5, "rgba(253,250,235,0.12)");
  glowGrad.addColorStop(1, "rgba(0,0,0,0)");

  const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  shadowGrad.addColorStop(0, "rgba(0,0,0,1)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");

  const vigGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, W * 0.72);
  vigGrad.addColorStop(0, "rgba(0,0,0,0)");
  vigGrad.addColorStop(1, "rgba(2,2,2,0.85)");

  function draw() {
    if (signal.aborted) return;
    frame++;

    const t = Math.min(1, frame / TOTAL);
    const initialGirlHeight = dH * 0.85; 
    const startScale = initialGirlHeight / 192;
    
    const startZ = 15;
    const maxTargetScale = (H * 0.65) / 192;
    const endZ = Math.max(0.5, (startScale * startZ) / maxTargetScale);
    const currentZ = startZ - (startZ - endZ) * t;
    const scale = (startScale * startZ) / currentZ;

    const runCycle = t * Math.PI * 24; 
    const sway = Math.sin(runCycle / 2) * 0.04;
    const bobAmount = Math.abs(Math.sin(runCycle)) * (8 * scale);

    const startGround = dY + dH * 0.95;
    const endGround = H * 1.15; 
    const currentGround = startGround + (endGround - startGround) * Math.pow(t, 1.2); 

    // Background
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    // Doorway glow
    const glowAlpha = Math.max(0, 1 - t * 0.8);
    ctx.save();
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Door rectangle
    ctx.fillStyle = `rgba(253, 251, 242, ${glowAlpha * 0.9 + 0.1})`;
    ctx.fillRect(dX, dY, dW, dH);

    // Ground shadow (drawn scaling a 1x1 radial gradient)
    if (t > 0.05) {
      const shadowA = Math.min(0.55, (t - 0.05) * 1.5);
      const shadowW = 90 * scale * 1.5; 
      ctx.save();
      ctx.translate(W / 2, currentGround);
      ctx.scale(shadowW * 0.5, shadowW * 0.125);
      ctx.globalAlpha = shadowA;
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Girl silhouette
    ctx.save();
    const scaleX = scale;
    const scaleY = scale * 0.82; 
    ctx.translate(W / 2, currentGround - 130 * scaleY - bobAmount);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(sway);
    drawGirlSilhouette(ctx, runCycle);
    ctx.restore();

    // Edge vignette
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);

    if (t < 1) {
      raf = requestAnimationFrame(draw);
    } else {
      let fade = 0;
      const fadeOut = () => {
        if (signal.aborted) return;
        fade += 0.04;
        ctx.fillStyle = `rgba(5,5,5,${Math.min(fade, 1)})`;
        ctx.fillRect(0, 0, W, H);
        if (fade < 1) requestAnimationFrame(fadeOut);
      };
      fadeOut();
    }
  }

  draw();
  signal.addEventListener("abort", () => cancelAnimationFrame(raf));
}

// Helper: roundRect polyfill for older browsers
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

// ---------- Pulse Effect ----------
// Expanding concentric rings from center — "the push"
function runPulse(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.classList.contains("dark");
  const ringColor = isDark ? "255,255,255" : "42,42,44";
  const cx = W / 2;
  const cy = H / 2;

  type Ring = { r: number; opacity: number; born: number };
  const rings: Ring[] = [];
  let frame = 0;
  let raf: number;
  let lastSpawn = -999;
  let totalRings = 0;
  const maxRings = 5;

  function draw() {
    if (signal.aborted) return;
    ctx.clearRect(0, 0, W, H);
    frame++;

    if (totalRings < maxRings && frame - lastSpawn > 25) {
      rings.push({ r: 0, opacity: 0.7, born: frame });
      lastSpawn = frame;
      totalRings++;
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i];
      const age = frame - ring.born;
      ring.r += 4 + age * 0.04;
      ring.opacity = Math.max(0, 0.7 - age / 70);

      if (ring.opacity <= 0) {
        rings.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ringColor},${ring.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const flashAge = frame;
    const flashOpacity = Math.max(0, 1 - flashAge / 30);
    if (flashOpacity > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ringColor},${flashOpacity})`;
      ctx.fill();
    }

    if (rings.length > 0 || totalRings < maxRings) {
      raf = requestAnimationFrame(draw);
    }
  }

  draw();
  signal.addEventListener("abort", () => cancelAnimationFrame(raf));
}

// ---------- Room Effect ----------
// Quiet night apartment building silhouette with exactly one room's light on
function runRoom(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const isMobile = W < 640;

  // Stars in the night sky
  type Star = { x: number; y: number; r: number; phase: number; speed: number };
  const starCount = isMobile ? 12 : 24;
  const stars: Star[] = Array.from({ length: starCount }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.55,
    r: Math.random() * 0.8 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.015 + 0.008,
  }));

  // Building geometry
  const bW = Math.min(W * 0.30, 150);
  const bH = H * 0.70;
  const bX = W / 2 - bW / 2;
  const bY = H - bH;

  // Window grid setup (3 columns, 5 rows)
  const cols = 3;
  const rows = 5;
  const wMarginX = bW * 0.16;
  const wMarginY = bH * 0.14;
  const gridW = bW - wMarginX * 2;
  const gridH = bH - wMarginY * 2;
  const cellW = gridW / cols;
  const cellH = gridH / rows;
  const winW = cellW * 0.52;
  const winH = cellH * 0.62;

  const litCol = 1;
  const litRow = 3;

  let frame = 0;
  let raf: number;

  // Pre-create static gradients once
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, "#010103");
  skyGrad.addColorStop(1, "#05050a");

  const groundGrad = ctx.createLinearGradient(0, H - 20, 0, H);
  groundGrad.addColorStop(0, "#040407");
  groundGrad.addColorStop(1, "#010103");

  const vigGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, W * 0.68);
  vigGrad.addColorStop(0, "rgba(0,0,0,0)");
  vigGrad.addColorStop(1, "rgba(1, 1, 3, 0.65)");

  function draw() {
    if (signal.aborted) return;
    frame++;

    // 1. Dark night sky background
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Render twinkling stars
    for (const s of stars) {
      const opacity = 0.25 + 0.75 * Math.sin(frame * s.speed + s.phase);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2b. Draw crescent moon
    ctx.save();
    const mX = W * 0.22;
    const mY = H * 0.22;
    const mR = Math.min(W, H) * 0.045;
    ctx.beginPath();
    ctx.moveTo(mX, mY - mR);
    ctx.arc(mX, mY, mR, -Math.PI / 2, Math.PI / 2, false);
    ctx.quadraticCurveTo(mX + mR * 0.32, mY, mX, mY - mR);
    ctx.fillStyle = "rgba(252, 251, 242, 0.85)";
    ctx.shadowColor = "rgba(252, 251, 242, 0.35)";
    ctx.shadowBlur = isMobile ? 0 : 6;
    ctx.fill();
    ctx.restore();

    // 3. Render Building Silhouette
    ctx.fillStyle = "#07070b";
    ctx.fillRect(bX, bY, bW, bH);

    ctx.fillRect(bX + bW * 0.18, bY - 10, bW * 0.18, 10);
    ctx.strokeStyle = "#07070b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bX + bW * 0.72, bY);
    ctx.lineTo(bX + bW * 0.72, bY - 20);
    ctx.stroke();

    // 4. Render Windows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = bX + wMarginX + c * cellW + (cellW - winW) / 2;
        const wy = bY + wMarginY + r * cellH + (cellH - winH) / 2;

        const isLit = (c === litCol && r === litRow);

        if (isLit) {
          const lightProgress = Math.min(1, frame / 50); 
          const flicker = 0.94 + 0.06 * Math.sin(frame * 0.075) * Math.cos(frame * 0.03);
          const currentAlpha = lightProgress * flicker;

          ctx.save();
          ctx.fillStyle = `rgba(253, 224, 71, ${currentAlpha})`;
          ctx.shadowColor = "rgba(253, 224, 71, 0.4)";
          ctx.shadowBlur = isMobile ? 0 : 8;
          ctx.fillRect(wx, wy, winW, winH);
          ctx.restore();

          ctx.strokeStyle = "rgba(7, 7, 11, 0.8)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(wx + winW / 2, wy);
          ctx.lineTo(wx + winW / 2, wy + winH);
          ctx.moveTo(wx, wy + winH * 0.4);
          ctx.lineTo(wx + winW, wy + winH * 0.4);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#030306";
          ctx.fillRect(wx, wy, winW, winH);

          ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(wx + winW / 2, wy);
          ctx.lineTo(wx + winW / 2, wy + winH);
          ctx.stroke();
        }
      }
    }

    // 5. Draw Ground Silhouette
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, H - 20, W, 20);

    // 6. Vignette
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(draw);
  }

  draw();
  signal.addEventListener("abort", () => cancelAnimationFrame(raf));
}

// ---------- Component ----------

const RUNNERS = {
  float: runFloat,
  shatter: runShatter,
  pulse: runPulse,
  girl: runGirl,
  room: runRoom,
} as const;

export function StoryEffect({ type, height = "40vh", label }: StoryEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [triggered, setTriggered] = useState(false);
  const { isMuted } = useAudioContext();

  // Play audio when triggered
  useEffect(() => {
    if (!triggered || isMuted) return;

    const activeAudios: HTMLAudioElement[] = [];
    const activeTimers: number[] = [];

    const playSound = (path: string, volume = 0.5, delay = 0) => {
      if (typeof window === "undefined") return;
      const audio = new Audio(path);
      audio.volume = volume;
      activeAudios.push(audio);

      const timer = window.setTimeout(() => {
        audio.play().catch(() => {
          // Playback blocked or interrupted
        });
      }, delay);

      activeTimers.push(timer);
    };

    if (type === "float") {
      playSound("/sfx/sky_ambient.wav", 0.4);
    } else if (type === "shatter") {
      playSound("/sfx/glass_shatter.wav", 0.55);
    } else if (type === "pulse") {
      playSound("/sfx/time_skip.wav", 0.55);
    } else if (type === "girl") {
      playSound("/sfx/door_open.wav", 0.45);
      playSound("/sfx/footsteps.wav", 0.5, 300);
    }

    return () => {
      activeTimers.forEach(window.clearTimeout);
      activeAudios.forEach((audio) => {
        try {
          audio.pause();
          audio.src = "";
        } catch {}
      });
    };
  }, [triggered, type, isMuted]);

  // Trigger on intersection
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
        } else {
          // Reset if it scrolls back down past the viewport
          if (entry.boundingClientRect.top > 0) {
            setTriggered(false);
          }
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Run the canvas effect when triggered
  useEffect(() => {
    if (!triggered) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const controller = new AbortController();
    RUNNERS[type](canvas, controller.signal);
    return () => controller.abort();
  }, [triggered, type]);

  const defaultLabel = {
    float: "Visual: ascending through the dream",
    shatter: "Visual: the sky shattering",
    pulse: "Visual: the push",
    girl: "Visual: silhouette running from a door",
    room: "Visual: quiet apartment building with one warm window lit",
  }[type];

  return (
    <div
      ref={containerRef}
      className="story-effect-container"
      style={{ height }}
      aria-label={label ?? defaultLabel}
      role="img"
    >
      <canvas
        ref={canvasRef}
        className="story-effect-canvas"
        aria-hidden="true"
      />
    </div>
  );
}
