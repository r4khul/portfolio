"use client";

import { HeartKeychainArt, settleKeychain } from "./heart-keychain-art";
import { MemoryEnvironment, type Place } from "./memory-environment";
import { HEART_KEYCHAIN_MARKS } from "./memory-sfx";
import { MemoryStory, type Keyframes, type MemoryFilm } from "./memory-story";
import { heartKeychainMemory } from "@/data/heart-keychain-memory";

const cameras: Record<string, Keyframes> = {
  cover: [[0, "402 160 420 280"], [1, "420 172 384 256"]],
  exam: [[0, "430 140 480 320"], [1, "470 190 300 200"]],
  clock: [[0, "470 190 300 200"], [1, "545 150 270 180"]],
  shy: [[0, "440 190 300 200"], [1, "470 210 260 173"]],
  chat: [[0, "470 210 260 173"], [1, "460 200 280 187"]],
  gifts: [[0, "470 230 320 213"], [1, "500 250 270 180"]],
  keychain: [[0, "500 250 270 180"], [1, "570 262 150 100"]],
  bag: [[0, "570 262 150 100"], [1, "510 250 240 160"]],
  holidays: [[0, "450 100 540 360"], [1, "470 120 500 333"]],
  giving: [[0, "460 200 280 187"], [1, "520 220 210 140"]],
  bye: [[0, "360 130 420 280"], [1, "380 140 400 267"]],
  bus: [[0, "370 150 480 320"], [1, "400 170 420 280"]],
  apart: [[0, "350 130 540 360"], [1, "380 150 480 320"]],
  innocence: [[0, "470 205 270 180"], [1, "500 215 240 160"]],
  first: [[0, "500 215 240 160"], [1, "520 220 210 140"]],
  finale: [[0, "520 220 210 140"], [0.24, "561 282 90 60"], [0.42, "561 282 90 60"], [0.7, "520 276 160 107"], [1, "520 276 160 107"]],
};

const drawing: Record<string, string> = {
  // the last exam: writing alone, then watching the clock
  exam: "exam", clock: "exam",
  // the two of us on our bench: she talks, then we both do
  shy: "bench", chat: "bench",
  // home, the night before: the gifts, the keychain held up, the keychain into the bag
  gifts: "home", keychain: "home", bag: "home",
  // the moment I gave it to her, remembered, until the keychain finds the cover
  innocence: "remembered", first: "remembered", finale: "remembered",
};

/** What stands faintly behind each scene: our school, home, the road home. */
const PLACE: Record<string, Place> = {
  cover: "classroom", exam: "classroom", clock: "classroom", shy: "classroom", chat: "classroom", holidays: "classroom", giving: "classroom",
  bye: "classroom", apart: "classroom", innocence: "classroom", first: "classroom", finale: "classroom",
  gifts: "interior", keychain: "interior", bag: "interior",
  bus: "city",
};

function Environment({ scene }: { scene: string }) {
  const place = PLACE[scene];
  return place ? <MemoryEnvironment scene={scene} place={place} /> : null;
}

const film: MemoryFilm = {
  title: ["Last Exam", "& a Heart Keychain"],
  label: "Last Exam and a Heart Keychain",
  number: "03",
  scenes: heartKeychainMemory,
  cameras,
  drawing,
  // on the bus home, the picture drifts in
  entrance: (_, to) => (to === "bus" ? "drift" : undefined),
  Art: HeartKeychainArt,
  Environment,
  animate: (scene, art, progress) => {
    if (art === "finale") settleKeychain(scene, progress);
  },
  marks: HEART_KEYCHAIN_MARKS,
};

export function HeartKeychainStory() {
  return <MemoryStory film={film} />;
}
