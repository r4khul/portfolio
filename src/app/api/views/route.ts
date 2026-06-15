import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Ephemeral cache for rate limiting
const cache = new Map();

// Prod-grade sliding window rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  ephemeralCache: cache,
  analytics: true,
});

// Local memory cache to prevent duplicate Redis SET commands
const localDuplicateCache = new Set<string>();

export async function GET() {
  try {
    const views = await redis.get<number>('pageviews:total');
    return NextResponse.json(
      { views: views || 0 },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get total views:', error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Rate limit
    const { success } = await ratelimit.limit(`ratelimit:total_views:${ip}`);
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 });
    }

    // Deduplication logic
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const identifier = `${ip}-${userAgent}`;

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identifier));
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const duplicateKey = `pageview-duplicate:total:${hash}`;

    if (localDuplicateCache.has(duplicateKey)) {
      const views = await redis.get<number>('pageviews:total');
      return NextResponse.json({ views: views || 0 });
    }

    const isNewView = await redis.set(duplicateKey, true, { nx: true, ex: 86400 });

    if (isNewView) {
      localDuplicateCache.add(duplicateKey);
      const views = await redis.incr('pageviews:total');
      return NextResponse.json({ views });
    } else {
      localDuplicateCache.add(duplicateKey);
      const views = await redis.get<number>('pageviews:total');
      return NextResponse.json({ views: views || 0 });
    }
  } catch (error) {
    console.error('Failed to increment total views:', error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
