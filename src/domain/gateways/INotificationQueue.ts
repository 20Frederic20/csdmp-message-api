import { Notification } from "../entities/Notification";

export interface INotificationQueue {
  enqueue(notification: Notification): Promise<void>;
}
