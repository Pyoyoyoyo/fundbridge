// app/api/kyc/check-otp-status/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email шаардлагатай' }), {
      status: 400,
    });
  }

  const user = await User.findOne({ email });
  const verified = user?.kycOtpVerified ?? false;

  return new Response(JSON.stringify({ verified }), { status: 200 });
}
