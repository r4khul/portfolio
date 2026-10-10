"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Pause, Plane, Plus, RotateCcw } from "lucide-react";
import { places, type Place } from "@/data/travel";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import {
  AtlasEngine,
  formatLngLat,
  haversineKm,
  loadLand,
  readTheme,
} from "./atlas-engine";

type View = "world" | "india";

const home = places.find((p) => p.home) ?? places[0];

const withDistance = places.map((p) => ({
  ...p,
  km: p.home ? 0 : Math.round(haversineKm(home, p)),
}));

/** Tour order: hop outward from home, nearest first. */
const tourOrder = withDistance
  .filter((p) => !p.home)
  .sort((a, b) => a.km - b.km)
  .map((p) => p.id);

const TOUR_HOP = 1.5; // s flight
const TOUR_DWELL = 1300; // ms on each city

/**
 * Travel atlas: a hand-drawn dot-matrix map of everywhere I've been.
 * Wrapped in the same tactile card as the contribution graph.
 */
export function TravelAtlas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AtlasEngine | null>(null);
  const introPlayed = useRef(false);
  const reduce = useReducedMotion();
  const { playClick } = useAudioFeedback();

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<View>("india");
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ lng: number; lat: number } | null>(null);
  const [touring, setTouring] = useState(false);
  const tourTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const states = useMemo(() => new Set(places.map((p) => p.state)).size, []);
  const routeKm = useMemo(() => withDistance.reduce((s, p) => s + p.km, 0), []);

  const active = hovered ?? selected;
  const activePlace = useMemo(
    () => withDistance.find((p) => p.id === active) ?? null,
    [active],
  );

  /* ── engine lifecycle ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !stage || !wrap) return;

    const engine = new AtlasEngine(canvas, places, {
      onHover: setHovered,
      onCursor: setCursor,
    });
    engineRef.current = engine;
    engine.setReducedMotion(!!reduce);
    engine.setTheme(readTheme(wrap));

    // size
    const ro = new ResizeObserver(() => {
      const r = stage.getBoundingClientRect();
      engine.resize(Math.round(r.width), Math.round(r.height), Math.min(window.devicePixelRatio || 1, 2));
    });
    ro.observe(stage);

    // theme: the site toggles `.dark` on <html>
    const mo = new MutationObserver(() => {
      requestAnimationFrame(() => engine.setTheme(readTheme(wrap)));
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // run only while on screen; play the intro the first time it's seen
    let landReady = false;
    let visible = false;
    const maybeIntro = () => {
      if (landReady && visible && !introPlayed.current) {
        introPlayed.current = true;
        engine.playIntro();
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) engine.start();
        else engine.stop();
        maybeIntro();
      },
      { threshold: 0.35 },
    );
    io.observe(stage);

    const onVis = () => {
      if (document.hidden) engine.stop();
      else if (visible) engine.start();
    };
    document.addEventListener("visibilitychange", onVis);

    loadLand()
      .then((land) => {
        engine.setLand(land);
        landReady = true;
        setReady(true);
        maybeIntro();
      })
      .catch(() => setFailed(true));

    return () => {
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setReducedMotion(!!reduce);
  }, [reduce]);

  useEffect(() => {
    engineRef.current?.setSelected(selected);
  }, [selected]);

  /* ── controls ── */
  const stopTour = useCallback(() => {
    if (tourTimer.current) clearTimeout(tourTimer.current);
    tourTimer.current = null;
    setTouring(false);
  }, []);

  useEffect(() => stopTour, [stopTour]);

  const revealStage = useCallback(() => {
    const r = stageRef.current?.getBoundingClientRect();
    if (r && (r.top < 0 || r.bottom > window.innerHeight)) {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const startTour = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    playClick();
    if (tourTimer.current) {
      stopTour();
      return;
    }
    setTouring(true);
    setView("india");
    revealStage();
    let i = 0;
    const hop = () => {
      const eng = engineRef.current;
      if (!eng) return;
      if (i >= tourOrder.length) {
        setSelected(null);
        eng.flyTo(eng.placesView(), 1.8);
        tourTimer.current = null;
        setTouring(false);
        return;
      }
      const id = tourOrder[i++];
      setSelected(id);
      const cam = eng.focusView(id);
      if (cam) eng.flyTo(cam, TOUR_HOP);
      tourTimer.current = setTimeout(hop, TOUR_HOP * 1000 + TOUR_DWELL);
    };
    hop();
  }, [playClick, revealStage, stopTour]);

  const goTo = useCallback(
    (v: View) => {
      const e = engineRef.current;
      if (!e) return;
      stopTour();
      playClick();
      setView(v);
      setSelected(null);
      e.flyTo(v === "world" ? e.worldView() : e.placesView(), 1.8);
    },
    [playClick, stopTour],
  );

  const focusPlace = useCallback(
    (id: string, fromList = false) => {
      const e = engineRef.current;
      if (!e) return;
      stopTour();
      playClick();
      if (fromList) revealStage();
      if (selected === id) {
        setSelected(null);
        e.flyTo(e.placesView(), 1.4);
        return;
      }
      setSelected(id);
      setView("india");
      const cam = e.focusView(id);
      if (cam) e.flyTo(cam, 1.5);
    },
    [playClick, selected, stopTour, revealStage],
  );

  const replay = useCallback(() => {
    stopTour();
    playClick();
    setSelected(null);
    setView("india");
    engineRef.current?.playIntro();
  }, [playClick, stopTour]);

  const zoom = useCallback(
    (f: number) => {
      playClick();
      engineRef.current?.zoomBy(f);
    },
    [playClick],
  );

  /* ── pointer: hover, drag-to-pan, pinch / ctrl-wheel zoom ── */
  const drag = useRef<{ x: number; y: number; moved: number; id: number } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDist = useRef(0);

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (tourTimer.current) stopTour();
    const p = localPoint(e);
    pinch.current.set(e.pointerId, p);
    if (pinch.current.size === 2) {
      const [a, b] = [...pinch.current.values()];
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
      drag.current = null;
      return;
    }
    drag.current = { ...p, moved: 0, id: e.pointerId };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine) return;
    const p = localPoint(e);
    if (pinch.current.has(e.pointerId)) pinch.current.set(e.pointerId, p);

    if (pinch.current.size === 2) {
      const [a, b] = [...pinch.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current > 0) {
        engine.zoomBy(d / pinchDist.current, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      }
      pinchDist.current = d;
      return;
    }

    const dr = drag.current;
    if (dr && dr.id === e.pointerId) {
      const dx = p.x - dr.x;
      const dy = p.y - dr.y;
      dr.moved += Math.abs(dx) + Math.abs(dy);
      dr.x = p.x;
      dr.y = p.y;
      if (dr.moved > 3) engine.panBy(dx, dy);
    }
    if (e.pointerType === "mouse") engine.setPointer(p);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    pinch.current.delete(e.pointerId);
    if (pinch.current.size < 2) pinchDist.current = 0;
    const dr = drag.current;
    drag.current = null;
    if (!engine || !dr || dr.id !== e.pointerId || dr.moved > 6) return;
    const p = localPoint(e);
    const hit = engine.hitTest(p.x, p.y);
    if (hit) focusPlace(hit);
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") engineRef.current?.setPointer(null);
  };

  // Trackpad pinch arrives as ctrl+wheel; plain wheel keeps scrolling the page.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      engineRef.current?.zoomBy(Math.exp(-e.deltaY * 0.01), {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      });
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  if (failed) return null;

  return (
    <div ref={wrapRef} className="select-none">
      <div className="tactile relative flex flex-col gap-4 overflow-hidden rounded-xl p-4 sm:gap-5 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl font-semibold tracking-tight text-[#87bbea] sm:text-2xl">
              {places.length}
            </span>
            <span className="font-mono text-[10px] tracking-wider text-muted uppercase sm:text-xs">
              places
            </span>
            <span className="ml-1 hidden font-mono text-[10px] tracking-wider text-faint uppercase sm:inline sm:text-xs">
              · {states} states · 1 country
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-edge bg-background/40 p-0.5 font-mono text-[10px] tracking-wider uppercase">
              {(["world", "india"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => goTo(v)}
                  className={`relative cursor-pointer rounded-md px-2.5 py-1 transition-colors ${
                    view === v && !selected ? "text-foreground" : "text-faint hover:text-muted"
                  }`}
                  aria-pressed={view === v && !selected}
                >
                  {view === v && !selected && (
                    <motion.span
                      layoutId="atlas-view-pill"
                      className="tactile absolute inset-0 rounded-md"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">{v}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={startTour}
              className={`tactile flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2 font-mono text-[10px] tracking-wider uppercase transition ${
                touring ? "text-[#87bbea]" : "text-faint hover:text-foreground"
              }`}
              aria-label={touring ? "Stop tour" : "Tour every place"}
              aria-pressed={touring}
            >
              {touring ? <Pause className="size-3" /> : <Plane className="size-3" />}
              <span className="hidden sm:inline">{touring ? "Stop" : "Tour"}</span>
            </button>
            <button
              type="button"
              onClick={replay}
              className="tactile flex size-7 cursor-pointer items-center justify-center rounded-lg text-faint transition hover:text-foreground"
              aria-label="Replay map animation"
              title="Replay"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Stage */}
        <div
          ref={stageRef}
          className="relative -mx-1 aspect-[4/3] cursor-crosshair overflow-hidden rounded-lg border border-edge-strong/60 bg-background sm:aspect-[16/9]"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block"
            role="img"
            aria-label={`Map of places I have visited: ${places.map((p) => p.name).join(", ")}`}
          />

          {/* loading shimmer */}
          <AnimatePresence>
            {!ready && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="dotgrid absolute inset-0 animate-pulse"
              />
            )}
          </AnimatePresence>

          {/* HUD - same language as the contribution graph's hover readout */}
          <AnimatePresence>
            {activePlace && (
              <motion.div
                key={activePlace.id}
                initial={{ opacity: 0, y: 4, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 4, x: "-50%" }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex items-center gap-2 rounded-md border border-edge-strong bg-surface/95 px-2 py-1 font-mono text-[10px] whitespace-nowrap shadow-xl backdrop-blur-sm"
              >
                <span className="font-bold text-foreground">{activePlace.name}</span>
                <span className="h-3 w-px bg-edge-strong" />
                <span className="text-muted">{activePlace.state}</span>
                <span className="h-3 w-px bg-edge-strong" />
                <span className="text-[#87bbea]">
                  {activePlace.home ? "home" : `${activePlace.km.toLocaleString()} km`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* zoom controls */}
          <div className="absolute right-2.5 bottom-2.5 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => zoom(1.6)}
              className="tactile flex size-7 cursor-pointer items-center justify-center rounded-md text-faint transition hover:text-foreground"
              aria-label="Zoom in"
            >
              <Plus className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => zoom(1 / 1.6)}
              className="tactile flex size-7 cursor-pointer items-center justify-center rounded-md text-faint transition hover:text-foreground"
              aria-label="Zoom out"
            >
              <Minus className="size-3.5" />
            </button>
          </div>

          {/* live cursor readout */}
          <div className="pointer-events-none absolute top-2 right-3 font-mono text-[9px] tracking-wider text-faint tabular-nums">
            {cursor ? formatLngLat(cursor.lng, cursor.lat) : ""}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-edge-strong/50 pt-3">
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted sm:text-[11px]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-status-breath rounded-full bg-[#87bbea]" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#87bbea]" />
            </span>
            <span>
              Based in <span className="text-foreground">{home.name}</span>
            </span>
          </div>
          <div className="font-mono text-[9px] text-faint sm:text-[10px]">
            {routeKm.toLocaleString()} km of routes
          </div>
        </div>
      </div>

      {/* Manifest */}
      <ul className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {withDistance.map((p, i) => (
          <PlaceRow
            key={p.id}
            place={p}
            index={i}
            active={active === p.id}
            onEnter={() => engineRef.current?.setHovered(p.id)}
            onLeave={() => engineRef.current?.setHovered(null)}
            onClick={() => focusPlace(p.id, true)}
          />
        ))}
      </ul>
    </div>
  );
}

function PlaceRow({
  place,
  index,
  active,
  onEnter,
  onLeave,
  onClick,
}: {
  place: Place & { km: number };
  index: number;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <li className="border-b border-edge">
      <button
        type="button"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={onClick}
        className="group flex w-full cursor-pointer items-baseline gap-3 py-2.5 text-left"
      >
        <span className="w-5 shrink-0 font-mono text-[10px] text-faint tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`flex-1 truncate text-[14px] font-medium transition-colors ${
            active ? "text-[#87bbea]" : "text-foreground group-hover:text-[#87bbea]"
          }`}
        >
          {place.name}
          <span className="ml-2 text-[12.5px] font-normal text-muted">{place.region}</span>
        </span>
        <span className="shrink-0 font-mono text-[11px] text-faint tabular-nums">
          {place.home ? "home" : `${place.km.toLocaleString()} km`}
        </span>
      </button>
    </li>
  );
}
