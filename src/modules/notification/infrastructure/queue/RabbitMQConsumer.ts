import { EnqueueNotificationUseCase } from "../../use-cases/EnqueueNotificationUseCase";
import { Notification } from "../../domain/entities/Notification";
import { RabbitMQConnection } from "../../../../shared/infrastructure/queue/RabbitMQConnection";

export class RabbitMQConsumer {
  private exchangeName = "notifications";
  private queueName = "notification-events-queue";

  constructor(private enqueueNotificationUseCase: EnqueueNotificationUseCase) {}

  async start() {
    console.log(
      `Starting RabbitMQ Consumer for exchange: ${this.exchangeName}...`,
    );
    try {
      const channel = await RabbitMQConnection.getChannel();

      // Ensure exchange exists
      await channel.assertExchange(this.exchangeName, "topic", {
        durable: true,
      });

      // Ensure queue exists
      const q = await channel.assertQueue(this.queueName, { durable: true });

      // Bind queue to exchange (binding to all messages for now, or specific routing keys)
      await channel.bindQueue(q.queue, this.exchangeName, "#");

      channel.consume(
        q.queue,
        async (msg) => {
          if (msg) {
            try {
              await this.processMessage(msg.content.toString());
              channel.ack(msg);
            } catch (err) {
              console.error(
                "[RabbitMQConsumer] Error processing message:",
                err,
              );
              // Negative acknowledgement, requeue for retry
              channel.nack(msg, false, true);
            }
          }
        },
        { noAck: false },
      );
    } catch (err) {
      console.error("Error setting up RabbitMQ Consumer:", err);
    }
  }

  private async processMessage(content: string) {
    const data = JSON.parse(content);
    console.log(`[RabbitMQConsumer] Received message:`, data);

    try {
      let notification: Notification | null = null;

      if (data.event === "PATIENT_CREATED") {
        const payload = data.data || {};
        notification = {
          to: payload.email || payload.to,
          subject: "Bienvenue !",
          body: `Bonjour ${payload.firstName || "Patient"}, votre compte a été créé avec succès.`,
          channel: "email",
        };
      } else if (data.to && data.body) {
        // Direct notification format
        notification = {
          to: data.to,
          subject: data.subject,
          body: data.body,
          channel: (data.channel as any) || "email",
        };
      }

      if (notification && notification.to) {
        await this.enqueueNotificationUseCase.execute(notification);
        console.log(
          `[RabbitMQConsumer] Enqueued notification from event: ${data.event || "direct"}`,
        );
      } else {
        console.warn(
          `[RabbitMQConsumer] Message skipped: No valid notification mapping found.`,
        );
      }
    } catch (err) {
      console.error(`[RabbitMQConsumer] Error mapping message:`, err);
      throw err;
    }
  }
}
