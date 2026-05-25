import { INotificationQueue } from "../domain/gateways/INotificationQueue";
import { Notification } from "../domain/entities/Notification";

export class EnqueueNotificationUseCase {
  constructor(private notificationQueue: INotificationQueue) {}

  async execute(notification: Notification): Promise<void> {
    if (!notification.to || !notification.subject || !notification.body) {
      throw new Error("Missing notification details");
    }

    await this.notificationQueue.enqueue(notification);
  }
}
