import { NextResponse } from 'next/server';
import { getGamblingData } from '@/lib/gamblingDork';

// Rate limit: recompute at most once per 30 min
let lastCall = 0;
const MIN_INTERVAL = 5 * 60 * 1000; // 5 min between calls (protect free API quota)

export async function GET() {
  const now = Date.now();

  try {
    const data = await getGamblingData();

    lastCall = now;

    return NextResponse.json({
      ...data,
      cachedAt: data.lastScanAt,
    });
  } catch (err) {
    console.error('Gambling API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch gambling data' },
      { status: 500 }
    );
  }
}
