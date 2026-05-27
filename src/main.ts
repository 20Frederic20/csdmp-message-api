import "dotenv/config";
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { BullMQNotificationQueue } from "./modules/notification/infrastructure/queue/BullMQNotificationQueue";
import { NotificationGatewayFactory } from "./modules/notification/infrastructure/gateways/NotificationGatewayFactory";
import { MongooseNotificationRepository } from "./modules/notification/infrastructure/gateways/MongooseNotificationRepository";
import { NotifyUseCase } from "./modules/notification/use-cases/NotifyUseCase";
import { EnqueueNotificationUseCase } from "./modules/notification/use-cases/EnqueueNotificationUseCase";
import { GetNotificationsUseCase } from "./modules/notification/use-cases/GetNotificationsUseCase";
import { GetNotificationByIdUseCase } from "./modules/notification/use-cases/GetNotificationByIdUseCase";
import { UpdateNotificationUseCase } from "./modules/notification/use-cases/UpdateNotificationUseCase";
import { DeleteNotificationUseCase } from "./modules/notification/use-cases/DeleteNotificationUseCase";
import { NotificationController } from "./modules/notification/presentation/controllers/NotificationController";
import { setupNotificationWorker } from "./modules/notification/infrastructure/queue/NotificationWorker";
import { RedisStreamConsumer } from "./modules/notification/infrastructure/queue/RedisStreamConsumer";
import { connectDB } from "./shared/infrastructure/db/mongoose";

const app = express();
app.use(express.json());

// Initialize Database
connectDB();

// Infrastructure
const notificationQueue = new BullMQNotificationQueue();
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

// Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(notificationQueue.getQueue())],
  serverAdapter: serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

// Worker
setupNotificationWorker(notifyUseCase);

// Redis Stream Consumer
const redisStreamConsumer = new RedisStreamConsumer(enqueueNotificationUseCase);
redisStreamConsumer.start();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(
    `Queue monitoring available at http://localhost:${PORT}/admin/queues`,
  );
});
