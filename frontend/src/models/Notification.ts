import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification =
  models.Notification ||
  model<INotification>('Notification', NotificationSchema);
export default Notification;
