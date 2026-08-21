import Image from "next/image";
import { Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { profile } from "@/data/profile";
import { BentoCard } from "./bento-grid";
import { GitHubContributionGraph } from "@/components/home/github-graph";

interface ProfileCenterCardProps {
  className?: string;
}

export function ProfileCenterCard({ className }: ProfileCenterCardProps) {
  return (
    <BentoCard className={`tactile flex flex-col justify-between items-center text-center p-8 md:p-10 ${className || ""}`}>
      
      {/* Top section: Massive Identity */}
      <div className="flex flex-col items-center w-full mt-4">
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none text-foreground mb-4">
          {profile.name}
        </h1>
        
        <p className="font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-faint mb-8">
          Proof of Work
        </p>

        <div className="relative size-24 md:size-32 rounded-full overflow-hidden border border-edge-strong shadow-lg mb-8">
          <Image 
            src="/images/site/pfp.png"
            alt={profile.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 96px, 128px"
            priority
          />
        </div>
      </div>

      {/* GitHub Graph Area */}
      <div className="w-full flex justify-center mb-6">
        <div className="relative border border-edge bg-background/30 rounded-xl overflow-hidden [&>div]:mt-0 [&>div]:border-none [&>div>div]:bg-transparent scale-90 md:scale-100 origin-center">
          <GitHubContributionGraph />
        </div>
      </div>

      <div className="mt-auto flex justify-center gap-4 w-full">
        <a
          href="https://github.com/r4khul"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-edge text-muted transition-all hover:bg-foreground hover:text-background hover:scale-110 active:scale-95"
          aria-label="GitHub"
        >
          <FaGithub className="size-4" />
        </a>
        <a
          href="https://linkedin.com/in/rakhul"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-edge text-muted transition-all hover:bg-foreground hover:text-background hover:scale-110 active:scale-95"
          aria-label="LinkedIn"
        >
          <FaLinkedin className="size-4" />
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-edge text-muted transition-all hover:bg-foreground hover:text-background hover:scale-110 active:scale-95"
          aria-label="Email"
        >
          <Mail className="size-4" />
        </a>
      </div>
    </BentoCard>
  );
}
