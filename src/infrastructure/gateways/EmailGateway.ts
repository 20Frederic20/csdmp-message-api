import { INotificationGateway } from "../../domain/gateways/INotificationGateway";
import { Notification } from "../../domain/entities/Notification";
import nodemailer from "nodemailer";

export class EmailGateway implements INotificationGateway {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async send(notification: Notification): Promise<void> {
    await this.transporter.sendMail({
      from:
        process.env.MAIL_FROM || '"Notification System" <no-reply@example.com>',
      to: notification.to,
      subject: notification.subject,
      text: notification.body,
    });
    console.log(`[EmailGateway] Notification sent to ${notification.to}`);
  }
}
