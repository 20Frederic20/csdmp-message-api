import { NotifyUseCase } from "../../use-cases/NotifyUseCase";
import { Notification } from "../../domain/entities/Notification";
import { RabbitMQConnection } from "../../../../shared/infrastructure/queue/RabbitMQConnection";

export class RabbitMQWorker {
  private queueName = "notification.process";

  constructor(private notifyUseCase: NotifyUseCase) {}

  async start() {
    console.log(`Starting RabbitMQ Worker for queue: ${this.queueName}...`);
    try {
      const channel = await RabbitMQConnection.getChannel();
      await channel.assertQueue(this.queueName, { durable: true });

      // Process one message at a time
      channel.prefetch(1);

      channel.consume(
        this.queueName,
        async (msg) => {
          if (msg) {
            try {
              const notification: Notification = JSON.parse(
                msg.content.toString(),
              );
              console.log(`Processing notification job...`);

              await this.notifyUseCase.execute(notification);

              // Success: Ack the message to remove it from the queue
              channel.ack(msg);
              console.log(`Notification processed and ACKed.`);
            } catch (err: any) {
              console.error(`Failed to process notification: ${err.message}`);
              // Error: Nack the message. Requeue if you want to retry later,
              // or handle retry logic here. For now, we'll requeue.
              channel.nack(msg, false, true);
            }
          }
        },
        { noAck: false },
      );

      const gracefulShutdown = async () => {
        console.log("Shutting down RabbitMQ worker...");
        await RabbitMQConnection.close();
        process.exit(0);
      };

      process.on("SIGINT", gracefulShutdown);
      process.on("SIGTERM", gracefulShutdown);
    } catch (err) {
      console.error("Error setting up RabbitMQ Worker:", err);
    }
  }
}
