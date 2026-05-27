import { INotificationRepository } from "../domain/gateways/INotificationRepository";

export class DeleteNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.notificationRepository.delete(id);
  }
}
