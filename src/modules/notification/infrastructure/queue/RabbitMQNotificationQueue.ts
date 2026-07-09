import { INotificationQueue } from "../../domain/gateways/INotificationQueue";
import { Notification } from "../../domain/entities/Notification";
import { RabbitMQConnection } from "../../../../shared/infrastructure/queue/RabbitMQConnection";

export class RabbitMQNotificationQueue implements INotificationQueue {
  private queueName = "notification.process";

  async enqueue(notification: Notification): Promise<void> {
    const channel = await RabbitMQConnection.getChannel();
    await channel.assertQueue(this.queueName, { durable: true });

    channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(notification)),
      { persistent: true },
    );
  }
}
