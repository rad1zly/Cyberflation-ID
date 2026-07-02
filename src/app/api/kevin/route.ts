import { NextResponse } from 'next/server';
import { getMetrics, getRecentKEVs, searchKEVs, type KEVVulnerability } from '@/lib/kevin';

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'metrics';

  try {
    if (action === 'metrics') {
      const data = await getMetrics();
      return NextResponse.json(data);
    }

    if (action === 'recent') {
      const days = parseInt(searchParams.get('days') || '7');
      const data = await getRecentKEVs(days);
      return NextResponse.json(data);
    }

    if (action === 'search') {
      const q = searchParams.get('q') || '';
      const perPage = parseInt(searchParams.get('per_page') || '10');
      const data = await searchKEVs(q, perPage);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('KEVin API error:', err);
    return NextResponse.json({ error: 'Failed to fetch from KEVin' }, { status: 500 });
  }
}
