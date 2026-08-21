import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Download, Mail } from "lucide-react";
import { FaGithub, FaGooglePlay, FaLinkedin } from "react-icons/fa6";
import { BentoCard } from "./bento-grid";
import { OssSpotlight } from "./oss-spotlight";
import { GitHubContributionGraph } from "@/components/home/github-graph";
import { proofMetrics, proofProjects, proofProfile } from "@/data/proof-of-work";

export function ProofDashboard() {
  const { unfilter, mrcas, thrifty } = proofProjects;
  return (
    <main className="min-h-svh bg-background px-3 py-3 text-foreground sm:px-5 sm:py-5 lg:h-svh lg:overflow-hidden lg:px-6 lg:py-4 xl:px-8">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-[1540px] flex-col gap-3 lg:h-full lg:min-h-0 lg:gap-3">
        <ProofToolbar />
        <div className="grid flex-1 auto-rows-[minmax(150px,auto)] grid-cols-1 gap-3 md:grid-cols-2 lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[1.22fr_.78fr_.72fr] lg:gap-3">
          <HeroCard />
          <FeaturedCard project={unfilter} />
          <ImpactCard />
          <OssSpotlight />
          <GithubCard />
          <CompactProductCard project={mrcas} kind="client" />
          <CompactProductCard project={thrifty} kind="engineering" />
        </div>
        <ContactStrip />
      </div>
    </main>
  );
}

function ProofToolbar() {
  return <header className="shrink-0 flex items-center justify-between rounded-2xl border border-edge bg-surface/70 px-4 py-2.5 backdrop-blur sm:px-5">
    <div className="flex items-center gap-3"><span className="font-mono text-xs font-bold tracking-tight">r4khul</span><span className="hidden h-4 w-px bg-edge-strong sm:block" /><span className="hidden font-mono text-[10px] uppercase tracking-[.2em] text-faint sm:block">Proof of work / 2026</span></div>
    <div className="flex items-center gap-2"><span className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-500"><i className="size-1.5 rounded-full bg-emerald-500" /> Open to work</span><Link href={proofProfile.resume} className="hidden items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-transform hover:-translate-y-px sm:flex"><Download className="size-3.5" /> Resume</Link></div>
  </header>;
}

function HeroCard() {
  return <BentoCard className="p-5 md:p-6 lg:col-span-3 lg:row-span-2 lg:min-h-0 lg:p-6">
    <div className="flex items-start justify-between"><div className="relative size-16 overflow-hidden rounded-2xl border border-edge-strong sm:size-20"><Image src="/images/site/pfp.png" alt={proofProfile.name} fill priority sizes="80px" className="object-cover" /></div><span className="rounded-full border border-edge px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-faint">Available · IST</span></div>
    <div className="mt-5 lg:mt-6"><p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[.25em] text-accent">Mobile engineer / Flutter</p><h1 className="max-w-[12ch] font-serif text-4xl leading-[.95] tracking-tight sm:text-5xl lg:text-[2.7rem]">{proofProfile.name}</h1><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">I build reliable mobile products that survive real users, bad networks, and production edge cases.</p></div>
    <div className="mt-auto flex flex-wrap gap-1.5 pt-5"><Pill>Flutter</Pill><Pill>Android</Pill><Pill>iOS</Pill><Pill>Production systems</Pill></div>
    <div className="mt-4 flex gap-2 border-t border-edge pt-3"><IconLink href="https://github.com/r4khul" label="GitHub"><FaGithub /></IconLink><IconLink href="https://www.linkedin.com/in/rakhul/" label="LinkedIn"><FaLinkedin /></IconLink><IconLink href={`mailto:${proofProfile.email}`} label="Email"><Mail /></IconLink><Link href={proofProfile.cal} className="ml-auto flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-3 py-2 text-xs font-semibold transition-colors hover:bg-edge"><CalendarDays className="size-3.5" /> Schedule</Link></div>
  </BentoCard>;
}

function FeaturedCard({ project }: { project: NonNullable<typeof proofProjects.unfilter> }) {
  return <BentoCard className="group p-0 lg:col-span-5 lg:row-span-2 lg:min-h-0"><div className="relative h-40 shrink-0 overflow-hidden border-b border-edge sm:h-48 lg:h-[34%]"><Image src={project.cover!} alt="Unfilter app" fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" /><div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur">Shipped · Play Store</div></div><div className="flex min-h-0 flex-1 flex-col p-5 md:p-6 lg:p-5"><div><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">Featured product</span><span className="font-mono text-[10px] text-faint">2026</span></div><h2 className="mt-1 font-serif text-4xl tracking-tight">{project.title}</h2><p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">Offline Android analyzer that reveals app tech stacks, runtime behavior, and resource usage without root or network access.</p></div><div className="mt-auto grid grid-cols-2 gap-2 pt-3 sm:grid-cols-4">{[["200+","active users"],["95%","accuracy"],["2–3s","scan time"],["<150MB","peak memory"]].map(([value,label]) => <div key={label} className="rounded-xl border border-edge bg-background/50 p-2 lg:p-2.5"><strong className="block font-serif text-xl tracking-tight text-accent">{value}</strong><span className="font-mono text-[9px] uppercase tracking-wide text-faint">{label}</span></div>)}</div><div className="mt-3 flex flex-wrap gap-2 border-t border-edge pt-3"><Action href="https://play.google.com/store/apps/details?id=com.escapebranch.unfilter" primary><FaGooglePlay className="size-3.5" /> Play Store</Action><Action href="https://github.com/r4khul/unfilter"><FaGithub className="size-3.5" /> Source</Action><Action href="/projects/unfilter">Case study <ArrowUpRight className="size-3.5" /></Action></div></div></BentoCard>;
}

function ImpactCard() { return <BentoCard className="p-5 md:p-6 lg:col-span-4"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-faint">Production impact</span><span className="font-mono text-[10px] text-faint">Finfresh · 2026</span></div><div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{proofMetrics.slice(2, 6).map((metric) => <div key={metric.label}><strong className="block font-serif text-2xl tracking-tight">{metric.value}</strong><span className="font-mono text-[9px] leading-tight text-muted">{metric.label}</span></div>)}</div><p className="mt-4 border-t border-edge pt-3 text-xs leading-relaxed text-muted">Owned payments, onboarding, release pipelines, and performance across two fintech apps.</p></BentoCard>; }

function GithubCard() { return <BentoCard className="overflow-hidden p-4 md:p-5 lg:col-span-4 lg:min-h-0"><div className="flex items-center justify-between"><div><span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-faint">GitHub activity</span><p className="mt-1 text-xs text-muted">Consistent product + OSS shipping.</p></div><Link href="https://github.com/r4khul" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile" className="rounded-full border border-edge p-2 transition-colors hover:bg-edge"><FaGithub className="size-4" /></Link></div><div className="h-[116px] overflow-hidden lg:h-[104px]"><div className="-mx-2 mt-1 origin-top scale-[.58] [&>div]:!mt-0"><GitHubContributionGraph /></div></div></BentoCard>; }

function CompactProductCard({ project, kind }: { project: NonNullable<typeof proofProjects.mrcas>; kind: "client" | "engineering" }) { const client = kind === "client"; return <BentoCard className="group p-0 md:flex-row lg:col-span-4 lg:min-h-0"><div className="relative h-32 w-full shrink-0 overflow-hidden border-b border-edge md:h-auto md:w-2/5 md:border-b-0 md:border-r"><Image src={project.cover!} alt={`${project.title} preview`} fill sizes="(max-width: 768px) 100vw, 16vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div><div className="flex flex-1 flex-col p-4"><div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-accent">{client ? "Client · Live" : "Open source · Systems"}</span><span className="font-mono text-[10px] text-faint">{project.year}</span></div><h3 className="mt-1 font-serif text-2xl tracking-tight">{project.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{client ? "Real-time campus ordering with atomic inventory, payments, and multi-platform delivery." : "Offline-first finance with sync conflict resolution, 69 tests, and English/Tamil localization."}</p><div className="mt-auto flex gap-2 pt-3">{client ? <Action href="https://play.google.com/store/apps/details?id=com.wedigi.mrcascafe" primary><FaGooglePlay className="size-3" /> Play Store</Action> : <Action href="https://github.com/r4khul/thrifty"><FaGithub className="size-3" /> GitHub</Action>}<Action href={`/projects/${project.slug}`}>Details <ArrowUpRight className="size-3" /></Action></div></div></BentoCard>; }

function ContactStrip() { return <footer className="shrink-0 flex flex-col gap-2 rounded-2xl border border-edge bg-surface/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><span className="font-mono text-[10px] uppercase tracking-[.2em] text-faint">Build something people use?</span><p className="mt-0.5 text-sm font-semibold">Let’s talk about the next mobile product.</p></div><div className="flex flex-wrap gap-2"><Action href={`mailto:${proofProfile.email}`} primary><Mail className="size-3.5" /> Email me</Action><Action href={proofProfile.cal}>Schedule call <ArrowUpRight className="size-3.5" /></Action></div></footer>; }

function Pill({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-edge px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted">{children}</span>; }
function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) { return <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex size-9 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:bg-foreground hover:text-background">{children}</Link>; }
function Action({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) { return <Link href={href} target={href.startsWith("http") || href.startsWith("mailto:") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors ${primary ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20" : "border-edge bg-surface text-muted hover:bg-edge hover:text-foreground"}`}>{children}</Link>; }
