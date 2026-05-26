import { INotificationRepository } from "../domain/gateways/INotificationRepository";
import { Notification } from "../domain/entities/Notification";

export class GetNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<Notification[]> {
    return await this.notificationRepository.findAll();
  }
}
