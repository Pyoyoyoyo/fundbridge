import { NextRequest } from 'next/server';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const notifications = await Notification.find({
    userId: session.user.id,
  }).sort({ createdAt: -1 });
  return new Response(JSON.stringify(notifications), { status: 200 });
}
