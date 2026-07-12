export default function BlogLoading() {
  return (
    <main className="animate-pulse select-none">
      {/* Cover Skeleton */}
      <div className="relative h-[141px] overflow-hidden bg-surface sm:h-[246px]" />

      <div className="bleed-line px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-surface" />
          <div className="h-5 w-16 rounded-full bg-surface" />
        </div>

        <header className="mt-6 space-y-4">
          <div className="h-5 w-32 rounded bg-surface" />
          <div className="h-10 w-3/4 rounded bg-surface" />
          <div className="h-4 w-40 rounded bg-surface" />
          <div className="flex gap-1.5 pt-1">
            <div className="h-5 w-14 rounded border border-edge bg-surface" />
            <div className="h-5 w-14 rounded border border-edge bg-surface" />
          </div>
        </header>
      </div>

      {/* Article Content Skeleton */}
      <div className="bleed-line space-y-4 px-4 py-10 sm:px-8">
        <div className="h-4 w-[98%] rounded bg-surface" />
        <div className="h-4 w-[95%] rounded bg-surface" />
        <div className="h-4 w-[90%] rounded bg-surface" />
        <div className="h-4 w-[40%] rounded bg-surface" />
        
        <div className="h-8" />

        <div className="h-4 w-[96%] rounded bg-surface" />
        <div className="h-4 w-[94%] rounded bg-surface" />
      </div>
    </main>
  );
}
