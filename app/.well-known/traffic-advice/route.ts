import { NextResponse } from 'next/server';

export async function GET() {
  const config = [
    {
      user_agent: 'prefetch-proxy',
      fraction: 0.8
    },
  ];

  return NextResponse.json(config, {
    status: 200,
    headers: {
      'Content-Type': 'application/trafficadvice+json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}