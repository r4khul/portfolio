export default function StoryLoading() {
  return (
    <div className="animate-pulse select-none">
      {/* Chapter Header Skeleton */}
      <div className="flex flex-col items-center space-y-6 pt-8 pb-16">
        <div className="h-3 w-20 rounded bg-story-text/10" />
        <div className="h-10 w-2/3 rounded-lg bg-story-text/15" />
        <div className="h-0.5 w-16 bg-story-text/10" />
      </div>

      {/* Paragraph/Text Blocks Skeleton */}
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-[98%] rounded bg-story-text/10" />
          <div className="h-4 w-[94%] rounded bg-story-text/10" />
          <div className="h-4 w-[88%] rounded bg-story-text/10" />
        </div>

        <div className="h-4 w-[30%] rounded bg-story-text/10" />

        <div className="space-y-3">
          <div className="h-4 w-[96%] rounded bg-story-text/10" />
          <div className="h-4 w-[92%] rounded bg-story-text/10" />
        </div>

        {/* Dynamic Canvas Effect Placeholder Skeleton */}
        <div className="my-10 h-[38vh] w-full rounded-md border border-story-border/10 bg-story-text/5" />

        <div className="space-y-3">
          <div className="h-4 w-[97%] rounded bg-story-text/10" />
          <div className="h-4 w-[91%] rounded bg-story-text/10" />
          <div className="h-4 w-[85%] rounded bg-story-text/10" />
        </div>
      </div>
    </div>
  );
}
