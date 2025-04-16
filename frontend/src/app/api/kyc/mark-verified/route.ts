// src/app/api/kyc/mark-verified/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { kycVerified: true },
    { new: true, upsert: true } // Хэрвээ олдохгүй бол шинээр үүсгэнэ
  );

  return new Response(
    JSON.stringify({ message: 'User marked as verified', user }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
