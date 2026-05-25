import { Notification } from "../entities/Notification";

export interface INotificationGateway {
  send(notification: Notification): Promise<void>;
}
