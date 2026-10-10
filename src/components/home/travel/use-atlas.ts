"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "motion/react";
import { places } from "@/data/travel";
import { AtlasEngine, loadLand, readTheme, type AtlasOptions } from "./atlas-engine";

/** Kick off the land-mask download/decode ahead of the first render. */
export function warmAtlas() {
  if (typeof window !== "undefined") loadLand().catch(() => {});
}

type UseAtlasArgs = {
  stageRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  options?: AtlasOptions;
  onHover?: (id: string | null) => void;
  /** called once the engine exists, before the first frame (set insets here) */
  onReady?: (engine: AtlasEngine) => void;
};

/**
 * Owns the canvas engine lifecycle: sizing, theme sync, land loading,
 * on-screen-only rendering and the first-view intro.
 */
export function useAtlas({ stageRef, canvasRef, options, onHover, onReady }: UseAtlasArgs) {
  const engineRef = useRef<AtlasEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();
  const hoverRef = useRef(onHover);
  const readyRef = useRef(onReady);

  useEffect(() => {
    hoverRef.current = onHover;
    readyRef.current = onReady;
  });

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowEnd = (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4;
    const engine = new AtlasEngine(canvas, places, { lowEnd, ...options }, {
      onHover: (id) => hoverRef.current?.(id),
    });
    engineRef.current = engine;
    engine.setTheme(readTheme(stage));
    readyRef.current?.(engine);

    const measure = () => {
      const r = stage.getBoundingClientRect();
      engine.resize(Math.round(r.width), Math.round(r.height), Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);

    // the site toggles `.dark` on <html>
    const mo = new MutationObserver(() => requestAnimationFrame(() => engine.setTheme(readTheme(stage))));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let landReady = false;
    let visible = false;
    let played = false;
    const maybeIntro = () => {
      if (landReady && visible && !played) {
        played = true;
        engine.playIntro();
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) engine.start();
        else engine.stop();
        maybeIntro();
      },
      { threshold: 0.15 },
    );
    io.observe(stage);

    const onVisibility = () => {
      if (document.hidden) engine.stop();
      else if (visible) engine.start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // land starts loading immediately; the masks are tiny and cached per page
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
      document.removeEventListener("visibilitychange", onVisibility);
      engine.destroy();
      engineRef.current = null;
    };
    // options are read once; the engine is rebuilt only on remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setReducedMotion(!!reduce);
  }, [reduce]);

  return { engineRef, ready, failed };
}
