// src/app/api/pinataUpload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    // JSON-оор ирсэн request.body-г задлах
    const { data } = await req.json();
    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Pinata-ийн API key, secret
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
    if (!PINATA_API_KEY || !PINATA_API_SECRET) {
      return NextResponse.json(
        { error: 'Pinata credentials not found' },
        { status: 500 }
      );
    }

    // Pinata руу илгээх
    const pinataUrl = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const resp = await axios.post(
      pinataUrl,
      {
        pinataMetadata: {
          name: 'myCampaignMetadata',
        },
        pinataContent: JSON.parse(data),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );

    const cid = resp.data.IpfsHash;
    return NextResponse.json({ cid });
  } catch (err: any) {
    console.error('pinataUpload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
