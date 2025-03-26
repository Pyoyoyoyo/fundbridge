// app/api/payment/fiat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { campaignId, amountMnt } = await req.json();
    if (!campaignId || !amountMnt) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // 1) Банкны шилжүүлэг гэх мэт логик (энд зөвхөн demo)
    // Та жишээ нь paymongo, golomt, tdb, etc.‐ийн API‐тэй холбогдож болно.

    // 2) DB‐д "FIAT төлбөр хүлээн авсан" гэдгийг тэмдэглэх
    // ... e.g. Payment.create({ campaignId, amount: amountMnt, type: 'FIAT' })

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Fiat payment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
