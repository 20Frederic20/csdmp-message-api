import { Notification } from "../entities/Notification";

export interface INotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findAll(): Promise<Notification[]>;
  update(
    id: string,
    notification: Partial<Notification>,
  ): Promise<Notification | null>;
  delete(id: string): Promise<boolean>;
}
