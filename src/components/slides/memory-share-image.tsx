import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { POSTER } from "./memory-poster";
import { toSvg } from "./memory-poster-svg";
import type { Memory } from "@/data/memories";
import { profile } from "@/data/profile";

export const shareSize = { width: POSTER.width, height: POSTER.height };

const INK = "#f4f4f5";
const PAPER = "#09090b";

/**
 * Instrument Serif as TrueType, which the share-image renderer needs, from
 * the same Google Fonts source the site's own fonts come from. Without it
 * the title falls back to the renderer's built-in sans.
 */
async function serif() {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap").then((response) => response.text());
    const faces = Array.from(css.matchAll(/font-style:\s*(normal|italic);[\s\S]*?src:\s*url\(([^)]+)\)/g));
    const fonts = await Promise.all(faces.map(async ([, style, url]) => ({
      name: "Instrument Serif",
      data: await fetch(url).then((response) => response.arrayBuffer()),
      style: style as "normal" | "italic",
      weight: 400 as const,
    })));
    return fonts.length ? fonts : undefined;
  } catch {
    return undefined;
  }
}

/** The renderer's own Geist, for the small words, as on the site. */
async function sans() {
  try {
    const data = await readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"));
    return [{ name: "Geist", data, style: "normal" as const, weight: 400 as const }];
  } catch {
    return [];
  }
}

/** A memory's share image: its poster, with the title and summary over a dark wash on the left. */
export async function memoryShareImage(memory: Memory, poster: ReactNode) {
  const art = toSvg(poster, { width: POSTER.width, height: POSTER.height, ink: INK, paper: PAPER });
  const [titleFonts, textFonts] = await Promise.all([serif(), sans()]);
  const fonts = [...textFonts, ...(titleFonts ?? [])];
  const title = titleFonts ? "Instrument Serif" : undefined;
  // each title line on one line in the 540 wide column: the serif runs about .38em a letter
  const titleSize = Math.min(98, Math.floor(540 / (Math.max(...memory.title.map((line) => line.length)) * 0.38)));
  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: PAPER, fontFamily: textFonts.length ? "Geist" : undefined }}>
        <img src={`data:image/svg+xml;base64,${Buffer.from(art).toString("base64")}`} width={POSTER.width} height={POSTER.height} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
        {/* a quiet wash behind the words, so the night stays behind them */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 700, height: "100%", display: "flex", background: "linear-gradient(90deg, rgba(9,9,11,0.94) 0%, rgba(9,9,11,0.82) 55%, rgba(9,9,11,0) 100%)" }} />
        <div style={{ position: "absolute", top: 118, left: 78, display: "flex", flexDirection: "column", width: 540 }}>
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 5, color: "#71717a", textTransform: "uppercase" }}>
            Core memory · {memory.number} · {memory.place}
          </div>
          <div style={{ display: "flex", marginTop: 30, fontFamily: title, fontSize: titleSize, lineHeight: 1, letterSpacing: -2, color: INK }}>{memory.title[0]}</div>
          <div style={{ display: "flex", marginTop: 4, fontFamily: title, fontStyle: "italic", fontSize: titleSize, lineHeight: 1, letterSpacing: -2, color: INK }}>{memory.title[1]}</div>
          <div style={{ display: "flex", marginTop: 34, width: 430, fontSize: 24, lineHeight: 1.5, color: "#a1a1aa" }}>
            {memory.summary}
          </div>
        </div>
        <div style={{ position: "absolute", left: 78, bottom: 46, display: "flex", fontSize: 18, letterSpacing: 1, color: "#71717a" }}>
          {profile.name} · Slides
        </div>
      </div>
    ),
    { ...shareSize, fonts: fonts.length ? fonts : undefined },
  );
}
