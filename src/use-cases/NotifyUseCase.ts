import { INotificationGateway } from "../domain/gateways/INotificationGateway";
import { Notification } from "../domain/entities/Notification";

export class NotifyUseCase {
  constructor(private notificationGateway: INotificationGateway) {}

  async execute(notification: Notification): Promise<void> {
    if (!notification.to.includes("@")) {
      throw new Error("Invalid recipient address");
    }

    await this.notificationGateway.send(notification);
  }
}
