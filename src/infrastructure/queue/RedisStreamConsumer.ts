import Redis from "ioredis";
import { EnqueueNotificationUseCase } from "../../use-cases/EnqueueNotificationUseCase";
import { Notification } from "../../domain/entities/Notification";

export class RedisStreamConsumer {
  private redis: Redis;
  private streamName = "notification.send";
  private groupName = "notification-group";
  private consumerName = `consumer-${process.pid}`;

  constructor(private enqueueNotificationUseCase: EnqueueNotificationUseCase) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  async start() {
    console.log(`Starting Redis Stream Consumer for ${this.streamName}...`);
    try {
      // Create group if it doesn't exist
      await this.redis.xgroup(
        "CREATE",
        this.streamName,
        this.groupName,
        "0",
        "MKSTREAM",
      );
    } catch (err: any) {
      if (!err.message.includes("BUSYGROUP")) {
        console.error("Error creating consumer group:", err);
      }
    }

    this.consume();
  }

  private async consume() {
    while (true) {
      try {
        const results = (await this.redis.xreadgroup(
          "GROUP",
          this.groupName,
          this.consumerName,
          "COUNT",
          10,
          "BLOCK",
          0,
          "STREAMS",
          this.streamName,
          ">",
        )) as any;

        if (results) {
          for (const [, messages] of results) {
            for (const [id, fields] of messages) {
              await this.processMessage(id, fields);
            }
          }
        }
      } catch (err) {
        console.error("Error consuming from stream:", err);
        // Wait before retrying to avoid tight loop on error
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessage(id: string, fields: string[]) {
    const data: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      data[fields[i]] = fields[i + 1];
    }

    console.log(`[RedisStreamConsumer] Received message ${id}:`, data);

    try {
      let notification: Notification | null = null;

      if (data.event === "PATIENT_CREATED") {
        const payload = JSON.parse(data.data || "{}");
        notification = {
          to: payload.email || payload.to,
          subject: "Bienvenue !",
          body: `Bonjour ${payload.firstName || "Patient"}, votre compte a été créé avec succès.`,
        };
      } else if (data.to && data.subject && data.body) {
        // Direct notification format
        notification = {
          to: data.to,
          subject: data.subject,
          body: data.body,
        };
      }

      if (notification && notification.to) {
        await this.enqueueNotificationUseCase.execute(notification);
        console.log(
          `[RedisStreamConsumer] Enqueued notification from event: ${data.event || "direct"}`,
        );
      } else {
        console.warn(
          `[RedisStreamConsumer] Message ${id} skipped: No valid notification mapping found.`,
        );
      }

      // Acknowledge message
      await this.redis.xack(this.streamName, this.groupName, id);
    } catch (err) {
      console.error(
        `[RedisStreamConsumer] Error processing message ${id}:`,
        err,
      );
    }
  }
}
