import { Queue } from "bullmq";
import { INotificationQueue } from "../../domain/gateways/INotificationQueue";
import { Notification } from "../../domain/entities/Notification";

export class BullMQNotificationQueue implements INotificationQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("notification-queue", {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
  }

  async enqueue(notification: Notification): Promise<void> {
    await this.queue.add("notification-job", notification, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
  }

  getQueue() {
    return this.queue;
  }
}
