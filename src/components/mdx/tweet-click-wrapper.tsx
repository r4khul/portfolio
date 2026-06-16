"use client";

import { ReactNode } from "react";

export function TweetClickWrapper({ id, children }: { id: string; children: ReactNode }) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't intercept clicks on:
    // 1. Anchor links (which lead to specific pages/profiles/actions)
    // 2. The copy link button (which copies the URL to clipboard)
    if (target.closest("a") || target.closest("button[aria-label='Copy link']")) {
      return;
    }
    const url = `https://x.com/i/web/status/${id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      onClick={handleClick}
      className="w-full max-w-[550px] cursor-pointer group transition-all duration-200 active:scale-[0.99] hover:opacity-[0.98] [&_.react-tweet-theme]:transition-colors [&_.react-tweet-theme]:duration-200 group-hover:[&_.react-tweet-theme]:[--tweet-border:1px_solid_var(--tweet-color-blue-primary)]"
    >
      {children}
    </div>
  );
}
