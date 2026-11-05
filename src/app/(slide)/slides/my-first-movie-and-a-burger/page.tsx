import type { Metadata } from "next";
import { FirstMovieStory } from "@/components/slides/first-movie-story";
import { profile } from "@/data/profile";

const description = "My first cinema, my first burger, and the cool couple who rented one of our houses. An immersive core memory from Chennai.";

export const metadata: Metadata = {
  title: "My First Movie & a Burger · Core memories",
  description,
  alternates: { canonical: "/slides/my-first-movie-and-a-burger" },
  openGraph: {
    title: "My First Movie & a Burger",
    description,
    type: "article",
    url: `${profile.url}/slides/my-first-movie-and-a-burger`,
    authors: [profile.name],
  },
  twitter: {
    card: "summary_large_image",
    title: "My First Movie & a Burger",
    description,
  },
};

export default function FirstMovieMemoryPage() {
  return <FirstMovieStory />;
}
