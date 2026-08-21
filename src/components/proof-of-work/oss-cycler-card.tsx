"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GitMerge } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { openSource } from "@/data/profile";
import { BentoCard } from "./bento-grid";

interface OssCyclerCardProps {
  className?: string;
}

export function OssCyclerCard({ className }: OssCyclerCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const ossItems = openSource.slice(0, 3); // Show top 3: Ente, Traccar, Lichess

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ossItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, ossItems.length]);

  if (ossItems.length === 0) return null;

  const currentItem = ossItems[currentIndex];
  const repoOwner = currentItem.repo.split('/')[0];
  const avatarUrl = `https://github.com/${repoOwner}.png`;

  return (
    <BentoCard 
      className={`tactile p-6 flex flex-col justify-between ${className || ""}`}
      style={{
        // Ensure child elements can't trigger mouse leave prematurely 
        pointerEvents: 'auto' 
      }}
    >
      <div 
        className="absolute inset-0 z-10" 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">
              Open Source
            </span>
          </div>
          <div className="flex gap-1 z-20">
            {ossItems.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-4 bg-foreground" : "w-1.5 bg-edge-strong"}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-20 min-h-[140px] animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" key={currentItem.slug}>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative size-10 overflow-hidden rounded-md border border-edge bg-surface">
              <Image 
                src={avatarUrl}
                alt={repoOwner}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight tracking-tight">
                {repoOwner}
              </h3>
              <p className="font-mono text-[11px] text-muted">
                {currentItem.stats.stars} ★ · {currentItem.stats.users} Users
              </p>
            </div>
          </div>
          
          <p className="text-[13px] text-muted leading-relaxed line-clamp-3">
            {currentItem.context}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded bg-surface border border-edge px-2 py-1 text-[11px] font-medium text-foreground">
            <GitMerge className="size-3 text-accent" />
            {currentItem.stats.contributions} Merged PRs
          </div>
        </div>
      </div>

      <Link
        href={currentItem.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-20 mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-edge bg-surface py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-edge"
        onMouseEnter={() => setIsPaused(true)}
      >
        <FaGithub className="size-3.5" />
        View Repository
        <ArrowUpRight className="size-3.5 text-faint" />
      </Link>
    </BentoCard>
  );
}
