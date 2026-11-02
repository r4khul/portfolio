"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MemoryArt, settleFinale } from "./memory-art";
import { MemoryEnvironment } from "./memory-environment";
import { pedalBicycle } from "./memory-bicycle";
import { useMemorySound } from "./memory-sound";
import { AudioPrompt } from "@/components/stories/engine/audio-prompt";
import { gameConsoleMemory } from "@/data/game-console-memory";
import "./memory-story.css";

const landscapeQuery = "(max-height: 680px) and (min-aspect-ratio: 13/10)";
const portraitQuery = "(max-aspect-ratio: 5/4)";

/**
 * Each scene's camera, as viewBox keyframes across its scroll: [progress, box].
 *
 * Every box has the same 3:2 shape, so a drawing never jumps in size between
 * shots, and keeps a margin of about an eighth of its width around the people
 * and things in it, so the soft edge never touches them on any screen. A scene
 * that continues the previous drawing starts exactly where the last one ended,
 * so the handover is invisible and only the words change.
 */
type Keyframes = readonly (readonly [at: number, box: string])[];
const sceneCameras: Record<string, Keyframes> = {
  cover: [[0, "246 -22 710 473"], [1, "234 -30 734 489"]],
  cousins: [[0, "370 135 545 363"], [1, "405 158 474 316"]],
  laptop: [[0, "405 158 474 316"], [1, "497 242 237 158"]],
  four: [[0, "497 242 237 158"], [0.5, "430 170 420 280"], [1, "405 158 474 316"]],
  brick: [[0, "405 158 474 316"], [1, "518 244 248 165"]],
  console: [[0, "518 244 248 165"], [1, "369 129 441 294"]],
  price: [[0, "369 129 441 294"], [1, "464 131 435 290"]],
  packed: [[0, "310 30 636 424"], [1, "334 47 587 391"]],
  gift: [[0, "334 47 587 391"], [1, "312 47 587 391"]],
  taking: [[0, "312 47 587 391"], [1, "400 110 480 320"]],
  pocket: [[0, "400 110 480 320"], [1, "334 47 587 391"]],
  permission: [[0, "334 47 587 391"], [1, "283 40 600 400"]],
  rush: [[0, "215 -10 730 487"], [1, "237 4 686 458"]],
  shop: [[0, "220 -10 766 511"], [1, "241 4 724 482"]],
  empty: [[0, "542 217 345 230"], [1, "513 211 354 236"]],
  other: [[0, "513 211 354 236"], [1, "365 176 461 307"]],
  ice: [[0, "330 45 540 360"], [1, "345 56 510 340"]],
  ride: [[0, "205 -20 750 500"], [1, "226 -9 709 472"]],
  reflection: [[0, "226 -9 709 472"], [1, "215 -16 730 487"]],
  after: [[0, "215 -16 730 487"], [1, "130 -40 900 600"]],
  finale: [[0, "130 -40 900 600"], [0.2, "215 -16 730 487"], [0.34, "630 150 150 100"], [0.45, "630 150 150 100"], [0.68, "587 204 186 124"], [1, "587 204 186 124"]],
};

/** Scenes drawn from the same picture continue one another. */
const drawing: Record<string, string> = {
  // the cousin's house by day: we sit in the same places at the laptop and after
  cousins: "day", laptop: "day", four: "day", brick: "day", console: "day", price: "day",
  // the last evening: I stand by the window from nine until I go to Amma
  packed: "evening", gift: "evening", taking: "evening", pocket: "evening", permission: "evening",
  shop: "shop", empty: "shop", other: "shop",
  // the ride home, and the same ride remembered
  ride: "home", reflection: "home", after: "home", finale: "home",
};

/**
 * How a scene arrives:
 * - dissolve: the same picture continues, so the two frames simply cross
 * - dip: a new picture; the old one fades into the page, then the new one breathes in
 * - drift: setting off on the bicycle, the new picture glides in from the right
 * - cut: a hard cut to a closer frame, for the moment it hits
 */
type Entrance = "dissolve" | "dip" | "drift" | "cut";
function entranceOf(from: string, to: string): Entrance {
  if (to === "empty") return "cut";
  if (drawing[from] && drawing[from] === drawing[to]) return "dissolve";
  if (to === "rush") return "drift";
  return "dip";
}

/** The camera arrives at its last frame here and holds through the handover. */
const HOLD = 0.78;
/** Where the outgoing scene starts handing over to the next one. */
const HANDOVER = 0.8;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const amount = clamp(value);
  return amount * amount * (3 - 2 * amount);
};
const easeInOut = (value: number) => {
  const t = clamp(value);
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};

const parsed = new Map<string, number[][]>();
function cameraAt(art: string, progress: number) {
  let frames = parsed.get(art);
  if (!frames) {
    frames = (sceneCameras[art] ?? [[0, "0 0 1200 440"]]).map(([at, box]) => [at, ...box.split(" ").map(Number)]);
    parsed.set(art, frames);
  }
  if (progress <= frames[0][0]) return frames[0].slice(1);
  const last = frames[frames.length - 1];
  if (progress >= last[0]) return last.slice(1);
  let index = 0;
  while (index < frames.length - 2 && progress >= frames[index + 1][0]) index++;
  const [a, b] = [frames[index], frames[index + 1]];
  const t = easeInOut((progress - a[0]) / (b[0] - a[0]));
  return [1, 2, 3, 4].map((i) => a[i] + (b[i] - a[i]) * t);
}

type Look = { opacity: number; scale: number; shift: number };
const still: Look = { opacity: 1, scale: 1, shift: 0 };
const gone: Look = { opacity: 0, scale: 1, shift: 0 };

/** The outgoing and incoming looks for an entrance at handover progress `t`. */
function handover(entrance: Entrance, t: number): [Look, Look] {
  switch (entrance) {
    case "dip": {
      // out over the first two thirds, a soft breath in over the last two:
      // the pictures overlap faintly, so no frame is ever empty
      const out = smooth(t / 0.66);
      const arrive = smooth((t - 0.32) / 0.68);
      return [{ opacity: 1 - out, scale: 1, shift: 0 }, { opacity: arrive, scale: 1.018 - 0.018 * easeInOut(arrive), shift: 0 }];
    }
    case "drift": {
      const out = smooth(t / 0.55);
      const arrive = smooth((t - 0.4) / 0.6);
      return [{ opacity: 1 - out, scale: 1, shift: -0.02 * out }, { opacity: arrive, scale: 1, shift: 0.035 * (1 - easeInOut(arrive)) }];
    }
    case "cut":
      return t < 0.5 ? [still, gone] : [gone, still];
    default: {
      const e = easeInOut(t);
      return [{ opacity: 1 - e, scale: 1, shift: 0 }, { opacity: e, scale: 1, shift: 0 }];
    }
  }
}

export function MemoryStory() {
  const rootRef = useRef<HTMLElement>(null);
  const sound = useMemorySound();
  const { start: startSound, sfx } = sound;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const shots = Array.from(root.querySelectorAll<HTMLElement>("[data-memory-scene]")).map((el) => ({
      el,
      art: el.dataset.scene ?? "",
      world: el.querySelector<HTMLElement>(".memory-world")!,
      svg: el.querySelector<SVGSVGElement>(".memory-world svg")!,
      environment: el.querySelector<HTMLElement>(".memory-environment"),
      prose: el.querySelector<HTMLElement>(".memory-prose")!,
      paragraphs: el.querySelector<HTMLElement>(".memory-paragraphs")!,
      links: Array.from(el.querySelectorAll<HTMLAnchorElement>("a")),
      proseFrom: Number(el.dataset.proseFrom ?? 0),
      last: { box: "", opacity: "", live: false, prose: -1, look: "", progress: "", passage: "" },
    }));
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-memory-step]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const landscape = window.matchMedia(landscapeQuery);
    const portraitMedia = window.matchMedia(portraitQuery);
    let positions: { top: number; height: number }[] = [];
    let frame = 0;
    let disposed = false;
    let linear = false;
    let measured = { width: 0, height: 0 };
    let viewport = window.innerHeight;
    const live = new Set<number>();
    const lastFrame = { y: window.scrollY, time: 0 };

    const show = (index: number, on: boolean) => {
      const shot = shots[index];
      if (shot.last.live === on) return;
      shot.last.live = on;
      // Only the shots on screen are painted, and only they hold GPU layers.
      shot.el.classList.toggle("is-live", on);
      if (on) live.add(index);
      else live.delete(index);
    };

    const paint = (index: number, progress: number, look: Look, proseOpacity: number) => {
      const shot = shots[index];
      const travel = index === shots.length - 1 ? progress : clamp(progress / HOLD);
      const box = cameraAt(shot.art, travel).map((value) => value.toFixed(1)).join(" ");
      if (box !== shot.last.box) {
        shot.svg.setAttribute("viewBox", box);
        shot.last.box = box;
      }
      // Every value goes only to the element that uses it, so a frame restyles
      // the drawing and its backdrop, never the whole scene.
      const opacity = look.opacity.toFixed(3);
      if (opacity !== shot.last.opacity) {
        shot.world.style.opacity = opacity;
        if (shot.environment) shot.environment.style.opacity = (0.24 * look.opacity).toFixed(3);
        shot.last.opacity = opacity;
      }
      const scroll = progress.toFixed(4);
      if (scroll !== shot.last.progress) {
        shot.svg.style.setProperty("--scene-progress", scroll);
        shot.environment?.style.setProperty("--scene-progress", scroll);
        shot.last.progress = scroll;
      }
      const passage = `${(1 - smooth((progress - 0.23) / 0.07)).toFixed(3)} ${smooth((progress - 0.3) / 0.08).toFixed(3)}`;
      if (passage !== shot.last.passage) {
        const [first, next] = passage.split(" ");
        shot.paragraphs.style.setProperty("--passage-first", first);
        shot.paragraphs.style.setProperty("--passage-next", next);
        shot.last.passage = passage;
      }
      // Transitions move whole layers, which the compositor handles without a repaint.
      const lookKey = `${look.scale.toFixed(4)} ${look.shift.toFixed(4)}`;
      if (lookKey !== shot.last.look) {
        shot.world.style.scale = look.scale.toFixed(4);
        shot.world.style.translate = `${(look.shift * 100).toFixed(2)}% 0`;
        if (shot.environment) {
          shot.environment.style.scale = (1 + (look.scale - 1) * 0.4).toFixed(4);
          shot.environment.style.translate = `${(look.shift * 40).toFixed(2)}% 0`;
        }
        shot.last.look = lookKey;
      }
      // Words rise into place as they arrive, and drift up as they leave.
      if (Math.abs(proseOpacity - shot.last.prose) > 0.0005) {
        const leaving = progress > 0.5;
        shot.prose.style.opacity = proseOpacity.toFixed(3);
        shot.prose.style.translate = `0 ${((1 - proseOpacity) * (leaving ? -10 : 16)).toFixed(1)}px`;
        shot.el.style.pointerEvents = proseOpacity > 0.5 ? "auto" : "none";
        const tab = proseOpacity > 0.5 ? 0 : -1;
        shot.links.forEach((link) => {
          link.tabIndex = tab;
          link.style.opacity = proseOpacity.toFixed(3);
        });
        shot.last.prose = proseOpacity;
      }
      pedalBicycle(shot.el, progress);
      if (shot.art === "finale") settleFinale(shot.el, progress);
    };

    // The picture follows the scroll through a short ease, so a mouse wheel's
    // 100px steps glide instead of jumping. The page itself scrolls natively.
    const view = { y: window.scrollY, time: 0 };
    const EASE_MS = 110;
    const WARM = 0.002;

    const render = (y: number) => {
      let current = 0;
      for (let index = 1; index < positions.length; index++) {
        if (y >= positions[index].top) current = index;
        else break;
      }
      const { top, height } = positions[current];
      const final = current === shots.length - 1;
      const duration = final ? height - viewport : height;
      const progress = clamp((y - top) / Math.max(1, duration));
      const next = final ? -1 : current + 1;
      const previous = current - 1;
      const t = next < 0 ? 0 : clamp((progress - HANDOVER) / (1 - HANDOVER));
      const entrance = next < 0 || reducedMotion.matches ? "dissolve" : entranceOf(shots[current].art, shots[next].art);
      const [outgoing, incoming] = t > 0 ? handover(entrance, t) : [still, gone];

      // Neighbours are painted, invisibly, well before they are needed, so a
      // handover never waits on a scene's first paint.
      const warmNext = next >= 0 && progress > 0.5;
      const warmPrevious = previous >= 0 && progress < 0.12;
      const visible = new Set<number>([current]);
      if (warmNext) visible.add(next);
      if (warmPrevious) visible.add(previous);
      for (const index of Array.from(live)) if (!visible.has(index)) show(index, false);
      visible.forEach((index) => show(index, true));

      // The scene sounds follow the scene on screen, and the bicycle follows the reader's speed.
      const now = performance.now();
      const elapsed = Math.max(1, now - lastFrame.time) / 1000;
      const speed = lastFrame.time ? Math.abs(y - lastFrame.y) / viewport / elapsed : 0;
      lastFrame.y = y;
      lastFrame.time = now;
      const sounds = sfx.current;
      if (sounds) {
        sounds.update(shots[current].art, progress);
        sounds.ride(shots[current].art, speed);
      }

      // One passage leaves before the next one arrives.
      const shot = shots[current];
      const enterProse = shot.proseFrom > 0 ? smooth((progress - shot.proseFrom) / 0.1) : 1;
      const outProse = final ? enterProse : Math.min(enterProse, 1 - smooth((progress - 0.8) / 0.1));
      paint(current, progress, outgoing, outProse);
      if (warmNext) {
        const incomingProse = shots[next].proseFrom > 0 ? 0 : smooth((progress - 0.9) / 0.1);
        paint(next, 0, { ...incoming, opacity: Math.max(WARM, incoming.opacity) }, incomingProse);
      }
      if (warmPrevious) paint(previous, 1, { ...gone, opacity: WARM }, 0);
    };

    const update = (time: number) => {
      frame = 0;
      if (linear || positions.length === 0) return;
      const target = window.scrollY;
      const gap = target - view.y;
      // Reduced motion, or a long jump (a link, a key), goes straight there.
      if (reducedMotion.matches || Math.abs(gap) > viewport * 2.5 || !view.time) {
        view.y = target;
      } else {
        const elapsed = Math.min(64, Math.max(1, time - view.time));
        view.y += gap * (1 - Math.exp(-elapsed / EASE_MS));
        if (Math.abs(target - view.y) < 0.35) view.y = target;
      }
      view.time = time;
      render(view.y);
      if (view.y !== target) frame = window.requestAnimationFrame(update);
      else view.time = 0;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      viewport = window.innerHeight;
      measured = { width: window.innerWidth, height: viewport };
      root.style.setProperty("--memory-viewport", `${viewport}px`);
      const portrait = portraitMedia.matches;
      const copyHeights = shots.map(({ el }) => {
        const paragraphs = Array.from(el.querySelectorAll<HTMLElement>(".memory-paragraphs p"));
        const heading = el.querySelector<HTMLElement>(".memory-copy h1");
        const kicker = el.querySelector<HTMLElement>(".memory-copy .memory-kicker");
        return Math.max(0, ...paragraphs.map((paragraph) => paragraph.offsetHeight))
          + (heading ? heading.offsetHeight + parseFloat(getComputedStyle(heading).marginBottom) : 0)
          + (kicker ? kicker.offsetHeight + 14 : 0);
      });
      // On tall screens the picture sits below the words. One panel for every
      // scene, below the tallest passage, so the picture never resizes between shots.
      // The cover dips into the story, so it may keep a panel of its own below its title.
      const story = copyHeights.map((height, index) => (index === 0 ? 0 : viewport * (shots[index].art === "finale" ? 0.19 : 0.08) + height));
      root.style.setProperty("--world-top", `${Math.ceil(Math.max(...story) + 28)}px`);
      shots[0].el.style.setProperty("--world-top", `${Math.ceil(viewport * 0.19 + copyHeights[0] + 28)}px`);
      linear = reducedMotion.matches || shots.some((_, index) => {
        const budget = landscape.matches ? viewport - 80 : portrait && index !== 0 ? viewport * 0.62 : viewport * 0.72;
        return copyHeights[index] > budget + 2;
      });
      root.dataset.enhanced = "true";
      root.dataset.linear = String(linear);
      if (linear) {
        shots.forEach((shot, index) => {
          show(index, true);
          shot.world.style.opacity = "";
          if (shot.environment) shot.environment.style.opacity = "";
          shot.prose.style.opacity = "1";
          shot.prose.style.translate = "";
          shot.world.style.scale = "";
          shot.world.style.translate = "";
          shot.svg.setAttribute("viewBox", cameraAt(shot.art, 1).join(" "));
          shot.el.style.pointerEvents = "auto";
          shot.links.forEach((link) => {
            link.tabIndex = 0;
            link.style.opacity = "";
          });
        });
      } else {
        shots.forEach((shot) => { shot.last = { box: "", opacity: "", live: shot.last.live, prose: -1, look: "", progress: "", passage: "" }; });
      }
      positions = steps.map((step) => ({
        top: step.getBoundingClientRect().top + window.scrollY,
        height: step.offsetHeight,
      }));
      window.cancelAnimationFrame(frame);
      frame = 0;
      view.y = window.scrollY;
      view.time = 0;
      if (!linear && positions.length) render(view.y);
    };

    // A phone's address bar showing or hiding changes only the height a little;
    // that needs no relayout, and skipping it keeps scrolling smooth.
    const resize = () => {
      if (window.innerWidth === measured.width && Math.abs(window.innerHeight - measured.height) < 140) {
        viewport = window.innerHeight;
        schedule();
        return;
      }
      measure();
    };

    // Sideways means onward: a left swipe, a sideways trackpad scroll or the
    // right arrow all move the story forward, exactly like scrolling down.
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.2) window.scrollBy(0, event.deltaX);
    };
    let drag: { id: number; x: number; y: number; last: number; time: number; velocity: number; sideways: boolean | null } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, last: event.clientX, time: event.timeStamp, velocity: 0, sideways: null };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (drag.sideways === null && Math.hypot(dx, dy) > 10) drag.sideways = Math.abs(dx) > Math.abs(dy) * 1.1;
      if (!drag.sideways) return;
      const step = (event.clientX - drag.last) * -1.6;
      const elapsed = Math.max(1, event.timeStamp - drag.time);
      drag.velocity = drag.velocity * 0.6 + (step / elapsed) * 0.4;
      drag.last = event.clientX;
      drag.time = event.timeStamp;
      window.scrollBy(0, step);
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.id && drag.sideways && Math.abs(drag.velocity) > 0.25) {
        window.scrollBy({ top: Math.max(-1, Math.min(1, drag.velocity)) * viewport * 0.45, behavior: "smooth" });
      }
      drag = null;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        window.scrollBy({ top: (event.key === "ArrowRight" ? 1 : -1) * viewport * 0.55, behavior: "smooth" });
      }
    };
    // A sideways swipe must read the story, not leave the page through history.
    const overscroll = document.documentElement.style.overscrollBehaviorX;
    document.documentElement.style.overscrollBehaviorX = "none";
    window.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerEnd, { passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { passive: true });
    window.addEventListener("keydown", onKey);

    const observer = new ResizeObserver(() => measure());
    shots.forEach(({ el }) => observer.observe(el.querySelector<HTMLElement>(".memory-copy")!));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    reducedMotion.addEventListener("change", measure);
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    measure();

    return () => {
      disposed = true;
      delete root.dataset.enhanced;
      delete root.dataset.linear;
      root.style.removeProperty("--memory-viewport");
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      reducedMotion.removeEventListener("change", measure);
      window.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overscrollBehaviorX = overscroll;
      root.style.removeProperty("--world-top");
    };
  }, [sfx]);

  return (
    <main ref={rootRef} className="memory-story">
      <AudioPrompt onUnlock={startSound} />
      <article className="memory-film" aria-label="Game Console and Ice Tubes">
        {gameConsoleMemory.map((scene, index) => {
          const isCover = index === 0;
          const isFinale = scene.art === "finale";
          return (
            <div
              key={scene.id}
              data-memory-scene
              data-scene={scene.art}
              data-prose-from={isFinale ? 0.78 : undefined}
              className={`memory-scene${isCover ? " memory-scene--cover" : ""}${isFinale ? " memory-scene--finale" : ""}`}
            >
              <div className="memory-stage">
                <MemoryEnvironment scene={scene.art} />
                {isCover && <Link href="/slides" className="memory-return"><ArrowLeft size={14} aria-hidden="true" />Slides</Link>}
                <div className="memory-prose">
                  <div className="memory-copy">
                    {isFinale && <p className="memory-kicker">Core memory · 01</p>}
                    {(isCover || scene.title) && <h1>Game Console<br />&amp; Ice Tubes</h1>}
                    <div className="memory-paragraphs">
                      {scene.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                    </div>
                  </div>
                </div>
                <div className="memory-world" aria-hidden="true">
                  <MemoryArt scene={scene.art} viewBox={sceneCameras[scene.art]?.[0][1]} />
                </div>
              </div>
            </div>
          );
        })}
      </article>
      <div className="memory-scroll-track" aria-hidden="true">
        {gameConsoleMemory.map((scene, index) => (
          <div
            id={scene.id}
            key={scene.id}
            data-memory-step
            className={index === 0 ? "memory-step memory-step--cover" : index === gameConsoleMemory.length - 1 ? "memory-step memory-step--last" : "memory-step"}
          />
        ))}
      </div>
    </main>
  );
}
