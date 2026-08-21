"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GitPullRequest, Pause, Play } from "lucide-react";
import { FaGithub, FaGooglePlay } from "react-icons/fa6";
import { BentoCard } from "./bento-grid";
import { ossSpotlights } from "@/data/proof-of-work-oss";

const storeLinks: Record<string, string> = {
  "ente-io/ente": "https://play.google.com/store/apps/details?id=io.ente.photos",
  "lichess-org/mobile": "https://play.google.com/store/apps/details?id=org.lichess.mobileV2",
  "traccar/traccar-client": "https://play.google.com/store/apps/details?id=org.traccar.client",
};

export function OssSpotlight() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const item = ossSpotlights[index];

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % ossSpotlights.length), 6500);
    return () => window.clearInterval(id);
  }, [paused]);

  return <BentoCard className="relative p-5 md:p-6 lg:col-span-4 lg:min-h-0 lg:p-5" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-faint">Open-source spotlight</span><button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume spotlight" : "Pause spotlight"} className="rounded-full border border-edge p-1.5 text-faint hover:bg-edge">{paused ? <Play className="size-3" /> : <Pause className="size-3" />}</button></div>
    <div className="mt-4 flex flex-1 flex-col" aria-live="polite"><div className="flex items-center gap-3"><div className="relative size-10 overflow-hidden rounded-xl border border-edge bg-background"><Image src={`https://github.com/${item.repo.split("/")[0]}.png`} alt="" fill sizes="40px" className="object-cover" /></div><div><h2 className="font-serif text-xl tracking-tight">{item.repo.split("/")[0]}</h2><p className="font-mono text-[10px] text-muted">{item.stats.users} users · {item.stats.stars} stars</p></div><Link href={item.repoUrl} target="_blank" rel="noopener noreferrer" aria-label="Open repository" className="ml-auto rounded-lg border border-edge p-2 text-muted hover:bg-edge"><FaGithub className="size-3.5" /></Link></div><div className="mt-3 rounded-xl border border-edge bg-background/50 p-2.5"><div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-accent"><GitPullRequest className="size-3" /> {item.stats.contributions} contributions</div><Link href={item.prs[0].url} target="_blank" rel="noopener noreferrer" className="mt-1.5 block line-clamp-1 text-xs font-semibold hover:underline">{item.prs[0].fullTitle}</Link></div></div><div className="mt-3 flex items-center justify-between border-t border-edge pt-3"><div className="flex gap-1.5">{ossSpotlights.map((spotlight, idx) => <button type="button" key={spotlight.slug} onClick={() => setIndex(idx)} aria-label={`Show ${spotlight.repo}`} className={`h-1.5 rounded-full transition-all ${idx === index ? "w-6 bg-accent" : "w-1.5 bg-edge-strong"}`} />)}</div><div className="flex items-center gap-2"><span className="font-mono text-[9px] text-faint">{index + 1} / {ossSpotlights.length}</span>{storeLinks[item.repo] && <Link href={storeLinks[item.repo]} target="_blank" rel="noopener noreferrer" aria-label="Open app store listing" className="flex size-7 items-center justify-center rounded-md border border-edge text-muted hover:bg-edge"><FaGooglePlay className="size-3" /></Link>}</div></div>
  </BentoCard>;
}
