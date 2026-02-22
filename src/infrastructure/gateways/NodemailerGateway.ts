import { IMailGateway } from "../../domain/gateways/IMailGateways";
import { EmailMessage } from "../../domain/entities/EmailMessage";
import nodemailer from "nodemailer";

export class NodemailerGateway implements IMailGateway {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: '"Mon Backend" <no-reply@test.com>',
      to: message.to,
      subject: message.subject,
      text: message.body,
    });
    console.log(`[Email] Envoyé avec succès à ${message.to}`);
  }
}