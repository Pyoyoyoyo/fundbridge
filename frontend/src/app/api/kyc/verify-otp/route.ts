import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/models/Otp';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, code } = await req.json();

  const otp = await Otp.findOne({ email, code });
  if (!otp) {
    return new Response(JSON.stringify({ error: 'Баталгаажуулах код буруу' }), {
      status: 400,
    });
  }

  const updated = await User.findOneAndUpdate(
    { email },
    { $set: { kycOtpVerified: true } },
    { new: true }
  );

  await Otp.deleteOne({ _id: otp._id });

  return new Response(
    JSON.stringify({ message: 'OTP баталгаажлаа', user: updated }),
    { status: 200 }
  );
}
