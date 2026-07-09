import "dotenv/config";
import express from "express";

import { RabbitMQNotificationQueue } from "./modules/notification/infrastructure/queue/RabbitMQNotificationQueue";
import { NotificationGatewayFactory } from "./modules/notification/infrastructure/gateways/NotificationGatewayFactory";
import { MongooseNotificationRepository } from "./modules/notification/infrastructure/gateways/MongooseNotificationRepository";
import { NotifyUseCase } from "./modules/notification/use-cases/NotifyUseCase";
import { EnqueueNotificationUseCase } from "./modules/notification/use-cases/EnqueueNotificationUseCase";
import { GetNotificationsUseCase } from "./modules/notification/use-cases/GetNotificationsUseCase";
import { GetNotificationByIdUseCase } from "./modules/notification/use-cases/GetNotificationByIdUseCase";
import { UpdateNotificationUseCase } from "./modules/notification/use-cases/UpdateNotificationUseCase";
import { DeleteNotificationUseCase } from "./modules/notification/use-cases/DeleteNotificationUseCase";
import { NotificationController } from "./modules/notification/presentation/controllers/NotificationController";
import { RabbitMQWorker } from "./modules/notification/infrastructure/queue/RabbitMQWorker";
import { RabbitMQConsumer } from "./modules/notification/infrastructure/queue/RabbitMQConsumer";
import { connectDB } from "./shared/infrastructure/db/mongoose";
import { RabbitMQConnection } from "./shared/infrastructure/queue/RabbitMQConnection";

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // Initialize Database
  await connectDB();

  // Initialize RabbitMQ
  await RabbitMQConnection.connect();

  // Infrastructure
  const notificationQueue = new RabbitMQNotificationQueue();
  const notificationGatewayFactory = new NotificationGatewayFactory();
  const notificationRepository = new MongooseNotificationRepository();

  // Use Cases
  const notifyUseCase = new NotifyUseCase(
    notificationRepository,
    notificationGatewayFactory,
  );
  const enqueueNotificationUseCase = new EnqueueNotificationUseCase(
    notificationQueue,
    notificationRepository,
  );
  const getNotificationsUseCase = new GetNotificationsUseCase(
    notificationRepository,
  );
  const getNotificationByIdUseCase = new GetNotificationByIdUseCase(
    notificationRepository,
  );
  const updateNotificationUseCase = new UpdateNotificationUseCase(
    notificationRepository,
  );
  const deleteNotificationUseCase = new DeleteNotificationUseCase(
    notificationRepository,
  );

  // Presentation
  const notificationController = new NotificationController(
    enqueueNotificationUseCase,
    getNotificationsUseCase,
    getNotificationByIdUseCase,
    updateNotificationUseCase,
    deleteNotificationUseCase,
  );

  // Routes
  app.post("/api/notify/email", notificationController.send);
  app.get("/api/notifications", notificationController.getAll);
  app.get("/api/notifications/:id", notificationController.getById);
  app.put("/api/notifications/:id", notificationController.update);
  app.delete("/api/notifications/:id", notificationController.delete);

  // Worker
  const rabbitMQWorker = new RabbitMQWorker(notifyUseCase);
  await rabbitMQWorker.start();

  // RabbitMQ Consumer (replaces Redis Stream Consumer)
  const rabbitMQConsumer = new RabbitMQConsumer(enqueueNotificationUseCase);
  await rabbitMQConsumer.start();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Bootstrap error:", err);
  process.exit(1);
});
