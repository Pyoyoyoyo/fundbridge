import { NextRequest } from 'next/server';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  await Notification.findByIdAndUpdate(params.id, { isRead: true });
  return new Response('Notification marked as read', { status: 200 });
}
