"use client";

import { CricketSetArt } from "./cricket-set-art";
import { MemoryEnvironment, type Place } from "./memory-environment";
import { CRICKET_SET_MARKS } from "./memory-sfx";
import { MemoryStory, type Keyframes, type MemoryFilm } from "./memory-story";
import { cricketSetMemory } from "@/data/cricket-set-memory";

const cameras: Record<string, Keyframes> = {
  cover: [[0, "424 292 210 140"], [1, "440 302 180 120"]],
  anna: [[0, "430 165 345 230"], [1, "450 180 300 200"]],
  kind: [[0, "400 160 390 260"], [1, "420 175 345 230"]],
  gate: [[0, "330 120 570 380"], [1, "360 140 510 340"]],
  golden: [[0, "500 170 315 210"], [1, "526 198 255 170"]],
  wonder: [[0, "480 170 330 220"], [1, "500 190 285 190"]],
  unwrap: [[0, "500 210 300 200"], [1, "530 240 240 160"]],
  set: [[0, "480 260 300 200"], [1, "510 270 255 170"]],
  setup: [[0, "440 190 360 240"], [1, "460 210 315 210"]],
  played: [[0, "400 160 540 360"], [1, "420 180 480 320"]],
  batting: [[0, "450 220 330 220"], [1, "480 250 270 180"]],
  leaving: [[0, "300 120 570 380"], [1, "320 140 510 340"]],
  years: [[0, "400 160 540 360"], [1, "420 180 480 320"]],
  level: [[0, "420 180 480 320"], [1, "440 200 420 280"]],
  heart: [[0, "440 200 420 280"], [1, "460 220 360 240"]],
  matters: [[0, "460 220 360 240"], [1, "470 230 330 220"]],
  finale: [[0, "470 230 330 220"], [0.24, "470 230 330 220"], [0.44, "440 260 240 160"], [0.7, "440 302 180 120"], [1, "440 302 180 120"]],
};

const drawing: Record<string, string> = {
  // at home: who he was to me, and how I ran to him
  anna: "home", kind: "home",
  // the present: wondering, opening it, what came out
  wonder: "opening", unwrap: "opening", set: "opening",
  // playing in the lane
  played: "play", batting: "play",
  // the two of us playing, remembered, until only the set is left
  level: "remembered", heart: "remembered", matters: "remembered", finale: "remembered",
};

/** What stands faintly behind each scene: our lane, and home. */
const PLACE: Record<string, Place> = {
  cover: "lane", gate: "lane", golden: "lane", setup: "lane", played: "lane", batting: "lane", leaving: "lane", years: "lane",
  level: "lane", heart: "lane", matters: "lane", finale: "lane",
  anna: "interior", kind: "interior", wonder: "interior", unwrap: "interior", set: "interior",
};

function Environment({ scene }: { scene: string }) {
  const place = PLACE[scene];
  return place ? <MemoryEnvironment scene={scene} place={place} /> : null;
}

const film: MemoryFilm = {
  title: ["Early Birthday", "& a Cricket Set"],
  label: "Early Birthday and a Cricket Set",
  number: "04",
  scenes: cricketSetMemory,
  cameras,
  drawing,
  // years later, the picture drifts in
  entrance: (_, to) => (to === "years" ? "drift" : undefined),
  Art: CricketSetArt,
  Environment,
  marks: CRICKET_SET_MARKS,
};

export function CricketSetStory() {
  return <MemoryStory film={film} />;
}
