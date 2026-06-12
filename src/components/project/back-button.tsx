"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAudioFeedback } from "@/lib/hooks/use-audio-feedback";

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  const { playClick } = useAudioFeedback();

  return (
    <Link
      href={href}
      onClick={playClick}
      className="group inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />{" "}
      all projects
    </Link>
  );
}
