// app/api/getEthToMntRate/route.ts (Next.js 13+ хувилбар)
// Хэрэв Next.js 12- бол pages/api/getEthToMntRate.ts гэж үүсгээрэй

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // CoinGecko руу хүсэлт
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=mnt'
    );
    if (!res.ok) {
      // Алдаа гарвал 500 буцаана
      return NextResponse.json(
        { error: 'Failed to fetch ETH→MNT rate' },
        { status: 500 }
      );
    }
    const data = await res.json();
    // Жишээ үр дүн: { "ethereum": { "mnt": 5800000 } }

    // Ханшийг буцаах
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
