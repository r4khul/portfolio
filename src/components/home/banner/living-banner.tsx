"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useAudioContext } from "@/lib/contexts/audio-context";
import { haptic } from "@/lib/haptics";
import { playSfx } from "@/lib/sfx";
import { BUILDING_X, Flock, LEDGE_Y, POLE, TANK, VH, VW, WIRE_PATH } from "./flock";
import "./banner.css";

/**
 * The hero banner, alive: the same sky, clouds and "surprisingly Boring" as
 * the old image, plus a rooftop in the top-right that pigeons call home.
 *
 * Layers (back to front), all sharing one 768 x 208 stage:
 *   sky gradient (CSS) → drifting clouds (CSS, compositor-only)
 *   → type, moon, building, tank, antenna, wire (static SVG)
 *   → birds (one small canvas, see flock.ts)
 *
 * The SVG uses preserveAspectRatio="xMaxYMid slice" and the canvas applies
 * the same mapping, so birds always stand exactly on the ledge, tank and
 * wire at every banner size.
 */
export function LivingBanner() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flockRef = useRef<Flock | null>(null);
  const reduce = useReducedMotion();
  const { isMuted } = useAudioContext();
  const mutedRef = useRef(isMuted);
  const lastFlutter = useRef(0);

  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const flock = new Flock(canvas, 7, {
      onScatter: () => {
        // a soft rush of wings, at most every 400 ms, never on touch screens
        // (they get the haptic instead, matching the site's click sounds)
        const now = performance.now();
        if (now - lastFlutter.current < 400) return;
        lastFlutter.current = now;
        if (!mutedRef.current && !window.matchMedia("(pointer: coarse)").matches) playSfx("flutter", 0.55);
      },
    });
    flockRef.current = flock;

    const measure = () => {
      const r = root.getBoundingClientRect();
      flock.resize(Math.round(r.width), Math.round(r.height), Math.min(window.devicePixelRatio || 1, 2));
      // how wide the building renders, so the type can sit just left of it
      const s = Math.max(r.width / VW, r.height / VH);
      root.style.setProperty("--lb-building", `${Math.round((VW - BUILDING_X) * s)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    // only animate while the banner is on screen and the tab is visible
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) flock.start();
      else flock.stop();
    });
    io.observe(root);
    const onVis = () => (document.hidden ? flock.stop() : visible && flock.start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      flock.destroy();
      flockRef.current = null;
    };
  }, []);

  useEffect(() => {
    flockRef.current?.setReducedMotion(!!reduce);
  }, [reduce]);

  /* ── input: hover makes birds wary, a tap (or a close pass) scatters them ── */
  const local = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    return flockRef.current!.toScene(e.clientX - r.left, e.clientY - r.top);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!flockRef.current) return;
    flockRef.current.setPointer(local(e));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const flock = flockRef.current;
    if (!flock) return;
    const p = local(e);
    flock.setPointer(p);
    const flew = flock.tap(p);
    if (flew > 0) haptic(flew > 2 ? "success" : "select");
  };

  const onPointerEnd = (e: React.PointerEvent) => {
    // fingers lift away; a mouse that leaves the banner also stops counting
    if (e.type === "pointerleave" || e.pointerType !== "mouse") flockRef.current?.setPointer(null);
  };

  return (
    <div
      ref={rootRef}
      className="living-banner relative h-full w-full overflow-hidden select-none"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={onPointerEnd}
      aria-hidden
    >
      {/* sky, sampled from the original banner */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#a4ccf0_0%,#93c3ed_38%,#88bdea_100%)]" />

      {/* clouds drift on the compositor; no filters, no repaints */}
      <div className="lb-cloud lb-cloud--a" />
      <div className="lb-cloud lb-cloud--b" />
      <div className="lb-cloud lb-cloud--c" />

      {/* type + moon: an HTML layer that always sits just left of the building */}
      <div className="lb-type">
        <span className="lb-type__s">surprisingly</span>
        <span className="lb-type__b">Boring</span>
        <svg className="lb-moon" viewBox="0 0 32 32">
          <defs>
            <radialGradient id="lb-moon-g" cx="0.4" cy="0.38" r="0.7">
              <stop offset="0" stopColor="#f6f3ec" />
              <stop offset="1" stopColor="#d8d2c4" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="15" fill="#fff" opacity="0.16" />
          <circle cx="16" cy="16" r="9.5" fill="url(#lb-moon-g)" />
          <g fill="#b9b2a2" opacity="0.35">
            <circle cx="13" cy="13" r="1.8" />
            <circle cx="19" cy="19" r="1.3" />
            <circle cx="18.5" cy="12" r="0.9" />
          </g>
        </svg>
      </div>

      <svg
        className="absolute inset-0 size-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMaxYMid slice"
      >
        <defs>
          <linearGradient id="lb-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3f0ea" />
            <stop offset="1" stopColor="#e1dcd2" />
          </linearGradient>
          <linearGradient id="lb-parapet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfaf7" />
            <stop offset="1" stopColor="#e9e5dc" />
          </linearGradient>
          <linearGradient id="lb-under" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f2a36" stopOpacity="0.16" />
            <stop offset="1" stopColor="#1f2a36" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lb-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4defa" />
            <stop offset="0.55" stopColor="#8fbde8" />
            <stop offset="1" stopColor="#6e9fcf" />
          </linearGradient>
          <linearGradient id="lb-tank" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#24282e" />
            <stop offset="0.38" stopColor="#4b525b" />
            <stop offset="1" stopColor="#1d2025" />
          </linearGradient>
        </defs>

        {/* ── the rooftop ── */}
        {/* cable from the antenna, sagging across the sky */}
        <path d={WIRE_PATH} fill="none" stroke="#38404b" strokeWidth="0.9" opacity="0.8" />

        {/* facade */}
        <rect x="626" y={LEDGE_Y + 10} width="150" height="140" fill="url(#lb-wall)" />
        <rect x="626" y={LEDGE_Y + 10} width="2.5" height="140" fill="#d3ccc0" />
        <rect x="626" y={LEDGE_Y + 10} width="150" height="6" fill="url(#lb-under)" />

        {/* grilled windows */}
        {[
          [644, 96],
          [700, 96],
          [644, 146],
          [700, 146],
          [644, 196],
          [700, 196],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x - 1.5} y={y - 1.5} width="37" height="29" rx="1.5" fill="#3d4652" />
            <rect x={x} y={y} width="34" height="26" fill="url(#lb-glass)" />
            <path
              d={`M${x + 8.5} ${y}v26M${x + 17} ${y}v26M${x + 25.5} ${y}v26M${x} ${y + 13}h34`}
              stroke="#3d4652"
              strokeWidth="0.8"
              opacity="0.75"
            />
            <path d={`M${x + 3} ${y + 3}l9 0l-12 14z`} fill="#fff" opacity="0.14" />
            <rect x={x - 3} y={y + 27.5} width="40" height="2.5" fill="#f7f4ee" />
          </g>
        ))}

        {/* window AC unit */}
        <g>
          <rect x="738" y="124" width="26" height="14" rx="1.5" fill="#ecebe6" stroke="#c7c1b6" strokeWidth="0.7" />
          <circle cx="757" cy="131" r="4.2" fill="none" stroke="#b6afa3" strokeWidth="0.8" />
          <path d="M741 128h9M741 131h9M741 134h9" stroke="#c9c3b8" strokeWidth="0.6" />
        </g>

        {/* parapet: where most of the birds stand */}
        <rect x="620" y={LEDGE_Y} width="160" height="10" fill="url(#lb-parapet)" />
        <path d={`M620 ${LEDGE_Y + 0.4}H780`} stroke="#fff" strokeWidth="0.8" />
        <path d={`M620 ${LEDGE_Y + 10}H780`} stroke="#cfc8bc" strokeWidth="0.6" />

        {/* antenna pole */}
        <path
          d={`M${POLE.x} ${LEDGE_Y}V${POLE.top}M${POLE.x - 7} ${POLE.top + 4}h14M${POLE.x - 5} ${POLE.top + 10}h10`}
          stroke="#4a515b"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* black ribbed water tank on its stand */}
        <g>
          <path d="M703 70v-10M725 70v-10" stroke="#535a64" strokeWidth="2.2" />
          <rect x="698" y="58" width="32" height="3" rx="0.6" fill="#454c55" />
          <rect x={TANK.x0 + 1} y={TANK.top} width="30" height="17.5" rx="3" fill="url(#lb-tank)" />
          <path d="M699.5 45.5h29M699.5 49.5h29M699.5 53.5h29" stroke="#15181c" strokeWidth="0.7" opacity="0.7" />
          <ellipse cx="714" cy={TANK.top + 0.4} rx="6.5" ry="1.6" fill="#383d44" />
        </g>

        {/* a tulsi pot on the corner of the parapet */}
        <g>
          <path d={`M748 ${LEDGE_Y}l1.6 -8h9l1.6 8z`} fill="#b9693a" />
          <path d={`M749.2 ${LEDGE_Y - 8}h10.6`} stroke="#9a552c" strokeWidth="1" />
          <g fill="#4f7c40">
            <ellipse cx="751.5" cy={LEDGE_Y - 11} rx="2.4" ry="1.3" transform={`rotate(-30 751.5 ${LEDGE_Y - 11})`} />
            <ellipse cx="757.5" cy={LEDGE_Y - 12} rx="2.4" ry="1.3" transform={`rotate(28 757.5 ${LEDGE_Y - 12})`} />
            <ellipse cx="754.5" cy={LEDGE_Y - 15} rx="2.1" ry="1.2" transform={`rotate(-80 754.5 ${LEDGE_Y - 15})`} />
          </g>
          <path d={`M754.5 ${LEDGE_Y - 8}v-7`} stroke="#4f7c40" strokeWidth="0.7" />
        </g>
      </svg>

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
    </div>
  );
}
