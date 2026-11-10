import { KeychainPosterArt } from "@/components/slides/heart-keychain-poster";
import { memoryShareImage, shareSize } from "@/components/slides/memory-share-image";
import { memoryBySlug } from "@/data/memories";

export const alt = "Last Exam & a Heart Keychain: an illustrated core memory from Chennai. An exam pad, a pencil and a heart keychain, and behind them the bus home passing a school at dusk.";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return memoryShareImage(memoryBySlug("last-exam-and-a-heart-keychain")!, <KeychainPosterArt />);
}
