import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { EmbeddedTweet, TweetNotFound, TweetSkeleton } from "react-tweet";
import { getTweet as _getTweet } from "react-tweet/api";

const getTweet = unstable_cache(
  async (id: string) => _getTweet(id),
  ["tweet"],
  { revalidate: 3600 * 24 },
);

async function TweetContent({ id }: { id: string }) {
  try {
    const tweet = await getTweet(id);
    return tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />;
  } catch {
    const url = `https://x.com/i/web/status/${id}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group my-8 inline-flex items-center gap-2 rounded-2xl border border-edge bg-surface px-4 py-3 font-mono text-[11px] text-faint no-underline transition-colors hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-current shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
        View on X ↗
      </a>
    );
  }
}

type Props = { id: string };

export function TweetEmbed({ id }: Props) {
  return (
    <div className="my-8 flex justify-center [&_.react-tweet-theme]:!max-w-full [&_.react-tweet-theme]:!w-full">
      <div className="w-full max-w-[550px]">
        <Suspense fallback={<TweetSkeleton />}>
          <TweetContent id={id} />
        </Suspense>
      </div>
    </div>
  );
}
