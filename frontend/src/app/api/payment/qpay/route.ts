// app/api/payment/qpay/route.ts
import { NextRequest, NextResponse } from 'next/server';

// QPay API call helper (demo only)
async function createQPayInvoice({
  phone,
  amountMnt,
}: {
  phone: string;
  amountMnt: number;
}) {
  // 1) QPay OAuth2 => get token
  // 2) Create invoice => return QR code or link
  // ...
  return {
    invoiceId: 'qpay_invoice_123',
    qrImageUrl: 'https://example.com/qr.png',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { campaignId, phone, amountMnt } = await req.json();
    if (!campaignId || !phone || !amountMnt) {
      return NextResponse.json(
        { error: 'Missing QPay params' },
        { status: 400 }
      );
    }

    // QPay дээр invoice үүсгэх (fake demo)
    const result = await createQPayInvoice({
      phone,
      amountMnt: Number(amountMnt),
    });

    // DB‐д "QPay төлбөр үүссэн" тэмдэглэх (in progress)
    // ...

    return NextResponse.json({
      success: true,
      invoiceId: result.invoiceId,
      qrImageUrl: result.qrImageUrl,
    });
  } catch (err: any) {
    console.error('QPay payment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
