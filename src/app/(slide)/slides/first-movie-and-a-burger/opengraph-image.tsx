import { MoviePosterArt } from "@/components/slides/first-movie-poster";
import { memoryShareImage, shareSize } from "@/components/slides/memory-share-image";
import { memoryBySlug } from "@/data/memories";

export const alt = "First Movie & a Burger: an illustrated core memory from Chennai. A film clapperboard, a burger and a Ninja Turtle toy, and behind them a couple and a boy riding home on a motorbike under a street lamp.";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return memoryShareImage(memoryBySlug("first-movie-and-a-burger")!, <MoviePosterArt />);
}
