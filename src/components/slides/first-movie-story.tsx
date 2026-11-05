"use client";

import { FirstMovieArt, settleTurtle } from "./first-movie-art";
import { MemoryEnvironment } from "./memory-environment";
import { FIRST_MOVIE_MARKS } from "./memory-sfx";
import { MemoryStory, type Keyframes, type MemoryFilm } from "./memory-story";
import { firstMovieMemory } from "@/data/first-movie-memory";

const cameras: Record<string, Keyframes> = {
  cover: [[0, "405 135 410 273"], [1, "422 147 376 251"]],
  couple: [[0, "385 135 450 300"], [1, "400 150 420 280"]],
  games: [[0, "360 150 450 300"], [1, "445 205 345 230"]],
  english: [[0, "405 155 390 260"], [1, "420 165 360 240"]],
  phone: [[0, "470 230 270 180"], [1, "500 260 210 140"]],
  ticket: [[0, "390 132 420 280"], [1, "420 150 360 240"]],
  asking: [[0, "425 120 450 300"], [1, "440 130 420 280"]],
  homework: [[0, "405 155 390 260"], [1, "420 150 360 240"]],
  ready: [[0, "455 150 390 260"], [1, "480 160 345 230"]],
  avenger: [[0, "380 145 420 280"], [1, "395 155 390 260"]],
  panipuri: [[0, "350 125 480 320"], [1, "370 140 450 300"]],
  theatre: [[0, "420 65 570 380"], [1, "470 170 360 240"]],
  counter: [[0, "350 110 480 320"], [1, "520 180 255 170"]],
  drink: [[0, "420 65 570 380"], [1, "480 190 300 200"]],
  burger: [[0, "430 125 480 320"], [1, "470 160 420 280"]],
  photo: [[0, "450 120 480 320"], [1, "470 140 450 300"]],
  home: [[0, "390 145 420 280"], [1, "395 150 405 270"]],
  night: [[0, "345 90 510 340"], [1, "420 110 405 270"]],
  after: [[0, "385 135 450 300"], [1, "400 145 420 280"]],
  money: [[0, "400 145 420 280"], [1, "455 150 360 240"]],
  life: [[0, "455 150 360 240"], [1, "520 170 270 180"]],
  finale: [[0, "520 170 270 180"], [0.24, "614 236 120 80"], [0.42, "614 236 120 80"], [0.7, "547 220 190 127"], [1, "547 220 190 127"]],
};

const drawing: Record<string, string> = {
  // the three of us at the end, and the turtle stepping out of my hand into the cover
  after: "goodbye", money: "goodbye", life: "goodbye", finale: "goodbye",
};

/** The house and the street behind the scenes; the cinema and McDonald's stand on the page alone. */
const PLACE: Record<string, "interior" | "street"> = {
  couple: "interior", games: "interior", english: "interior", phone: "interior", ticket: "interior",
  asking: "interior", homework: "interior", ready: "interior", night: "interior", after: "interior", money: "interior", life: "interior", finale: "interior",
  cover: "street", avenger: "street", panipuri: "street", home: "street",
};

function Environment({ scene }: { scene: string }) {
  const place = PLACE[scene];
  return place ? <MemoryEnvironment scene={scene} place={place} /> : null;
}

const wheels = new WeakMap<HTMLElement, SVGGElement[]>();

/** The Avenger's wheels turn with the scroll, and the turtle finds its place in the last shot. */
function animate(scene: HTMLElement, art: string, progress: number) {
  if (art === "finale") settleTurtle(scene, progress);
  if (art !== "avenger" && art !== "home") return;
  let found = wheels.get(scene);
  if (!found) {
    found = Array.from(scene.querySelectorAll<SVGGElement>(".movie-avenger__spin"));
    wheels.set(scene, found);
  }
  const spin = `rotate(${((progress * (art === "avenger" ? 1800 : 900)) % 360).toFixed(1)})`;
  for (const wheel of found) if (wheel.getAttribute("transform") !== spin) wheel.setAttribute("transform", spin);
}

const film: MemoryFilm = {
  title: ["My First Movie", "& a Burger"],
  label: "My First Movie and a Burger",
  number: "02",
  scenes: firstMovieMemory,
  cameras,
  drawing,
  // setting off, the Avenger drifts in
  entrance: (_, to) => (to === "avenger" ? "drift" : undefined),
  Art: FirstMovieArt,
  Environment,
  animate,
  marks: FIRST_MOVIE_MARKS,
};

export function FirstMovieStory() {
  return <MemoryStory film={film} />;
}
