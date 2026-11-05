import { firstMovieMemory } from "./first-movie-memory";
import { gameConsoleMemory } from "./game-console-memory";

export type MemoryScene = {
  id: string;
  art: string;
  paragraphs: string[];
  /** shows the memory's title above the paragraphs, as the cover and the last shot do */
  title?: boolean;
};

export type Memory = {
  slug: string;
  number: string;
  /** the title, as two lines; the second is set in italics */
  title: readonly [string, string];
  place: string;
  summary: string;
  minutes: number;
  scenes: readonly MemoryScene[];
  published: string;
};

export const memories: Memory[] = [
  {
    slug: "game-console-and-ice-tubes",
    number: "01",
    title: ["Game Console", "& Ice Tubes"],
    place: "Nagercoil",
    summary: "A bicycle ride, a console I never bought, and a kind of love I only understood later.",
    minutes: 7,
    scenes: gameConsoleMemory,
    published: "2026-11-03T00:00:00+05:30",
  },
  {
    slug: "my-first-movie-and-a-burger",
    number: "02",
    title: ["My First Movie", "& a Burger"],
    place: "Chennai",
    summary: "My first cinema, my first burger, and the cool couple who rented one of our houses.",
    minutes: 6,
    scenes: firstMovieMemory,
    published: "2026-11-06T00:00:00+05:30",
  },
];

export const memoryBySlug = (slug: string) => memories.find((memory) => memory.slug === slug);
