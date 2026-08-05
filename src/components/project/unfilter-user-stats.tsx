"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

interface DemographySegment {
  id: "non-indian" | "indian";
  label: string;
  sublabel: string;
  percentage: number;
  userCount: string;
  regions: string[];
  color: {
    solid: string;
    badgeBg: string;
    badgeText: string;
    border: string;
  };
  description: string;
}

const SEGMENTS: DemographySegment[] = [
  {
    id: "non-indian",
    label: "Global / International",
    sublabel: "Non-Indian Userbase",
    percentage: 80,
    userCount: "160+",
    regions: ["Indonesia", "US", "UK", "Germany", "Turkey"],
    color: {
      solid: "#38bdf8",
      badgeBg: "bg-sky-500/10 dark:bg-sky-400/10",
      badgeText: "text-sky-600 dark:text-sky-400",
      border: "border-sky-500/30 dark:border-sky-400/30",
    },
    description: "International adoption driven by privacy-conscious Android power users and offline package inspection.",
  },
  {
    id: "indian",
    label: "Domestic / India",
    sublabel: "Indian Userbase",
    percentage: 20,
    userCount: "40+",
    regions: ["India Dev Community", "Android Hobbyists"],
    color: {
      solid: "#f59e0b",
      badgeBg: "bg-amber-500/10 dark:bg-amber-400/10",
      badgeText: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30 dark:border-amber-400/30",
    },
    description: "Early adopters, Flutter developers, and open-source tech stack analysis enthusiasts.",
  },
];

export function UnfilterUserStats() {
  const [activeSegment, setActiveSegment] = useState<DemographySegment | null>(null);

  // Bigger SVG Donut calculations
  const size = 172;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Gap between slices in SVG stroke units
  const gapAngle = 4; // degrees
  const gapLength = (gapAngle / 360) * circumference;

  const nonIndianPct = 0.8;
  const indianPct = 0.2;

  const nonIndianLength = Math.max(0, circumference * nonIndianPct - gapLength);
  const indianLength = Math.max(0, circumference * indianPct - gapLength);

  const nonIndianOffset = 0;
  const indianOffset = -(circumference * nonIndianPct);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-edge bg-surface/50 p-4 sm:p-6">
      <div className="grid items-center gap-6 sm:grid-cols-12">
        {/* Left: Enlarged Donut Chart with Plain Accent Colors */}
        <div className="flex flex-col items-center justify-center sm:col-span-5 md:col-span-4">
          <div className="relative flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90 transform"
            >
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--edge)"
                strokeWidth={strokeWidth}
              />

              {/* Non-Indian Arc (80%) - Solid Blue Color */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={SEGMENTS[0].color.solid}
                strokeWidth={activeSegment?.id === "non-indian" ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${nonIndianLength} ${circumference - nonIndianLength}`}
                strokeDashoffset={nonIndianOffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setActiveSegment(SEGMENTS[0])}
                onMouseLeave={() => setActiveSegment(null)}
              />

              {/* Indian Arc (20%) - Solid Orange Color */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={SEGMENTS[1].color.solid}
                strokeWidth={activeSegment?.id === "indian" ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${indianLength} ${circumference - indianLength}`}
                strokeDashoffset={indianOffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setActiveSegment(SEGMENTS[1])}
                onMouseLeave={() => setActiveSegment(null)}
              />
            </svg>

            {/* Center Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {activeSegment ? (
                <div className="flex flex-col items-center animate-in fade-in duration-150">
                  <span
                    className={`font-mono text-2xl font-bold tracking-tight ${activeSegment.color.badgeText}`}
                  >
                    {activeSegment.percentage}%
                  </span>
                  <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                    {activeSegment.userCount} users
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    200+
                  </span>
                  <span className="font-mono text-[10px] text-faint uppercase tracking-wider">
                    Active Users
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Compact Demography Cards */}
        <div className="grid gap-3 sm:col-span-7 md:col-span-8">
          {SEGMENTS.map((seg) => {
            const isHovered = activeSegment?.id === seg.id;
            return (
              <div
                key={seg.id}
                onMouseEnter={() => setActiveSegment(seg)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`relative rounded-lg border p-3.5 transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? `${seg.color.border} bg-surface shadow-xs`
                    : "border-edge bg-background/60 hover:border-edge-strong"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-serif text-base font-medium text-foreground">
                        {seg.label}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted">
                        <span>{seg.sublabel}</span>
                        <span>·</span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold ${seg.color.badgeBg} ${seg.color.badgeText}`}
                        >
                          {seg.userCount} users
                        </span>
                      </div>
                    </div>

                  <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                    {seg.percentage}%
                  </span>
                </div>

                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  {seg.description}
                </p>

                {/* Region tags */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {seg.regions.map((region) => (
                    <span
                      key={region}
                      className="inline-flex items-center gap-1 rounded border border-edge bg-surface px-1.5 py-0.5 font-mono text-[10px] text-faint"
                    >
                      <MapPin className="size-2.5 text-accent" />
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
