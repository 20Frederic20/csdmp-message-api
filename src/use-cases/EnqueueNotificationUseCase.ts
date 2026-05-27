import { INotificationQueue } from "../domain/gateways/INotificationQueue";
import { INotificationRepository } from "../domain/gateways/INotificationRepository";
import { Notification } from "../domain/entities/Notification";

export class EnqueueNotificationUseCase {
  constructor(
    private notificationQueue: INotificationQueue,
    private notificationRepository: INotificationRepository,
  ) {}

  async execute(notification: Notification): Promise<void> {
    if (!notification.to || !notification.subject || !notification.body) {
      throw new Error("Missing notification details");
    }

    const savedNotification = await this.notificationRepository.save({
      ...notification,
      status: "pending",
    });

    await this.notificationQueue.enqueue(savedNotification);
  }
}
