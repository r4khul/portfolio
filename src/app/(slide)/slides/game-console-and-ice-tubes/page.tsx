import type { Metadata } from "next";
import { MemoryStory } from "@/components/slides/memory-story";
import { profile } from "@/data/profile";

const description = "A bicycle ride, a console I never bought, and a kind of love I only understood later. An immersive core memory from Nagercoil.";

export const metadata: Metadata = {
  title: "Game Console & Ice Tubes · Core memories",
  description,
  alternates: { canonical: "/slides/game-console-and-ice-tubes" },
  openGraph: {
    title: "Game Console & Ice Tubes",
    description,
    type: "article",
    url: `${profile.url}/slides/game-console-and-ice-tubes`,
    authors: [profile.name],
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Console & Ice Tubes",
    description,
  },
};

export default function GameConsoleMemoryPage() {
  return <MemoryStory />;
}
