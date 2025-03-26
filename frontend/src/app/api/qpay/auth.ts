// /api/qpay/auth.ts (эсвэл таны дотор логик)
import type { NextApiRequest, NextApiResponse } from 'next';

// QPay token авах (Conceptual code)
export default async function getQPayToken() {
  const QPAY_AUTH_URL = 'https://merchant.qpay.mn/v2/auth/token';
  const client_id = process.env.QPAY_CLIENT_ID;
  const client_secret = process.env.QPAY_CLIENT_SECRET;

  const res = await fetch(QPAY_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id,
      client_secret,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'QPay token fetch failed');
  }

  const data = await res.json();
  // data.access_token, data.token_type, data.expires_in
  return data.access_token as string;
}
