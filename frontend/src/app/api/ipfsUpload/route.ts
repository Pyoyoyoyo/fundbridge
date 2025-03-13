// app/api/ipfsUpload/route.ts (Next.js 13 style, Route Handlers)
import { NextRequest, NextResponse } from 'next/server';
import { create as createIpfsClient } from 'ipfs-http-client';

const ipfs = createIpfsClient({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http',
  // эсвэл Infura credentials, auth гэх мэт
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body.data === таны илгээсэн JSON string

    const { cid } = await ipfs.add(body.data);
    // IPFS дээр upload хийгдсэн CID-г буцаана
    return NextResponse.json({ cid: cid.toString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
