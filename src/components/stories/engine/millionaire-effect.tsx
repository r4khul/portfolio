"use client";

import { useId } from "react";
import { useStoryScene } from "@/lib/hooks/use-story-scene";

type MillionaireEffectType = "rewind" | "fortune" | "bank" | "watch";

interface MillionaireEffectProps {
  type: MillionaireEffectType;
  height?: string;
  label?: string;
}

const labels: Record<MillionaireEffectType, string> = {
  rewind: "A clock turns backward, its hands leaving faint traces behind them.",
  fortune: "Casino chips give way to the rising line of a market chart.",
  bank: "Two bank counters: a long waiting line on one side, an open passage on the other.",
  watch: "A wristwatch with an empty, elongated hexagonal diamond setting.",
};

function Rewind() {
  return (
    <g>
      <path d="M74 160h113m266 0h113" opacity="0.18" />
      <circle cx="320" cy="160" r="117" stroke="var(--story-faint)" opacity="0.25" />
      <circle cx="320" cy="160" r="106" opacity="0.35" />
      <circle cx="320" cy="160" r="92" opacity="0.85" />
      {Array.from({ length: 60 }, (_, index) => (
        <path
          key={index}
          d={index % 5 === 0 ? "M320 80v10" : "M320 80v3"}
          transform={`rotate(${index * 6} 320 160)`}
          opacity={index % 5 === 0 ? 0.9 : 0.35}
          strokeWidth={index % 5 === 0 ? 1.5 : 0.8}
        />
      ))}
      <g className="millionaire-clock-echo" opacity="0.12">
        <path d="M320 160V100M320 160l40 28" strokeWidth="2" />
      </g>
      <g className="millionaire-clock-minute">
        <path d="M320 173V96" stroke="var(--story-text)" strokeWidth="1.8" />
      </g>
      <g className="millionaire-clock-hour">
        <path d="M320 160l-38-25" stroke="var(--story-text)" strokeWidth="2.6" />
      </g>
      <circle cx="320" cy="160" r="3" fill="var(--story-text)" stroke="none" />
      <path className="millionaire-clock-orbit" d="M248 54a129 129 0 0 0-49 154m0 0-1-17m1 17 15-7" stroke="var(--story-text)" opacity="0.55" />
      <path d="M419 78a129 129 0 0 1 30 82" strokeDasharray="1 8" opacity="0.4" />
    </g>
  );
}

function Fortune() {
  return (
    <g>
      <path d="M76 249h488" opacity="0.25" />
      <path d="M310 73v176" strokeDasharray="2 8" opacity="0.2" />
      <g className="millionaire-chips">
        {[0, 1, 2, 3].map((index) => (
          <g key={index} transform={`translate(0 ${-index * 13})`}>
            <path d="M128 208v12c0 13 88 13 88 0v-12" opacity="0.8" />
            <path d="M143 218v10m19-8v10m20-10v10m19-12v9" opacity="0.3" />
            <ellipse cx="172" cy="208" rx="44" ry="12" fill="var(--story-bg)" />
            <ellipse cx="172" cy="208" rx="31" ry="7.5" opacity="0.45" />
          </g>
        ))}
        <g transform="rotate(-16 248 211)">
          <circle cx="248" cy="211" r="31" fill="var(--story-bg)" />
          <circle cx="248" cy="211" r="23" opacity="0.6" />
          <circle cx="248" cy="211" r="17" opacity="0.2" strokeDasharray="1 4" />
          {Array.from({ length: 8 }, (_, index) => (
            <path key={index} d="M248 180v8" transform={`rotate(${index * 45} 248 211)`} opacity="0.75" strokeWidth="2.5" />
          ))}
        </g>
      </g>
      <path d="M330 218h215m-215-46h215m-215-46h215m-215-46h215" opacity="0.16" />
      <path d="M352 208v23m28-29v22m29-68v31m29-22v24m31-64v29m25-23v21m37-65v25" opacity="0.35" />
      <path className="millionaire-market" pathLength="1" d="m333 213 28-18 22 7 29-42 27 12 31-41 25 6 37-48" stroke="var(--story-text)" strokeWidth="2" />
      <circle className="millionaire-market-tip" cx="532" cy="89" r="3" fill="var(--story-text)" stroke="none" />
      <path className="millionaire-transfer" d="M281 160h31m-5-4 5 4-5 4" opacity="0.55" />
    </g>
  );
}

function Bank() {
  return (
    <g>
      <path d="m120 93 200-48 200 48Zm-12 13h424M121 260h398M108 274h424" opacity="0.8" />
      <path d="m149 87 171-33 171 33M103 285h434" opacity="0.2" />
      <path d="M134 119v129m19-129v129m334-129v129m19-129v129M320 119v129" opacity="0.35" />
      <path d="M170 123h125v124H170Zm175 0h125v124H345Z" opacity="0.3" />
      <path d="m180 133 44 36m-36-36 27 22m139-22 42 34m-34-34 26 20" opacity="0.15" />
      <path d="M188 171h90v13h-90Zm174 0h91v13h-91Z" opacity="0.9" />
      <path d="M199 185v17m68-17v17m106-17v17m68-17v17" opacity="0.5" />
      <path d="M245 157h18v12h-18Zm2-4h17m-14-4h15M408 155h20v14h-20Zm4 5h10" opacity="0.55" />
      <path d="M391 168l6-12m-8 13h10" stroke="var(--story-text)" opacity="0.7" />
      <g className="millionaire-bank-wait" opacity="0.45">
        {[0, 1, 2, 3, 4].map((index) => (
          <g key={index} transform={`translate(${191 + index * 17} 0)`}>
            <circle cy="218" r="2" fill="var(--story-muted)" stroke="none" />
            <path d="M0 220v17m-4 0h8" />
          </g>
        ))}
        <path d="M191 223q9 8 17 0t17 0t17 0t17 0" />
      </g>
      <path className="millionaire-bank-passage" pathLength="1" d="M407 239v-35m-5 5 5-5 5 5" stroke="var(--story-text)" strokeWidth="1.8" />
      <path d="M307 82h26M83 274h13m448 0h13" opacity="0.35" />
    </g>
  );
}

const stonePositions = [
  { x: 275, y: 89, angle: -30 },
  { x: 320, y: 76, angle: 90 },
  { x: 365, y: 89, angle: 30 },
  { x: 392, y: 125, angle: 65 },
  { x: 392, y: 195, angle: -65 },
  { x: 365, y: 231, angle: -30 },
  { x: 320, y: 244, angle: 90 },
  { x: 275, y: 231, angle: 30 },
  { x: 248, y: 195, angle: 65 },
  { x: 248, y: 125, angle: -65 },
];

function Watch({ gleamId }: { gleamId: string }) {
  return (
    <g transform="rotate(-12 320 160)">
      <defs>
        <linearGradient id={gleamId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--story-text)" stopOpacity="0.06" />
          <stop offset="0.42" stopColor="var(--story-text)" stopOpacity="0.5" />
          <stop offset="0.52" stopColor="var(--story-text)" stopOpacity="0.12" />
          <stop offset="1" stopColor="var(--story-faint)" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path d="M291 8h58l7 52m-72 0 7-52m-7 252 7 52h58l7-52" opacity="0.65" />
      <path d="M289 25h62m-64 17h66m-66 236h66m-64 17h62" opacity="0.3" />
      <path d="M298 8v47m44-47v47m-44 210v47m44-47v47" strokeDasharray="1 5" opacity="0.3" />
      <path d="M278 64v-9h12m60 0h12v9M278 256v9h12m60 0h12v-9" opacity="0.6" />
      <circle cx="320" cy="160" r="100" opacity="0.4" />
      <circle cx="320" cy="160" r="95" opacity="0.55" />
      <circle cx="320" cy="160" r="68" stroke="var(--story-text)" opacity="0.8" />
      <circle cx="320" cy="160" r="62" opacity="0.25" />
      {Array.from({ length: 12 }, (_, index) => (
        <path key={index} d={index % 3 === 0 ? "M320 104v9" : "M320 104v4"} transform={`rotate(${index * 30} 320 160)`} opacity={index % 3 === 0 ? 0.8 : 0.4} />
      ))}
      <path d="M320 160v-35m0 35 27 15" stroke="var(--story-text)" />
      <g className="millionaire-watch-second" opacity="0.65">
        <path d="M320 171V109" stroke="var(--story-text)" strokeWidth="0.8" />
      </g>
      <circle cx="320" cy="160" r="2" fill="var(--story-text)" stroke="none" />
      <path d="M420 151h8v18h-8m4-15v12" opacity="0.65" />
      <path d="M273 132a55 55 0 0 1 56-25" stroke="var(--story-text)" opacity="0.15" />
      {stonePositions.map(({ x, y, angle }, index) => (
        <g key={index} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path
            d="M-4-15H4L9 0 4 15H-4L-9 0Z"
            fill={index === 3 ? "var(--story-bg)" : `url(#${gleamId})`}
            stroke={index === 3 ? "var(--story-text)" : "var(--story-faint)"}
            strokeWidth={index === 3 ? 1.8 : 1}
          />
          {index !== 3 && <path d="M-4-15 0-9 4-15M-9 0l9-9L9 0 0 9-9 0m5 15 4-6 4 6M0-9V9" opacity="0.7" strokeWidth="0.7" />}
          {index === 3 && (
            <>
              <path className="millionaire-empty-setting" d="M-3-11H3L6 0 3 11H-3L-6 0Z" fill="var(--story-text)" fillOpacity="0.12" strokeOpacity="0.35" />
              <path d="m-7-10 3 2m11-2-3 2m-11 18 3-2m11 2-3-2" stroke="var(--story-text)" strokeWidth="2.2" />
            </>
          )}
        </g>
      ))}
      <path className="millionaire-watch-glint" d="M274 85v12m-6-6h12" stroke="var(--story-text)" opacity="0.45" />
    </g>
  );
}

/**
 * Theme-aware line drawings at four narrative pauses in The Magic Millionaire.
 * Placement stays in MDX so an illustration follows the prose that earns it;
 * especially, the empty watch setting appears only after Grahan reveals the clue.
 */
export function MillionaireEffect({ type, height = "38vh", label }: MillionaireEffectProps) {
  const containerRef = useStoryScene(type);
  const gleamId = `millionaire-gleam-${useId().replace(/:/g, "")}`;

  return (
    <div
      ref={containerRef}
      className="story-effect-container millionaire-effect"
      style={{ height }}
      role="img"
      aria-label={label ?? labels[type]}
      data-active="false"
    >
      {/* A shared viewBox preserves geometry on narrow phones. The surrounding
          height can change without stretching stones, clock faces or bank columns. */}
      <svg viewBox="64 0 512 320" fill="none" stroke="var(--story-muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="millionaire-svg">
        {type === "rewind" && <Rewind />}
        {type === "fortune" && <Fortune />}
        {type === "bank" && <Bank />}
        {type === "watch" && <Watch gleamId={gleamId} />}
      </svg>
      <style>{`
        .millionaire-effect { min-height: 250px; max-height: 420px; }
        .millionaire-svg { display: block; width: 100%; height: 100%; }
        /* Every animated child uses this prefix, so the shared scene lifecycle
           can pause the whole drawing without running a per-frame JS loop. */
        .millionaire-effect svg [class^="millionaire-"] { animation-play-state: paused; }
        .millionaire-effect[data-active="true"] svg [class^="millionaire-"] { animation-play-state: running; }
        .millionaire-clock-minute, .millionaire-clock-hour, .millionaire-clock-echo {
          transform-origin: 320px 160px;
          animation: millionaire-rewind 18s linear infinite;
        }
        .millionaire-clock-hour { animation-duration: 72s; }
        .millionaire-clock-echo { animation-duration: 18s; animation-delay: -1.4s; }
        .millionaire-clock-orbit { animation: millionaire-breathe 5s ease-in-out infinite; }
        /* The chip contacts lead into a chart that draws once and stays visible.
           Its silent finish gives the reader room to follow Ranav's rise. */
        .millionaire-chips { animation: millionaire-chips 1.8s linear both; }
        .millionaire-market { animation: millionaire-market 1.8s linear both; }
        .millionaire-market-tip { animation: millionaire-tip 1.8s steps(1, end) both; }
        .millionaire-transfer { animation: millionaire-breathe 4.5s ease-in-out infinite; }
        .millionaire-bank-wait { animation: millionaire-wait 8s ease-in-out infinite; }
        .millionaire-bank-passage { animation: millionaire-passage 4s ease-in-out infinite; }
        /* The closing drawing settles with its scored phrase. Its single glint
           draws attention to the missing stone, then holds as the music recedes. */
        .millionaire-empty-setting { animation: millionaire-reveal 5.6s ease-in-out both; }
        .millionaire-watch-glint { animation: millionaire-glint 5.6s ease-in-out both; }
        /* The two contacts remain at .08s and .57s in a 5.6-second phrase. The
           five-second musical bed begins at .60s; these smaller percentage
           offsets preserve the physical tick timing while that ending unfolds.
           useStoryScene resets both timelines together on an audible entrance. */
        .millionaire-watch-second {
          transform-origin: 320px 160px;
          animation: millionaire-watch-tick 5.6s steps(1, end) both;
        }
        @keyframes millionaire-rewind { to { transform: rotate(-360deg); } }
        @keyframes millionaire-breathe { 0%, 100% { opacity: .35; } 50% { opacity: .75; } }
        @keyframes millionaire-chips { 0%, 41.6667% { opacity: 1; } 88.8889%, 100% { opacity: .65; } }
        @keyframes millionaire-market { 0%, 41.6667% { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .4; } 88.8889%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .9; } }
        @keyframes millionaire-tip { 0% { opacity: 0; } 88.8889%, 100% { opacity: .85; } }
        @keyframes millionaire-watch-tick { 0% { transform: rotate(20deg); } 1.4286% { transform: rotate(26deg); } 10.1786%, 100% { transform: rotate(32deg); } }
        @keyframes millionaire-wait { 0%, 100% { opacity: .65; } 50% { opacity: .9; } }
        @keyframes millionaire-passage { 0%, 10% { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .3; } 60%, 85% { stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .8; } 100% { stroke-dasharray: 1; stroke-dashoffset: 0; opacity: .3; } }
        @keyframes millionaire-reveal { 0% { opacity: .35; } 25% { opacity: .6; } 78% { opacity: .8; } 100% { opacity: .5; } }
        @keyframes millionaire-glint { 0%, 11%, 100% { opacity: .1; } 28% { opacity: .45; } 73% { opacity: .85; } 91% { opacity: .25; } }
        @media (prefers-reduced-motion: reduce) {
          /* Retain the complete drawing, including the clue, as a static image. */
          .story-effect-container.millionaire-effect { display: block; }
          .millionaire-effect svg [class^="millionaire-"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
