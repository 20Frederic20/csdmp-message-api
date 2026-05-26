import { INotificationGateway } from "../domain/gateways/INotificationGateway";
import { INotificationRepository } from "../domain/gateways/INotificationRepository";
import { Notification } from "../domain/entities/Notification";

export class NotifyUseCase {
  constructor(
    private notificationGateway: INotificationGateway,
    private notificationRepository: INotificationRepository,
  ) {}

  async execute(notification: Notification): Promise<void> {
    if (!notification.to.includes("@")) {
      if (notification.id) {
        await this.notificationRepository.update(notification.id, {
          status: "failed",
          error: "Invalid recipient address",
        });
      }
      throw new Error("Invalid recipient address");
    }

    try {
      await this.notificationGateway.send(notification);
      if (notification.id) {
        await this.notificationRepository.update(notification.id, {
          status: "sent",
        });
      }
    } catch (error) {
      if (notification.id) {
        await this.notificationRepository.update(notification.id, {
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  }
}
