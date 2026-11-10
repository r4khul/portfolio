import type { Metadata } from "next";
import { HeartKeychainStory } from "@/components/slides/heart-keychain-story";
import { profile } from "@/data/profile";

const description = "The last paper of sixth standard, a heart keychain in my bag, and the first girl my age I really talked to. An immersive core memory from Chennai.";

export const metadata: Metadata = {
  title: "Last Exam & a Heart Keychain · Core memories",
  description,
  alternates: { canonical: "/slides/last-exam-and-a-heart-keychain" },
  openGraph: {
    title: "Last Exam & a Heart Keychain",
    description,
    type: "article",
    url: `${profile.url}/slides/last-exam-and-a-heart-keychain`,
    authors: [profile.name],
  },
  twitter: {
    card: "summary_large_image",
    title: "Last Exam & a Heart Keychain",
    description,
  },
};

export default function HeartKeychainMemoryPage() {
  return <HeartKeychainStory />;
}
