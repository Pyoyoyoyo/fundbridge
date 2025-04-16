// src/app/api/user/kyc-status/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import User from '@/models/User';
import dbConnect from '@/lib/db'; // 💡 Доор алхам 1.1 дээр үүсгэнэ

export async function GET(req: NextRequest) {
  await dbConnect(); // DB холболт

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const user = await User.findOne({ email: session.user.email });
  const kycVerified = user?.kycVerified || false;

  return new Response(JSON.stringify({ kycVerified }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
