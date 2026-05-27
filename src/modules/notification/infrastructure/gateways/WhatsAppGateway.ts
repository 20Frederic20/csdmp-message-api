import { INotificationGateway } from "../../domain/gateways/INotificationGateway";
import { Notification } from "../../domain/entities/Notification";

export class WhatsAppGateway implements INotificationGateway {
  async send(notification: Notification): Promise<void> {
    // Mock WhatsApp sending logic
    console.log(`[WhatsAppGateway] Sending WhatsApp to ${notification.to}: ${notification.body}`);
    return Promise.resolve();
  }
}
