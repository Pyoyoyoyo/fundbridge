import { NextRequest, NextResponse } from 'next/server';

// IPFS Gateway-гээ сонгоно (pinata.cloud, ipfs.io, ...).
const GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid');
    if (!cid) {
      return NextResponse.json({ error: 'No cid provided' }, { status: 400 });
    }

    const ipfsUrl = `${GATEWAY}/${cid}`;
    const resp = await fetch(ipfsUrl);
    if (!resp.ok) {
      throw new Error(`Failed to fetch from IPFS: ${resp.statusText}`);
    }
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('pinataDownload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
