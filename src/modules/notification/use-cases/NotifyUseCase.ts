import { INotificationRepository } from "../domain/gateways/INotificationRepository";
import { Notification } from "../domain/entities/Notification";
import { INotificationGatewayFactory } from "../domain/gateways/INotificationGatewayFactory";

export class NotifyUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private gatewayFactory: INotificationGatewayFactory,
  ) {}

  async execute(notification: Notification): Promise<void> {
    if (notification.channel === "email" && !notification.to.includes("@")) {
      if (notification.id) {
        await this.notificationRepository.update(notification.id, {
          status: "failed",
          error: "Invalid email address",
        });
      }
      throw new Error("Invalid email address");
    }

    try {
      const gateway = this.gatewayFactory.getGateway(notification.channel);
      await gateway.send(notification);
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
