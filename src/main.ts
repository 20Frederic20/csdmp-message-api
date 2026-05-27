import "dotenv/config";
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { BullMQNotificationQueue } from "./infrastructure/queue/BullMQNotificationQueue";
import { EmailGateway } from "./infrastructure/gateways/EmailGateway";
import { MongooseNotificationRepository } from "./infrastructure/gateways/MongooseNotificationRepository";
import { NotifyUseCase } from "./use-cases/NotifyUseCase";
import { EnqueueNotificationUseCase } from "./use-cases/EnqueueNotificationUseCase";
import { GetNotificationsUseCase } from "./use-cases/GetNotificationsUseCase";
import { GetNotificationByIdUseCase } from "./use-cases/GetNotificationByIdUseCase";
import { UpdateNotificationUseCase } from "./use-cases/UpdateNotificationUseCase";
import { DeleteNotificationUseCase } from "./use-cases/DeleteNotificationUseCase";
import { NotificationController } from "./presentation/controllers/NotificationController";
import { setupNotificationWorker } from "./infrastructure/queue/NotificationWorker";
import { connectDB } from "./infrastructure/db/mongoose";

const app = express();
app.use(express.json());

// Initialize Database
connectDB();

// Infrastructure
const notificationQueue = new BullMQNotificationQueue();
const emailGateway = new EmailGateway();
const notificationRepository = new MongooseNotificationRepository();

// Use Cases
const notifyUseCase = new NotifyUseCase(emailGateway, notificationRepository);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(
    `Queue monitoring available at http://localhost:${PORT}/admin/queues`,
  );
});
