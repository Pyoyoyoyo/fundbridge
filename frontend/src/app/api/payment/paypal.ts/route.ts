// /api/payment/paypal.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function paypalHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // 1) PayPal API дээр order үүсгэх
      // 2) Амжилттай бол orderId буцаах
      return res.status(200).json({ orderId: 'PAYPAL_ORDER_ID' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
