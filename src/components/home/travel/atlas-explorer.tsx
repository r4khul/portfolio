"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronUp, LocateFixed, Minus, Plus } from "lucide-react";
import { places } from "@/data/travel";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";
import { haversineKm, type AtlasEngine } from "./atlas-engine";
import { useAtlas, warmAtlas } from "./use-atlas";

// start fetching + decoding the land as soon as this chunk loads
warmAtlas();

const home = places.find((p) => p.home) ?? places[0];
const withKm = places.map((p) => ({ ...p, km: p.home ? 0 : Math.round(haversineKm(home, p)) }));

/** Places grouped by state, home's state first, then by size, then A–Z. */
const groups = (() => {
  const map = new Map<string, typeof withKm>();
  for (const p of withKm) map.set(p.state, [...(map.get(p.state) ?? []), p]);
  return [...map.entries()]
    .map(([state, list]) => ({ state, list: list.sort((a, b) => a.km - b.km) }))
    .sort((a, b) =>
      a.state === home.state ? -1 : b.state === home.state ? 1 : b.list.length - a.list.length || a.state.localeCompare(b.state),
    );
})();

const ACCENT_TEXT = "text-[#2f80d1] dark:text-[#87bbea]";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);

  const applyInsets = useCallback((engine: AtlasEngine) => {
    const panel = panelRef.current;
    const { w, h } = engine.size;
    const vw = w || window.innerWidth;
    const vh = h || window.innerHeight;
    const pr = panel?.getBoundingClientRect();
    const head = headRef.current?.getBoundingClientRect();
    const wide = vw >= 900;
    engine.setInsets(
      wide
        ? { top: 72, right: 88, bottom: 56, left: (pr ? pr.right : 400) + 32 }
        : { top: 72, right: 28, bottom: (head ? vh - head.top : 200) + 12, left: 28 },
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
      if (!wasAway && !selected && !sheetOpen) e.jumpTo(e.homeView());
    });
    ro.observe(panel);
    return () => ro.disconnect();
  }, [applyInsets, engineRef, selected, sheetOpen]);

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
      setSheetOpen(false);
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
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
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

      {/* scrims keep type off the dots */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[560px] bg-gradient-to-r from-background via-background/90 to-transparent min-[900px]:block" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/80 to-transparent" />

      {/* story panel */}
      <div
        ref={panelRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background from-60% via-background/95 to-transparent px-5 pt-20 pb-[max(1.25rem,env(safe-area-inset-bottom))] min-[900px]:inset-x-auto min-[900px]:top-0 min-[900px]:bottom-0 min-[900px]:left-10 min-[900px]:flex min-[900px]:w-[380px] min-[900px]:flex-col min-[900px]:justify-end min-[900px]:bg-none min-[900px]:px-0 min-[900px]:pt-24 min-[900px]:pb-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div key={active.id} {...fade} className="pointer-events-auto">
              <button
                type="button"
                onClick={() => select(null)}
                className="group mb-5 flex cursor-pointer items-center gap-1.5 font-mono text-[11px] tracking-widest text-faint uppercase transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
                All places
              </button>
              <h1 className="font-serif text-[44px] leading-none tracking-tight min-[900px]:text-[52px]">
                {active.name}
              </h1>
              <p className="mt-2.5 text-[13.5px] text-muted">
                {active.region} <span className="text-faint">·</span> {active.state}
              </p>
              <p className="mt-6 max-w-[32ch] font-serif text-[20px] leading-snug text-foreground/85 italic">
                {active.note}
              </p>
              <p className="mt-6 font-mono text-[11px] tracking-wider text-faint">
                {active.home ? "where every line begins" : `${active.km.toLocaleString()} km from home`}
              </p>
            </motion.div>
          ) : (
            <motion.div key="index" {...fade} className="pointer-events-auto min-h-0 min-[900px]:flex min-[900px]:flex-col">
              <div ref={headRef}>
                <h1 className="font-serif text-[40px] leading-[0.95] tracking-tight min-[900px]:text-[52px]">
                  Places I&apos;ve been
                </h1>
                <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-muted">
                  Every line starts at home. A small map of where the road has taken me so far.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setSheetOpen((v) => !v);
                  }}
                  className="mt-5 flex w-full cursor-pointer items-center justify-between border-t border-edge pt-3 font-mono text-[11px] tracking-wider text-faint uppercase min-[900px]:pointer-events-none min-[900px]:cursor-default"
                  aria-expanded={sheetOpen}
                >
                  <span>
                    <span className="text-foreground">{places.length}</span> places
                    <span className="mx-1.5">·</span>
                    <span className="text-foreground">{groups.length}</span> states
                  </span>
                  <ChevronUp
                    className={`size-3.5 transition-transform duration-300 min-[900px]:hidden ${sheetOpen ? "" : "rotate-180"}`}
                  />
                </button>
              </div>

              {/* grouped index: always open on desktop, a sheet on mobile */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out min-[900px]:mt-1 min-[900px]:grid-rows-[1fr] min-[900px]:min-h-0 ${
                  sheetOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="max-h-[42vh] overflow-y-auto overscroll-contain pt-2 pb-2 [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-20px),transparent)] [scrollbar-width:none] min-[900px]:max-h-[46vh]">
                    {groups.map((g) => (
                      <section key={g.state} className="py-2.5">
                        <h2 className="mb-1.5 flex items-baseline justify-between font-mono text-[10.5px] tracking-widest text-faint uppercase">
                          {g.state}
                          <span className="tabular-nums">{g.list.length}</span>
                        </h2>
                        <ul className="-mx-1 flex flex-wrap gap-x-1">
                          {g.list.map((p) => (
                            <li key={p.id}>
                              <button
                                type="button"
                                onClick={() => select(p.id)}
                                onMouseEnter={() => engineRef.current?.setHovered(p.id)}
                                onMouseLeave={() => engineRef.current?.setHovered(null)}
                                className={`cursor-pointer rounded-md px-1 py-0.5 font-serif text-[19px] leading-tight transition-colors ${
                                  peek === p.id ? ACCENT_TEXT : "text-foreground/75 hover:text-foreground"
                                }`}
                              >
                                {p.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="absolute top-20 right-4 z-10 flex flex-col items-end gap-2 sm:right-6 min-[900px]:top-auto min-[900px]:bottom-10">
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
