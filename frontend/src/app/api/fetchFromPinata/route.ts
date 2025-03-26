// app/api/fetchFromPinata/route.ts (Next.js 13+ хувилбарын жишээ)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid');
    if (!cid) {
      return NextResponse.json({ error: 'No CID provided' }, { status: 400 });
    }

    // Pinata буюу IPFS gateway-аас татах (жишээ нь):
    const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from IPFS' },
        { status: 500 }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
