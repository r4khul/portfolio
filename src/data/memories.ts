import { cricketSetMemory } from "./cricket-set-memory";
import { firstMovieMemory } from "./first-movie-memory";
import { gameConsoleMemory } from "./game-console-memory";
import { heartKeychainMemory } from "./heart-keychain-memory";
import { WORDS_PER_MINUTE, countWords } from "@/lib/reading-time";

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
  /** about how long it takes, worked out from its scenes by `readingMinutes` */
  minutes: number;
  scenes: readonly MemoryScene[];
  published: string;
};

/**
 * About how long a memory takes, in minutes: its words at the site's reading
 * pace, and a few seconds to take in each scene's drawing, to the nearest
 * minute.
 */
const SECONDS_PER_DRAWING = 5;
const readingMinutes = (scenes: readonly MemoryScene[]) => {
  const words = countWords(scenes.flatMap((scene) => scene.paragraphs).join(" "));
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE + (scenes.length * SECONDS_PER_DRAWING) / 60));
};

export const memories: Memory[] = ([
  {
    slug: "game-console-and-ice-tubes",
    number: "01",
    title: ["Game Console", "& Ice Tubes"],
    place: "Nagercoil",
    summary: "A bicycle ride, a console I never bought, and a kind of love I only understood later.",
    scenes: gameConsoleMemory,
    published: "2026-11-03T00:00:00+05:30",
  },
  {
    slug: "first-movie-and-a-burger",
    number: "02",
    title: ["First Movie", "& a Burger"],
    place: "Chennai",
    summary: "My first cinema, my first burger, and the cool couple who rented one of our houses.",
    scenes: firstMovieMemory,
    published: "2026-11-06T00:00:00+05:30",
  },
  {
    slug: "last-exam-and-a-heart-keychain",
    number: "03",
    title: ["Last Exam", "& a Heart Keychain"],
    place: "Chennai",
    summary: "The last paper of sixth standard, a heart keychain in my bag, and the first girl my age I really talked to.",
    scenes: heartKeychainMemory,
    published: "2026-11-10T00:00:00+05:30",
  },
  {
    slug: "my-birthday-and-a-cricket-set",
    number: "04",
    title: ["My Birthday", "& a Cricket Set"],
    place: "Chennai",
    summary: "My first cricket set, wrapped in golden paper, and the cool Anna who didn’t just give it to me. He played with me.",
    scenes: cricketSetMemory,
    published: "2026-11-15T00:00:00+05:30",
  },
] satisfies Omit<Memory, "minutes">[]).map((memory) => ({ ...memory, minutes: readingMinutes(memory.scenes) }));

export const memoryBySlug = (slug: string) => memories.find((memory) => memory.slug === slug);
