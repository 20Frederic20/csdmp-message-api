import { INotificationRepository } from "../domain/gateways/INotificationRepository";
import { Notification } from "../domain/entities/Notification";

export class GetNotificationByIdUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: string): Promise<Notification | null> {
    return await this.notificationRepository.findById(id);
  }
}
