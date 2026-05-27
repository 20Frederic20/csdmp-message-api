export type NotificationStatus = "pending" | "sent" | "failed";
export type NotificationChannel = "email" | "whatsapp" | "sms";

export interface Notification {
  id?: string;
  to: string;
  subject?: string;
  body: string;
  channel: NotificationChannel;
  status?: NotificationStatus;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
