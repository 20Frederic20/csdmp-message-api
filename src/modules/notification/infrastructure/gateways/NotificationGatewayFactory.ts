import { INotificationGateway } from "../../domain/gateways/INotificationGateway";
import { NotificationChannel } from "../../domain/entities/Notification";
import { INotificationGatewayFactory } from "../../domain/gateways/INotificationGatewayFactory";
import { EmailGateway } from "./EmailGateway";
import { WhatsAppGateway } from "./WhatsAppGateway";
import { SMSGateway } from "./SMSGateway";

export class NotificationGatewayFactory implements INotificationGatewayFactory {
  private emailGateway = new EmailGateway();
  private whatsappGateway = new WhatsAppGateway();
  private smsGateway = new SMSGateway();

  getGateway(channel: NotificationChannel): INotificationGateway {
    switch (channel) {
      case "email":
        return this.emailGateway;
      case "whatsapp":
        return this.whatsappGateway;
      case "sms":
        return this.smsGateway;
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }
}
