import { NextRequest } from 'next/server';
import Notification from '@/models/Notification';
import dbConnect from '@/lib/db'; // you probably have this

export async function POST(req: NextRequest) {
  await dbConnect();
  const { userId, type, message, link } = await req.json();

  if (!userId || !type || !message) {
    return new Response('Missing fields', { status: 400 });
  }

  const notification = new Notification({
    userId,
    type,
    message,
    link,
  });

  await notification.save();

  return new Response('Notification created', { status: 201 });
}
