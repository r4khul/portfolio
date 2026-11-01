"use client";

import { useStoryScene } from "@/lib/hooks/use-story-scene";

type GreedyEffectType = "roadside" | "surveillance" | "opportunity";

interface GreedyEffectProps {
  type: GreedyEffectType;
  height?: string;
  label?: string;
}

const labels: Record<GreedyEffectType, string> = {
  roadside: "On a north–south road seen from above, a capped officer, patrol car and small food stall stand to the west. A luxury car approaches northward on the east side and stops beside a woman with a shoulder bag.",
  surveillance: "Three remembered positions of a clock hand gather on a single dial as arrival times fall into a pattern.",
  opportunity: "An employee identification card, its anonymous portrait and details gradually drawing attention.",
};

function Roadside() {
  return (
    <g>
      {/* North is up throughout this overhead composition. The officer, parked
          patrol car and stall occupy the west shoulder; the woman waits beyond
          the east curb. The road between them runs north–south, so the luxury
          car's driver's side meets her curb without changing the viewpoint. */}
      <path d="M272 35v256M400 35v256" opacity="0.25" />
      <path d="M336 49v18m0 18v18m0 18v18m0 18v18m0 18v18m0 18v18m0 18v18" opacity="0.2" />

      {/* Small head-and-shoulder forms read as people from directly above. Their
          orientation puts her toward the approaching car and him toward the east
          curb, while preserving enough empty space around both to remain clear
          on a narrow phone. Neither is a front-facing figure or portrait. */}
      <g transform="translate(426 130) rotate(-90)" stroke="var(--story-text)" opacity="0.65">
        <ellipse cy="3" rx="8" ry="4.5" fill="var(--story-muted)" fillOpacity="0.12" />
        {/* The shoulder strap and small bag distinguish the waiting woman from
            the officer using the same restrained overhead drawing language. */}
        <path d="M-3 0q6 5 13 6" strokeWidth="0.9" opacity="0.7" />
        <rect x="9" y="3" width="7" height="9" rx="1.5" fill="var(--story-bg)" />
        <circle cy="-1" r="4.5" fill="var(--story-bg)" />
      </g>
      <g transform="translate(244 161) rotate(80)" stroke="var(--story-text)" opacity="0.75">
        <ellipse cy="3" rx="10" ry="5" fill="var(--story-muted)" fillOpacity="0.12" />
        <circle cy="-1.5" r="5" fill="var(--story-bg)" />
        {/* A short forward brim is visible even at phone scale; no rank, face,
            name or text label is needed to distinguish the capped observer. */}
        <path d="M-5-4q5-3 10 0l1-3q-6-5-12 0Z" fill="var(--story-bg)" />
        <path d="M-3-4h6" opacity="0.35" />
      </g>

      <g transform="translate(368 156)">
        {/* Four inset tyres, narrow mirrors and separate roof/glass planes make
            this a carefully proportioned vehicle rather than a generic pill.
            The moving inner group preserves its final position in reduced motion.
            A 1.1 scale keeps its 111px body length close to the patrol car's
            110px footprint. The opaque glass contains no driver silhouette.
            Its bonnet faces north; the right-side window is toward the east curb. */}
        <g className="greedy-car-body">
          <g transform="rotate(-90) scale(1.1)">
            <path d="M-36-22h15v5h-15Zm61 0h15v5H25ZM-36 17h15v5h-15Zm61 0h15v5H25Z" fill="var(--story-muted)" fillOpacity="0.45" stroke="none" />
            <path d="M-49-12q1-7 9-8h70q19 1 22 10v20q-3 9-22 10h-70q-8-1-9-8Z" fill="var(--story-bg)" stroke="var(--story-text)" opacity="0.85" />
            <path d="m-30-13 12-2h36l13 4v22l-13 4h-36l-12-2Z" opacity="0.55" />
            <path d="m18-15 13 4v22l-13 4 4-15Zm-36 0-12 2v26l12 2-4-15Z" fill="var(--story-muted)" fillOpacity="0.12" opacity="0.7" />
            <path d="M-16-10h31v20h-31Zm50-4 10 3m-10 25 10-3m-77-24h-9m9 26h-9m23-31h31m-31 36h31" opacity="0.25" />
            <path d="M10-20v-3h8l2 3M10 20v3h8l2-3m-7-12 3 6m-3-22 3-6" opacity="0.65" />
            <path d="M47-12v5m0 14v5M-45-13v6m0 14v6" stroke="var(--story-text)" opacity="0.65" />
          </g>
        </g>
      </g>

      {/* The parked car is deliberately shorter and squarer. A transverse roof
          light bar distinguishes patrol transport at a glance without adding a
          wordmark or another moving element to the tableau. Only the small roof
          cells use the story's red accent; they remain steadily lit. */}
      <g transform="translate(213 235) rotate(-90)" opacity="0.75">
        <path d="M-39-23h15v5h-15Zm64 0h14v5H25ZM-39 18h15v5h-15Zm64 0h14v5H25Z" fill="var(--story-muted)" fillOpacity="0.4" stroke="none" />
        <path d="M-53-13q0-7 8-8h77l20 7 5 9v10l-5 9-20 7h-77q-8-1-8-8Z" fill="var(--story-bg)" stroke="var(--story-text)" />
        <path d="M-34-14h57l10 5V9l-10 5h-57Zm15 0-6 14 6 14m36-28 7 14-7 14" opacity="0.45" />
        <path d="M-34-14v28m67-23v18m-9-22h19m-19 36h19m-90-31v6m0 13v6m96-27v5m0 17v5" opacity="0.35" />
        <rect x="-4" y="-13" width="8" height="26" rx="1.3" fill="var(--story-bg)" stroke="var(--story-text)" opacity="0.85" />
        <path d="M-2-11H2v7H-2Zm0 15H2v7H-2Z" fill="var(--story-accent)" fillOpacity="0.85" stroke="none" />
        <path d="M-4 0h8m14-21v-3h8l2 3m-10 42v3h8l2-3" opacity="0.5" />
      </g>

      {/* The stall is only a small overhead worktop beside the observer. A single
          canopy edge, cooking ring and tray locate the food stop without adding
          another shop scene, attendant, sign or decorative street furniture. */}
      <g opacity="0.45">
        <rect x="139" y="123" width="78" height="30" rx="1" fill="var(--story-bg)" />
        <path d="M139 133h78" />
        <path d="M143 127h70" opacity="0.2" />
        <circle cx="154" cy="143" r="4" opacity="0.65" />
        <rect x="191" y="139" width="15" height="8" rx="1" opacity="0.6" />
      </g>
    </g>
  );
}

function Surveillance() {
  return (
    <g>
      {/* One recognizable dial holds a comparison made entirely in memory. The
          faint hand positions belong to different remembered evenings; they do
          not rotate, rewind or imply a notebook, recorded log or physical clue. */}
      <circle cx="320" cy="160" r="83" opacity="0.13" />
      <circle cx="320" cy="160" r="78" opacity="0.5" />
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d={index % 3 === 0 ? "M320 91v7" : "M320 91v3"}
          transform={`rotate(${index * 30} 320 160)`}
          opacity={index % 3 === 0 ? 0.55 : 0.25}
        />
      ))}
      <path className="greedy-route-one" pathLength="1" d="M320 160l-34-39" opacity="0.2" />
      <path className="greedy-route-two" pathLength="1" d="M320 160V108" opacity="0.35" />
      <path className="greedy-route-three" pathLength="1" d="M320 160l34-39" stroke="var(--story-text)" opacity="0.7" />
      <path className="greedy-route-link" pathLength="1" d="M320 160l-24 13" stroke="var(--story-text)" strokeWidth="1.6" opacity="0.7" />
      <circle cx="320" cy="160" r="2.5" fill="var(--story-text)" stroke="none" opacity="0.75" />
    </g>
  );
}

function Opportunity() {
  return (
    <g transform="rotate(3 320 166)">
      {/* The employee card is an isolated recognition anchor. A featureless
          silhouette and restrained text bars suggest an ID without inventing
          a company, personal details or a literal likeness of the missing woman. */}
      <rect x="202" y="89" width="236" height="154" rx="6" fill="var(--story-bg)" opacity="0.8" />
      <rect x="207" y="94" width="226" height="144" rx="3" opacity="0.15" />
      <rect x="306" y="99" width="28" height="5" rx="2.5" opacity="0.4" />
      <path d="M218 118h204" opacity="0.18" />
      <rect x="220" y="134" width="62" height="79" rx="2" opacity="0.35" />
      <g className="greedy-id-photo" fill="var(--story-muted)" stroke="none">
        <circle cx="251" cy="157" r="9" />
        <path d="M234 197v-7c0-11 7-18 17-18s17 7 17 18v7Z" />
      </g>
      <path d="M300 139h92" stroke="var(--story-text)" opacity="0.55" strokeWidth="2" />
      <path d="M300 153h67m-67 12h84M300 200h45m-45 8h29" opacity="0.28" />
      <path d="M220 226h32m8 0h14m113 0h34" opacity="0.17" />
      <rect x="400" y="196" width="18" height="18" rx="2" opacity="0.18" />
      <path d="m403 206 7-7m-7 11 11-11m-7 12 8-8" opacity="0.12" />
      <path className="greedy-id-recognition" pathLength="1" d="M215 143v-13h13m59 74v13h-13" stroke="var(--story-text)" opacity="0.65" />
      <path className="greedy-id-link" pathLength="1" d="M300 181h92" stroke="var(--story-text)" opacity="0.65" />
    </g>
  );
}

/**
 * Three spare, recognizable objects at the chapter's turning points. Each makes
 * one quiet phrase and holds, leaving the prose to supply the people and action.
 * The existing hook starts motion with decoded audio and owns visibility, mute
 * and reduced-motion cleanup; this component adds no timers or playback controls.
 */
export function GreedyEffect({ type, height = "38vh", label }: GreedyEffectProps) {
  const containerRef = useStoryScene(type);

  return (
    <div
      ref={containerRef}
      className="story-effect-container greedy-effect"
      style={{ height }}
      role="img"
      aria-label={label ?? labels[type]}
      data-active="false"
    >
      {/* The encounter uses a closer crop so both overhead positions and the car
          detailing remain readable on phones. The isolated clock and ID keep
          their original breathing room. Non-scaling strokes preserve the fine
          construction without stretching geometry at any screen proportion. */}
      <svg viewBox={type === "roadside" ? "100 15 440 300" : "0 0 640 320"} fill="none" stroke="var(--story-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="greedy-svg">
        {type === "roadside" && <Roadside />}
        {type === "surveillance" && <Surveillance />}
        {type === "opportunity" && <Opportunity />}
      </svg>
      <style>{`
        .greedy-effect { min-height: 220px; max-height: 380px; }
        .greedy-svg { display: block; width: 100%; height: 100%; }
        .greedy-svg path, .greedy-svg circle, .greedy-svg ellipse, .greedy-svg rect { vector-effect: non-scaling-stroke; }
        /* One visibility clock drives all motion. Finished geometry stays put,
           so a reader lingering over a paragraph never receives another pulse. */
        .greedy-effect svg [class^="greedy-"] { animation-play-state: paused; }
        .greedy-effect[data-active="true"] svg [class^="greedy-"] { animation-play-state: running; }

        /* The engine arrives .55–1.80s from the south, moving upward/northward
           along the east lane. Only the luxury car's inner group moves; the
           observer and both curbside positions stay fixed. The car stops beside
           her with the curb still between them, then holds as the six-second
           atmosphere recedes. Reduced motion retains that final position. */
        .greedy-car-body { animation: greedy-car-arrive 6s linear both; }

        /* Three remembered hand positions gather at .45–.69, 1.65–1.94 and
           2.85–3.06s with the muted instrumental notes. A final short hand settles
           at 3.75–4.20s. These are mental comparisons of arrival times, not ticking
           clock mechanics; the exact intervals share the authored audio clock. */
        .greedy-route-one { animation: greedy-route-one 5s linear both; }
        .greedy-route-two { animation: greedy-route-two 5s linear both; }
        .greedy-route-three { animation: greedy-route-three 5s linear both; }
        .greedy-route-link { animation: greedy-route-link 5s linear both; }

        /* Recognition changes emphasis on the score's .40, 1.70 and 3.30s notes.
           A quiet portrait gains weight, two framing corners appear, and one
           final line settles beneath the details. No flash or looping shimmer
           competes with the ending; the card holds while the music fades. */
        .greedy-id-photo { animation: greedy-id-photo 5s ease-in-out both; }
        .greedy-id-recognition { animation: greedy-id-recognition 5s linear both; }
        .greedy-id-link { animation: greedy-id-link 5s linear both; }

        @keyframes greedy-car-arrive { 0%, 9.1667% { transform: translateY(95px); } 30%, 100% { transform: translateY(0); } }
        @keyframes greedy-route-one { 0%, 9% { stroke-dasharray: 1; stroke-dashoffset: 1; } 13.8%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; } }
        @keyframes greedy-route-two { 0%, 33% { stroke-dasharray: 1; stroke-dashoffset: 1; } 38.8%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; } }
        @keyframes greedy-route-three { 0%, 57% { stroke-dasharray: 1; stroke-dashoffset: 1; } 61.2%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; } }
        @keyframes greedy-route-link { 0%, 75% { stroke-dasharray: 1; stroke-dashoffset: 1; } 84%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; } }
        @keyframes greedy-id-photo { 0%, 8% { opacity: .12; } 34% { opacity: .3; } 66%, 100% { opacity: .42; } }
        @keyframes greedy-id-recognition { 0%, 34% { stroke-dasharray: 1; stroke-dashoffset: 1; } 66%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; } }
        @keyframes greedy-id-link { 0%, 66% { stroke-dasharray: 1; stroke-dashoffset: 1; } 84%, 100% { stroke-dasharray: 1; stroke-dashoffset: 0; } }

        /* Complete static objects remain useful when motion is disabled. The
           shared hook also suppresses scene audio for this reader preference. */
        @media (prefers-reduced-motion: reduce) {
          .story-effect-container.greedy-effect { display: block; }
          .greedy-effect svg [class^="greedy-"] { animation: none !important; }
          .greedy-id-photo { opacity: .42; }
        }
      `}</style>
    </div>
  );
}
