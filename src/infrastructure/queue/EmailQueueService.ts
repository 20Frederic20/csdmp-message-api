import { Queue } from 'bullmq';
import { EmailMessage } from '../../domain/entities/EmailMessage';

export class EmailQueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('email-queue', {
      connection: { host: 'localhost', port: 6379 }
    });
  }

  async addEmailToQueue(data: EmailMessage) {
    await this.queue.add('send-email-job', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });
  }
}       