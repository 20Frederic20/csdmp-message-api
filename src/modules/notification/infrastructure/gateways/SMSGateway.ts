import { INotificationGateway } from "../../domain/gateways/INotificationGateway";
import { Notification } from "../../domain/entities/Notification";

export class SMSGateway implements INotificationGateway {
  async send(notification: Notification): Promise<void> {
    // Mock SMS sending logic
    console.log(`[SMSGateway] Sending SMS to ${notification.to}: ${notification.body}`);
    return Promise.resolve();
  }
}
