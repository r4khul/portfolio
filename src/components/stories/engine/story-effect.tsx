"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/lib/contexts/audio-context";

type EffectType = "float" | "shatter" | "pulse" | "girl";

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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.classList.contains("dark");
  const particleColor = isDark ? "255,255,255" : "42,42,44";

  type Particle = { x: number; y: number; r: number; speed: number; opacity: number; drift: number; phase: number };

  const count = Math.floor((W * H) / 3000);
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

// ---------- Shatter Effect ----------
// Voronoi-style tiles fracture and fall away into darkness
function runShatter(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.classList.contains("dark");
  
  // The void (darkness beneath)
  const voidColor = "#050505";
  
  // The sky color (tiles)
  const skyTop = "#ffffff";
  const skyBottom = "#f8fafc";
  const edgeColor = "rgba(0,0,0,0.08)";

  // Generate irregular Voronoi-like tiles via seed points
  const cols = 10;
  const rows = 8;
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
      });
    }
  }

  let frame = 0;
  let raf: number;

  function draw() {
    if (signal.aborted) return;
    
    // Draw the void beneath
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = voidColor;
    ctx.fillRect(0, 0, W, H);
    
    // Void texture/vignette
    const voidGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
    voidGrad.addColorStop(0, "transparent");
    voidGrad.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = voidGrad;
    ctx.fillRect(0, 0, W, H);

    frame++;

    let allDone = true;
    for (const t of tiles) {
      if (frame < t.delay) {
        allDone = false;
        // Draw intact tile
        ctx.save();
        ctx.translate(t.cx, t.cy);
        
        const grad = ctx.createLinearGradient(0, -t.origCy, 0, H - t.origCy);
        grad.addColorStop(0, skyTop);
        grad.addColorStop(1, skyBottom);
        ctx.fillStyle = grad;
        
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 1;
        roundRect(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 1);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        continue;
      }
      
      const elapsed = frame - t.delay;
      t.vy += 0.2; // gravity
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
      
      const grad = ctx.createLinearGradient(0, -t.origCy, 0, H - t.origCy);
      grad.addColorStop(0, skyTop);
      grad.addColorStop(1, skyBottom);
      ctx.fillStyle = grad;
      
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1;
      roundRect(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 1);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (allDone) {
      return; // stop looping, void is already drawn
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const TOTAL = 240; // ~4s at 60fps — slower, calibrated pacing
  let frame = 0;
  let raf: number;

  // Door: larger, closer
  const dW = W * 0.12; 
  const dH = dW * 2.2;
  const dX = W / 2 - dW / 2;
  const dY = H * 0.5 - dH * 0.45;

  function drawGirlSilhouette(ctx: CanvasRenderingContext2D, runCycle: number) {
    const legSwingLeft = Math.sin(runCycle);
    const legSwingRight = Math.sin(runCycle + Math.PI);
    const armSwingLeft = Math.cos(runCycle);
    const armSwingRight = Math.cos(runCycle + Math.PI);

    ctx.fillStyle = "#020202";
    ctx.shadowColor = "#020202";
    ctx.shadowBlur = 4;
    
    // --- Head ---
    ctx.beginPath();
    ctx.arc(0, -45, 16, 0, Math.PI * 2);
    ctx.fill();
    
    // --- Hair (Free hair) ---
    ctx.beginPath();
    ctx.moveTo(-16, -45);
    ctx.bezierCurveTo(-25, -20, -35, -5, -28, 5);
    ctx.lineTo(28, 5);
    ctx.bezierCurveTo(35, -5, 25, -20, 16, -45);
    ctx.fill();
    
    // --- Arms ---
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 9;
    ctx.strokeStyle = "#020202";
    // Left Arm
    ctx.moveTo(-16, -12);
    ctx.lineTo(-24 - armSwingLeft * 4, 15 - Math.abs(armSwingLeft) * 5);
    ctx.lineTo(-20 - armSwingLeft * 8, 35 - Math.abs(armSwingLeft) * 10);
    // Right Arm
    ctx.moveTo(16, -12);
    ctx.lineTo(24 - armSwingRight * 4, 15 - Math.abs(armSwingRight) * 5);
    ctx.lineTo(20 - armSwingRight * 8, 35 - Math.abs(armSwingRight) * 10);
    ctx.stroke();

    // --- Legs ---
    ctx.beginPath();
    ctx.lineWidth = 11;
    // Left Leg
    ctx.moveTo(-12, 80);
    ctx.lineTo(-14, 105 - Math.max(0, legSwingLeft) * 15);
    ctx.lineTo(-14, 130 - Math.max(0, legSwingLeft) * 20);
    // Right Leg
    ctx.moveTo(12, 80);
    ctx.lineTo(14, 105 - Math.max(0, legSwingRight) * 15);
    ctx.lineTo(14, 130 - Math.max(0, legSwingRight) * 20);
    ctx.stroke();

    // --- Dress / Frock ---
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

  function draw() {
    if (signal.aborted) return;
    frame++;

    const t = Math.min(1, frame / TOTAL);
    
    // Calculate scale and position using linear perspective
    // Girl height in path units is ~192 (from top of head -62 to hem 130)
    const initialGirlHeight = dH * 0.85; 
    const startScale = initialGirlHeight / 192;
    
    // Perspective depth
    const startZ = 15;
    // We limit max scale so she doesn't cover the whole canvas
    const maxTargetScale = (H * 0.65) / 192;
    const endZ = Math.max(0.5, (startScale * startZ) / maxTargetScale);
    const currentZ = startZ - (startZ - endZ) * t;
    const scale = (startScale * startZ) / currentZ;

    // Running cycle bob and sway
    const runCycle = t * Math.PI * 24; // Faster run cycle
    const sway = Math.sin(runCycle / 2) * 0.04;
    const bobAmount = Math.abs(Math.sin(runCycle)) * (8 * scale);

    // Floor Y position (perspective grounding)
    const startGround = dY + dH * 0.95;
    const endGround = H * 1.15; // Adjusted so head stays below the top
    const currentGround = startGround + (endGround - startGround) * Math.pow(t, 1.2); 

    // === Background ===
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    // === Doorway glow (dims as she blocks it) ===
    const glowAlpha = Math.max(0, 1 - t * 0.8);
    const glow = ctx.createRadialGradient(W / 2, dY + dH / 2, 0, W / 2, dY + dH / 2, dW * 8);
    glow.addColorStop(0, `rgba(253,250,235,${glowAlpha * 0.55})`);
    glow.addColorStop(0.5, `rgba(253,250,235,${glowAlpha * 0.12})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Door rectangle
    ctx.fillStyle = `rgba(253, 251, 242, ${glowAlpha * 0.9 + 0.1})`;
    ctx.fillRect(dX, dY, dW, dH);

    // === Ground shadow ===
    if (t > 0.05) {
      const shadowA = Math.min(0.55, (t - 0.05) * 1.5);
      const shadowW = 90 * scale * 1.5; // Path base width is ~90
      ctx.save();
      ctx.translate(W / 2, currentGround);
      ctx.scale(1, 0.25);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, shadowW * 0.5);
      sg.addColorStop(0, `rgba(0,0,0,${shadowA})`);
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(0, 0, shadowW * 0.5, shadowW * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // === Girl silhouette ===
    ctx.save();
    // Translate to ground, then move up by scaled feet position (130 is feet y in path)
    const scaleX = scale;
    const scaleY = scale * 0.82; // Shorten her height alone a bit
    ctx.translate(W / 2, currentGround - 130 * scaleY - bobAmount);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(sway);
    drawGirlSilhouette(ctx, runCycle);
    ctx.restore();

    // === Edge vignette ===
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.28, W/2, H/2, W*0.72);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(2,2,2,0.85)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    if (t < 1) {
      raf = requestAnimationFrame(draw);
    } else {
      // Fade to pure black at the end
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    // Center flash dot
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

// ---------- Component ----------

const RUNNERS = {
  float: runFloat,
  shatter: runShatter,
  pulse: runPulse,
  girl: runGirl,
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
