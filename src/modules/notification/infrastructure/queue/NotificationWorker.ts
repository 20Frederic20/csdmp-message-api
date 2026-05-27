import { Worker, Job } from "bullmq";
import { NotifyUseCase } from "../../use-cases/NotifyUseCase";
import { Notification } from "../../domain/entities/Notification";

export const setupNotificationWorker = (notifyUseCase: NotifyUseCase) => {
  const worker = new Worker(
    "notification-queue",
    async (job: Job<Notification>) => {
      console.log(`Processing notification job ${job.id}...`);
      await notifyUseCase.execute(job.data);
    },
    {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    },
  );

  worker.on("failed", (job, err) =>
    console.error(`${job?.id} failed: ${err.message}`),
  );

  const gracefulShutdown = async () => {
    console.log("Shutting down notification worker...");
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);

  return worker;
};
