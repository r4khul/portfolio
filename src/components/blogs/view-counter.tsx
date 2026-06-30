"use client";

import { useEffect, useState } from "react";

type ViewCounterProps = {
  slug: string;
  trackView?: boolean;
  variant?: "chip" | "inline";
  showIcon?: boolean;
};

export function ViewCounter({ slug, trackView = false, variant = "inline", showIcon = true }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch(`/api/views/${slug}`, {
          method: trackView ? "POST" : "GET",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.views === "number") {
          setViews(data.views);
        }
      } catch (err) {
        console.error("Failed to fetch views", err);
      }
    };

    fetchViews();
  }, [slug, trackView]);

  if (views === null) return null;

  if (variant === "chip") {
    return (
      <div className="tactile inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-muted select-none">
        {showIcon && <span className="text-[11px] leading-none">👀</span>}
        <span>
          {views.toLocaleString()} views
        </span>
      </div>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[14px] leading-none">👀</span>
      {views.toLocaleString()} views
    </span>
  );
}
