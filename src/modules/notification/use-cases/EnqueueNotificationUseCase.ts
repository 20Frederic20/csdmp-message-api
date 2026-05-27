import { INotificationQueue } from "../domain/gateways/INotificationQueue";
import { INotificationRepository } from "../domain/gateways/INotificationRepository";
import { Notification } from "../domain/entities/Notification";

export class EnqueueNotificationUseCase {
  constructor(
    private notificationQueue: INotificationQueue,
    private notificationRepository: INotificationRepository,
  ) {}

  async execute(notification: Notification): Promise<void> {
    if (!notification.to || !notification.body || !notification.channel) {
      throw new Error("Missing notification details");
    }

    if (notification.channel === "email" && !notification.subject) {
      throw new Error("Email notification requires a subject");
    }

    const savedNotification = await this.notificationRepository.save({
      ...notification,
      status: "pending",
    });

    await this.notificationQueue.enqueue(savedNotification);
  }
}
