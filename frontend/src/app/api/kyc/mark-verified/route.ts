import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: 'Session байхгүй байна' }), {
      status: 401,
    });
  }

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    { kycVerified: true },
    { new: true }
  );

  if (!updated?.kycOtpVerified) {
    return new Response(JSON.stringify({ error: 'OTP баталгаажаагүй байна' }), {
      status: 403,
    });
  }

  return new Response(
    JSON.stringify({ message: 'KYC амжилттай бүртгэгдлээ' }),
    { status: 200 }
  );
}
