"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, LocateFixed, Minus, Plus } from "lucide-react";
import { places } from "@/data/travel";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import { haversineKm, type AtlasEngine } from "./atlas-engine";
import { useAtlas } from "./use-atlas";

const home = places.find((p) => p.home) ?? places[0];
const withKm = places.map((p) => ({ ...p, km: p.home ? 0 : Math.round(haversineKm(home, p)) }));

const fade = {
  initial: { opacity: 0, y: 6, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -6, filter: "blur(4px)" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

/** Full-screen atlas: roam freely, pick a place, come home with one tap. */
export function AtlasExplorer() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { playClick } = useAudioFeedback();

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [away, setAway] = useState(false);

  const applyInsets = useCallback((engine: AtlasEngine) => {
    const panel = panelRef.current;
    const { w, h } = engine.size;
    const vw = w || window.innerWidth;
    const vh = h || window.innerHeight;
    const pr = panel?.getBoundingClientRect();
    const wide = vw >= 900;
    engine.setInsets(
      wide
        ? { top: 72, right: 88, bottom: 56, left: (pr ? pr.right : 380) + 24 }
        : { top: 64, right: 24, bottom: (pr ? vh - pr.top : 220) + 16, left: 24 },
    );
  }, []);

  const { engineRef, ready } = useAtlas({
    stageRef,
    canvasRef,
    options: { interactive: true },
    onHover: setHovered,
    onReady: applyInsets,
  });

  // keep the resting framing honest when the panel or viewport changes size
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const ro = new ResizeObserver(() => {
      const e = engineRef.current;
      if (!e) return;
      const wasAway = e.isAway();
      applyInsets(e);
      if (!wasAway && !selected) e.jumpTo(e.homeView());
    });
    ro.observe(panel);
    return () => ro.disconnect();
  }, [applyInsets, engineRef, selected]);

  // surface the recenter button only once the visitor has wandered off
  useEffect(() => {
    const id = setInterval(() => {
      const e = engineRef.current;
      if (e) setAway(e.isAway());
    }, 250);
    return () => clearInterval(id);
  }, [engineRef]);

  useEffect(() => {
    engineRef.current?.setSelected(selected);
  }, [engineRef, selected]);

  const select = useCallback(
    (id: string | null) => {
      const e = engineRef.current;
      if (!e) return;
      playClick();
      setSelected(id);
      if (!id) {
        e.flyTo(e.homeView(), 1.3);
        return;
      }
      const cam = e.focusView(id);
      if (cam) e.flyTo(cam, 1.4);
    },
    [engineRef, playClick],
  );

  const recenter = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    playClick();
    setSelected(null);
    e.flyTo(e.homeView(), 1.2);
  }, [engineRef, playClick]);

  const zoom = useCallback(
    (f: number) => {
      playClick();
      engineRef.current?.zoomStep(f);
    },
    [engineRef, playClick],
  );

  // keyboard: esc goes home, +/- zoom
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Escape") recenter();
      else if (e.key === "+" || e.key === "=") engineRef.current?.zoomStep(1.5);
      else if (e.key === "-") engineRef.current?.zoomStep(1 / 1.5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engineRef, recenter]);

  /* ── gestures: drag to pan, wheel / pinch to zoom, tap a place ── */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: 0, pinch: 0 });

  const local = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, local(e));
    gesture.current.moved = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine) return;
    const p = local(e);
    const prev = pointers.current.get(e.pointerId);
    if (prev) {
      pointers.current.set(e.pointerId, p);
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (gesture.current.pinch > 0) {
          engine.zoomBy(d / gesture.current.pinch, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        }
        gesture.current.pinch = d;
        gesture.current.moved += 10;
        return;
      }
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      gesture.current.moved += Math.abs(dx) + Math.abs(dy);
      if (gesture.current.moved > 4) engine.panBy(dx, dy);
    }
    if (e.pointerType === "mouse") engine.setPointer(p);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    const had = pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinch = 0;
    if (!engine || !had || gesture.current.moved > 6 || pointers.current.size > 0) return;
    const p = local(e);
    const hit = engine.hitTest(p.x, p.y);
    if (hit) select(hit === selected ? null : hit);
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      // trackpads send small deltas (and ctrl for pinch); mice send big notches
      const scale = e.ctrlKey ? 0.012 : 0.0022;
      engineRef.current?.zoomBy(Math.exp(-e.deltaY * scale), { x: e.clientX - r.left, y: e.clientY - r.top });
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [engineRef]);

  const active = useMemo(() => withKm.find((p) => p.id === selected) ?? null, [selected]);
  const peek = hovered ?? selected;

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* map */}
      <div
        ref={stageRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(e) => e.pointerType === "mouse" && engineRef.current?.setPointer(null)}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block"
          role="img"
          aria-label={`Map of places I've been: ${places.map((p) => p.name).join(", ")}`}
        />
        <AnimatePresence>
          {!ready && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="dotgrid absolute inset-0"
            />
          )}
        </AnimatePresence>
      </div>

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
        <Link
          href="/#travels"
          onClick={playClick}
          className="tactile pointer-events-auto group flex h-9 items-center gap-1.5 rounded-full pr-4 pl-3 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Home
        </Link>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* story panel */}
      <div
        ref={panelRef}
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent px-5 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))] min-[900px]:inset-x-auto min-[900px]:bottom-10 min-[900px]:left-10 min-[900px]:w-[360px] min-[900px]:bg-none min-[900px]:p-0"
      >
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div key={active.id} {...fade}>
              <button
                type="button"
                onClick={() => select(null)}
                className="group mb-4 flex cursor-pointer items-center gap-1.5 font-mono text-[11px] tracking-widest text-faint uppercase transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
                All places
              </button>
              <h1 className="font-serif text-[40px] leading-none tracking-tight sm:text-[48px]">
                {active.name}
              </h1>
              <p className="mt-2 text-[13.5px] text-muted">
                {active.region}, {active.state}
              </p>
              <p className="mt-5 max-w-[34ch] font-serif text-[19px] leading-snug text-foreground/85 italic">
                {active.note}
              </p>
              <p className="mt-5 font-mono text-[11px] tracking-wider text-faint">
                {active.home ? "where the lines begin" : `${active.km.toLocaleString()} km from home`}
              </p>
            </motion.div>
          ) : (
            <motion.div key="index" {...fade}>
              <p className="mb-3 font-mono text-[11px] tracking-widest text-faint uppercase">Travels</p>
              <h1 className="font-serif text-[40px] leading-[0.95] tracking-tight sm:text-[48px]">
                Places I&apos;ve been
              </h1>
              <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-muted">
                Every line starts at home. A small map of where the road has taken me so far.
              </p>
              <ul className="-mx-5 mt-6 flex gap-x-1 gap-y-0.5 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)] [scrollbar-width:none] min-[900px]:mx-[-4px] min-[900px]:flex-wrap min-[900px]:overflow-visible min-[900px]:px-0 min-[900px]:[mask-image:none]">
                {withKm.map((p) => (
                  <li key={p.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => select(p.id)}
                      onMouseEnter={() => engineRef.current?.setHovered(p.id)}
                      onMouseLeave={() => engineRef.current?.setHovered(null)}
                      className={`cursor-pointer rounded-md px-1 py-0.5 font-serif text-[18px] leading-tight transition-colors ${
                        peek === p.id ? "text-[#87bbea]" : "text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="absolute top-20 right-4 flex flex-col items-end gap-2 sm:right-6 min-[900px]:top-auto min-[900px]:bottom-10">
        <AnimatePresence>
          {away && (
            <motion.button
              type="button"
              onClick={recenter}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="tactile flex h-9 cursor-pointer items-center gap-1.5 rounded-full pr-3.5 pl-3 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
              aria-label="Back to India"
            >
              <LocateFixed className="size-3.5" />
              Recenter
            </motion.button>
          )}
        </AnimatePresence>
        <div className="tactile flex flex-col overflow-hidden rounded-full">
          <button
            type="button"
            onClick={() => zoom(1.5)}
            className="flex size-9 cursor-pointer items-center justify-center text-faint transition-colors hover:text-foreground"
            aria-label="Zoom in"
          >
            <Plus className="size-4" />
          </button>
          <span className="mx-2 h-px bg-edge" />
          <button
            type="button"
            onClick={() => zoom(1 / 1.5)}
            className="flex size-9 cursor-pointer items-center justify-center text-faint transition-colors hover:text-foreground"
            aria-label="Zoom out"
          >
            <Minus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
