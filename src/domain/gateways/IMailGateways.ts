import { EmailMessage } from "../entities/EmailMessage";

export interface IMailGateway {
  send(message: EmailMessage): Promise<void>;
}