import type { Metadata } from "next";
import { CricketSetStory } from "@/components/slides/cricket-set-story";
import { profile } from "@/data/profile";

const description = "My first cricket set, wrapped in golden paper, and the cool Anna who didn’t just give it to me. He played with me. An immersive core memory from Chennai.";

export const metadata: Metadata = {
  title: "Early Birthday & a Cricket Set · Core memories",
  description,
  alternates: { canonical: "/slides/early-birthday-and-a-cricket-set" },
  openGraph: {
    title: "Early Birthday & a Cricket Set",
    description,
    type: "article",
    url: `${profile.url}/slides/early-birthday-and-a-cricket-set`,
    authors: [profile.name],
  },
  twitter: {
    card: "summary_large_image",
    title: "Early Birthday & a Cricket Set",
    description,
  },
};

export default function CricketSetMemoryPage() {
  return <CricketSetStory />;
}
