import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/models/Otp';
import { sendOtpEmail } from '@/utils/sendOtpEmail';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email шаардлагатай' }), {
      status: 400,
    });
  }

  const otpCode = generateOtp();
  await Otp.create({ email, code: otpCode });
  await sendOtpEmail(email, otpCode);

  return new Response(JSON.stringify({ message: 'OTP илгээгдлээ' }), {
    status: 200,
  });
}
