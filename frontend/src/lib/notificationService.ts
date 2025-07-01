import Notification from '@/models/Notification';

export async function createNotification(
  userId: string,
  type: string,
  message: string,
  link?: string
) {
  const notification = new Notification({
    userId,
    type,
    message,
    link,
  });
  await notification.save();
}
