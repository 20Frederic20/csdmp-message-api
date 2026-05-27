import { INotificationRepository } from "../domain/gateways/INotificationRepository";
import { Notification } from "../domain/entities/Notification";

export class UpdateNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(
    id: string,
    notification: Partial<Notification>,
  ): Promise<Notification | null> {
    return await this.notificationRepository.update(id, notification);
  }
}
