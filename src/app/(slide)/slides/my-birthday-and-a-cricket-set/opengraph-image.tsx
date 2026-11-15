import { CricketPosterArt } from "@/components/slides/cricket-set-poster";
import { memoryShareImage, shareSize } from "@/components/slides/memory-share-image";
import { memoryBySlug } from "@/data/memories";

export const alt = "My Birthday & a Cricket Set: an illustrated core memory from Chennai. A present in golden paper beside a wicket, a bat leaning on it and a ball at its foot, in our lane at dusk.";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return memoryShareImage(memoryBySlug("my-birthday-and-a-cricket-set")!, <CricketPosterArt />);
}
