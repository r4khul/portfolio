import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/* eslint-disable @next/next/no-img-element -- ImageResponse renders embedded assets with Satori. */

export const runtime = "nodejs";
export const dynamic = "force-static";

const size = {
  width: 1200,
  height: 630,
};

async function publicAsset(filePath: string, mimeType: string) {
  const file = await readFile(path.join(process.cwd(), "public", filePath));
  return `data:${mimeType};base64,${file.toString("base64")}`;
}

export async function GET() {
  const [logo, lightGallery, darkExpiring] = await Promise.all([
    publicAsset("images/projects/toys/pinshot/logo.png", "image/png"),
    publicAsset("images/projects/toys/pinshot/light-gallery.png", "image/png"),
    publicAsset("images/projects/toys/pinshot/dark-expiring.png", "image/png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#F9F7FF",
          color: "#1D1B20",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -245,
            right: -75,
            display: "flex",
            width: 680,
            height: 680,
            borderRadius: 680,
            background: "#EADDFF",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -310,
            left: -185,
            display: "flex",
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "#FFD8E4",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 34,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid rgba(79,55,139,0.16)",
            background: "rgba(255,255,255,0.72)",
            color: "#4F378B",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ display: "flex", width: 7, height: 7, borderRadius: 7, background: "#6750A4" }} />
          ANDROID · OPEN SOURCE
        </div>

        <div
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            display: "flex",
            width: 590,
            flexDirection: "column",
            justifyContent: "center",
            padding: "54px 0 52px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src={logo} width={78} height={78} alt="" style={{ borderRadius: 22 }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 62, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.055em" }}>
                Pinshot
              </span>
              <span style={{ marginTop: 8, color: "#6750A4", fontSize: 16, fontWeight: 700, letterSpacing: "0.07em" }}>
                SCREENSHOTS, WITH AN EXPIRY DATE
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              maxWidth: 500,
              marginTop: 38,
              fontSize: 34,
              lineHeight: 1.14,
              fontWeight: 750,
              letterSpacing: "-0.035em",
            }}
          >
            Keep the shots that matter. Let the rest disappear.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 92,
                height: 70,
                borderRadius: "35px 35px 35px 12px",
                background: "#6750A4",
                color: "#FFFFFF",
                fontSize: 29,
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              24h
            </div>
            <div style={{ display: "flex", flexDirection: "column", color: "#49454F" }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>Automatic cleanup</span>
              <span style={{ marginTop: 4, fontSize: 16 }}>One tap pins anything worth keeping.</span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 72,
            left: 660,
            display: "flex",
            width: 252,
            height: 566,
            overflow: "hidden",
            borderRadius: 48,
            border: "7px solid rgba(255,255,255,0.88)",
            background: "#F8F7FF",
            boxShadow: "0 24px 60px rgba(33, 24, 56, 0.18)",
            transform: "rotate(-5deg)",
          }}
        >
          <img src={lightGallery} width={252} height={566} alt="" style={{ width: "100%", height: "100%" }} />
        </div>

        <div
          style={{
            position: "absolute",
            top: 116,
            left: 906,
            display: "flex",
            width: 252,
            height: 566,
            overflow: "hidden",
            borderRadius: 48,
            border: "7px solid rgba(255,255,255,0.88)",
            background: "#101116",
            boxShadow: "0 26px 70px rgba(33, 24, 56, 0.28)",
            transform: "rotate(4deg)",
          }}
        >
          <img src={darkExpiring} width={252} height={566} alt="" style={{ width: "100%", height: "100%" }} />
        </div>

        <div
          style={{
            position: "absolute",
            right: 345,
            bottom: 42,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "11px 15px",
            borderRadius: "18px 18px 18px 6px",
            background: "#FFFFFF",
            color: "#4F378B",
            boxShadow: "0 14px 34px rgba(33, 24, 56, 0.16)",
            fontSize: 16,
            fontWeight: 750,
          }}
        >
          <span style={{ display: "flex", fontSize: 20 }}>⌁</span>
          LIGHT + DARK, BY SYSTEM
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
