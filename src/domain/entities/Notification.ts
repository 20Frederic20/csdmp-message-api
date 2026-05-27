export type NotificationStatus = "pending" | "sent" | "failed";

export interface Notification {
  id?: string;
  to: string;
  subject: string;
  body: string;
  status?: NotificationStatus;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
