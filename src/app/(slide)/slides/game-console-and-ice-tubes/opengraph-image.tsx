import { PosterArt } from "@/components/slides/memory-poster";
import { memoryShareImage, shareSize } from "@/components/slides/memory-share-image";
import { memoryBySlug } from "@/data/memories";

export const alt = "Game Console & Ice Tubes: an illustrated core memory from Nagercoil. A handheld console and five ice tubes, and behind them two boys riding home on a bicycle under a street lamp.";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return memoryShareImage(memoryBySlug("game-console-and-ice-tubes")!, <PosterArt />);
}
