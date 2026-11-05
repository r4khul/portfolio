"use client";

import { MemoryArt, settleFinale } from "./memory-art";
import { pedalBicycle } from "./memory-bicycle";
import { MemoryEnvironment } from "./memory-environment";
import { GAME_CONSOLE_MARKS } from "./memory-sfx";
import { MemoryStory, type Keyframes, type MemoryFilm } from "./memory-story";
import { gameConsoleMemory } from "@/data/game-console-memory";

const cameras: Record<string, Keyframes> = {
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

const drawing: Record<string, string> = {
  // the cousin's house by day: we sit in the same places at the laptop and after
  cousins: "day", laptop: "day", four: "day", brick: "day", console: "day", price: "day",
  // the last evening: I stand by the window from nine until I go to Amma
  packed: "evening", gift: "evening", taking: "evening", pocket: "evening", permission: "evening",
  shop: "shop", empty: "shop", other: "shop",
  // the ride home, and the same ride remembered
  ride: "home", reflection: "home", after: "home", finale: "home",
};

const film: MemoryFilm = {
  title: ["Game Console", "& Ice Tubes"],
  label: "Game Console and Ice Tubes",
  number: "01",
  scenes: gameConsoleMemory,
  cameras,
  drawing,
  // a hard cut to his face when it is sold out; setting off, the bicycle drifts in
  entrance: (_, to) => (to === "empty" ? "cut" : to === "rush" ? "drift" : undefined),
  Art: MemoryArt,
  Environment: MemoryEnvironment,
  animate: (scene, art, progress) => {
    pedalBicycle(scene, progress);
    if (art === "finale") settleFinale(scene, progress);
  },
  marks: GAME_CONSOLE_MARKS,
};

export function GameConsoleStory() {
  return <MemoryStory film={film} />;
}
