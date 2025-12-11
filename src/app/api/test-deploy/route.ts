import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    deployed: true, 
    timestamp: new Date().toISOString(),
    version: '6eb29de-test'
  });
}

