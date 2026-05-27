import { INotificationGateway } from "./INotificationGateway";
import { NotificationChannel } from "../entities/Notification";

export interface INotificationGatewayFactory {
  getGateway(channel: NotificationChannel): INotificationGateway;
}
