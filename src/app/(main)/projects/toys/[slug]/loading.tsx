export default function ToyPageLoading() {
  return (
    <main className="animate-pulse">
      {/* Cover skeleton */}
      <div className="relative h-[141px] overflow-hidden bg-surface sm:h-[246px]" />

      <div className="bleed-line px-4 py-8 sm:px-8">
        {/* Back button skeleton */}
        <div className="h-4 w-24 rounded bg-surface" />

        <header className="mt-6 space-y-3">
          <div className="h-3 w-20 rounded bg-surface" />
          <div className="h-10 w-3/4 rounded bg-surface" />
          <div className="h-4 w-full max-w-prose rounded bg-surface" />
          <div className="h-4 w-2/3 max-w-prose rounded bg-surface" />

          {/* Action buttons skeleton */}
          <div className="mt-5 flex gap-3">
            <div className="h-8 w-20 rounded-md bg-surface" />
            <div className="h-8 w-20 rounded-md bg-surface" />
          </div>

          {/* Stack tags skeleton */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-14 rounded border border-edge bg-surface" />
            ))}
          </div>
        </header>
      </div>

      {/* Article skeleton */}
      <div className="bleed-line space-y-3 px-4 py-10 sm:px-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-surface"
            style={{ width: `${85 - (i % 3) * 15}%` }}
          />
        ))}
      </div>
    </main>
  );
}
