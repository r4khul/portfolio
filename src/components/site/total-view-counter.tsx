"use client";

import { useEffect, useState } from "react";

export function TotalViewCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch("/api/views");
        const data = await res.json();
        if (typeof data.views === "number") {
          setViews(data.views);
        }
      } catch (err) {
        console.error("Failed to fetch total views", err);
      }
    };

    fetchViews();
  }, []);

  if (views === null) return null;

  return (
    <span className="font-mono text-[11px] text-accent">
      #{views.toLocaleString()} viewers
    </span>
  );
}
