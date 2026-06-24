"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { playClick } = useAudioFeedback();

  const handleShare = async () => {
    playClick();
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="tactile inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[12.5px] font-medium group text-muted hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-accent" />
          <span className="text-accent font-sans">Copied Link</span>
        </>
      ) : (
        <>
          <Share2 className="size-3.5 text-muted transition-colors group-hover:text-foreground" />
          <span className="font-sans">Share Post</span>
        </>
      )}
    </button>
  );
}
