import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const views = await redis.get<number>('pageviews:total');
    return NextResponse.json({ views: views || 0 });
  } catch (error) {
    console.error('Failed to get total views:', error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
