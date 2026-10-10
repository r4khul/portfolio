import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { AtlasExplorer } from "@/components/home/travel/atlas-explorer";

export const metadata: Metadata = {
  title: "Travels",
  description: `Places ${profile.name} has been, drawn on a hand-built pixel map of India.`,
  alternates: { canonical: "/travels" },
};

export default function TravelsPage() {
  return <AtlasExplorer />;
}
