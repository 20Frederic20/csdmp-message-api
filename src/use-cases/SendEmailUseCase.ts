import { IMailGateway } from "../domain/gateways/IMailGateways";
import { EmailMessage } from "../domain/entities/EmailMessage";

export class SendEmailUseCase {
  constructor(private mailGateway: IMailGateway) {}

  async execute(data: EmailMessage): Promise<void> {
    if (!data.to.includes('@')) throw new Error("Email invalide");
    
    await this.mailGateway.send(data);
  }
}
