"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, GitPullRequest } from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa6";
import { openSource } from "@/data/profile";
import { BentoCard } from "./bento-grid";

export function OssShowcaseCard({ className }: { className?: string }) {
  const ossItems = openSource.slice(0, 3);
  
  const storeLinks: Record<string, { play?: string; apple?: string }> = {
    "ente-io/ente": {
      play: "https://play.google.com/store/apps/details?id=io.ente.photos",
      apple: "https://apps.apple.com/us/app/ente-photos/id1542026904",
    },
    "lichess-org/mobile": {
      play: "https://play.google.com/store/apps/details?id=org.lichess.mobileV2&hl=en",
      apple: "https://apps.apple.com/in/app/lichess/id1662361230",
    },
    "traccar/traccar-client": {
      play: "https://play.google.com/store/apps/details?id=org.traccar.client&hl=en_IN",
      apple: "https://apps.apple.com/in/app/traccar-client/id843156974",
    },
  };

  return (
    <BentoCard className={`tactile p-6 flex flex-col justify-between w-full col-span-1 lg:col-span-3 lg:col-start-1 ${className || ""}`}>
      <div className="flex items-center gap-2 mb-6 border-b border-edge/50 pb-4">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
          Open Source Contributions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {ossItems.map((item) => {
          const repoOwner = item.repo.split('/')[0];
          const avatarUrl = `https://github.com/${repoOwner}.png`;
          const links = storeLinks[item.repo];

          return (
            <div key={item.slug} className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative size-10 overflow-hidden rounded-md border border-edge bg-surface shrink-0 shadow-sm">
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
                    {item.stats.contributions} Contributions
                  </p>
                </div>
              </div>

              {/* Unified Action Button */}
              <div className="mt-auto pt-4 flex gap-2">
                <UnifiedPRDropdown prs={item.prs} repoName={item.repo} />
                
                {links?.play && (
                  <Link
                    href={links.play}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-edge text-muted transition-all hover:bg-foreground hover:text-background hover:scale-105 active:scale-95"
                    aria-label={`${repoOwner} on Play Store`}
                  >
                    <FaGooglePlay className="size-4" />
                  </Link>
                )}
                {links?.apple && (
                  <Link
                    href={links.apple}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-edge text-muted transition-all hover:bg-foreground hover:text-background hover:scale-105 active:scale-95"
                    aria-label={`${repoOwner} on App Store`}
                  >
                    <FaApple className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
}

function UnifiedPRDropdown({ prs, repoName }: { prs: any[], repoName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-full items-center justify-between rounded-lg bg-surface border border-edge px-4 text-[12px] font-semibold transition-all hover:bg-edge hover:text-foreground active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <GitPullRequest className="size-3.5" />
          View Contributions
        </div>
        <ChevronDown className={`size-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-full left-0 w-[300px] mb-2 p-2 rounded-xl bg-surface/95 backdrop-blur-md border border-edge-strong shadow-2xl z-50 flex flex-col gap-1 max-h-[250px] overflow-y-auto custom-scrollbar"
          >
            <div className="px-3 py-2 text-[10px] font-mono text-faint uppercase tracking-widest border-b border-edge/50 mb-1">
              Merged PRs ({repoName})
            </div>
            {prs.map((pr, idx) => (
              <a
                key={idx}
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-2 rounded-md hover:bg-edge/50 transition-colors"
              >
                <span className="text-[12px] text-foreground font-medium line-clamp-1">{pr.title}</span>
                <span className="text-[10px] text-muted line-clamp-1 mt-0.5">{pr.fullTitle}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
