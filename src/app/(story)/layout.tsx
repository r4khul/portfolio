import "../story-engine.css";
import { BackToTop } from "@/components/site/back-to-top";
import { AudioPrompt } from "@/components/stories/engine/audio-prompt";

export default function StoryEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="story-engine-root bg-story-bg text-story-text selection:bg-story-text selection:text-story-bg transition-colors duration-1000 ease-in-out">
      {/* Background ambient container */}
      <div className="story-ambient fixed inset-0 pointer-events-none z-[-1]" aria-hidden="true" />
      
      {/* Film grain overlay */}
      <div className="story-grain fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-30" aria-hidden="true" />
      
      <main className="story-content-rail mx-auto w-full max-w-[65ch] px-6 sm:px-12 md:px-16 lg:px-20 py-24 sm:py-32 min-h-screen">
        {children}
      </main>
      
      <BackToTop />
      <AudioPrompt />
    </div>
  );
}
