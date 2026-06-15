import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Ephemeral cache to aggressively reduce Redis rate limiting reads
const cache = new Map();

// Prod-grade sliding window rate limiter: 10 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  ephemeralCache: cache,
  analytics: true,
});

// Local memory cache to prevent duplicate Redis SET commands during cold starts/spikes
const localDuplicateCache = new Set<string>();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return new NextResponse('Slug is required', { status: 400 });

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Strict rate limiting check
    const { success } = await ratelimit.limit(`ratelimit:views:${ip}`);
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 });
    }

    // Compute unique identifier for cost-optimized strict deduplication
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const identifier = `${ip}-${userAgent}`;

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identifier));
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const duplicateKey = `pageview-duplicate:${slug}:${hash}`;

    // Extremely cost-optimized logic: Check local instance cache first!
    if (localDuplicateCache.has(duplicateKey)) {
      const views = await redis.get<number>(`pageviews:blog:${slug}`);
      return NextResponse.json({ views: views || 0 });
    }

    const isNewView = await redis.set(duplicateKey, true, { nx: true, ex: 86400 });

    if (isNewView) {
      // It's a verified unique view. Cache it locally and increment safely.
      localDuplicateCache.add(duplicateKey);
      const views = await redis.incr(`pageviews:blog:${slug}`);
      return NextResponse.json({ views });
    } else {
      // It's a duplicate view across instances. Cache it locally for next time.
      localDuplicateCache.add(duplicateKey);
      const views = await redis.get<number>(`pageviews:blog:${slug}`);
      return NextResponse.json({ views: views || 0 });
    }
  } catch (error) {
    console.error('Failed to increment views:', error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return new NextResponse('Slug is required', { status: 400 });

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Lighter rate limit for GET reads
    const { success } = await ratelimit.limit(`ratelimit:views_get:${ip}`);
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 });
    }

    const views = await redis.get<number>(`pageviews:blog:${slug}`);
    return NextResponse.json(
      { views: views || 0 },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get views:', error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
