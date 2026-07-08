import Image from "next/image";
import { ReactNode } from "react";

export function Dialogue({ speaker, children }: { speaker?: string; children: ReactNode }) {
  return (
    <div className="story-dialogue story-fade-in">
      {speaker && (
        <span className="font-mono text-[11px] uppercase tracking-wider text-story-faint block mb-1">
          {speaker}
        </span>
      )}
      <div className="flex items-start gap-1">
        <span className="text-story-text select-none">—</span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export function Thought({ children }: { children: ReactNode }) {
  return <div className="story-thought story-fade-in">{children}</div>;
}

export function Letter({ children }: { children: ReactNode }) {
  return <div className="story-letter story-fade-in shadow-sm">{children}</div>;
}

export function Pause() {
  return (
    <div className="story-pause story-fade-in" aria-hidden="true">
      <span>&#10022;</span>
      <span>&#10022;</span>
      <span>&#10022;</span>
    </div>
  );
}

export function WideImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="story-wide-image story-fade-in">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="story-parallax object-cover mix-blend-luminosity opacity-90"
      />
    </figure>
  );
}

export function CinematicImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="relative w-full aspect-[21/9] my-16 overflow-hidden rounded-sm story-fade-in border border-story-border">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover story-parallax"
      />
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] pointer-events-none" />
    </figure>
  );
}

export function Chapter({ title, number }: { title: string; number?: number }) {
  return (
    <header className="mt-24 mb-12 story-fade-in text-center">
      {number !== undefined && (
        <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-story-faint mb-4">
          Chapter {number}
        </span>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl text-story-text m-0 tracking-tight">
        {title}
      </h2>
      <div className="w-12 h-px bg-story-border mx-auto mt-6" />
    </header>
  );
}
