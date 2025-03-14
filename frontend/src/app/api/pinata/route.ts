// /app/api/pinata/route.ts (Next.js 13 App Router жишээ)
import { NextRequest, NextResponse } from 'next/server';
import { pinJsonToIPFS } from '@/services/pinata';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body.data → metadata (JSON)
    const cid = await pinJsonToIPFS(body.data);
    return NextResponse.json({ cid }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
