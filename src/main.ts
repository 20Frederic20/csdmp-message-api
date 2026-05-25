import "dotenv/config";
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { BullMQNotificationQueue } from "./infrastructure/queue/BullMQNotificationQueue";
import { EmailGateway } from "./infrastructure/gateways/EmailGateway";
import { NotifyUseCase } from "./use-cases/NotifyUseCase";
import { EnqueueNotificationUseCase } from "./use-cases/EnqueueNotificationUseCase";
import { NotificationController } from "./presentation/controllers/NotificationController";
import { setupNotificationWorker } from "./infrastructure/queue/NotificationWorker";

const app = express();
app.use(express.json());

// Infrastructure
const notificationQueue = new BullMQNotificationQueue();
const emailGateway = new EmailGateway();

// Use Cases
const notifyUseCase = new NotifyUseCase(emailGateway);
const enqueueNotificationUseCase = new EnqueueNotificationUseCase(
  notificationQueue,
);

// Presentation
const notificationController = new NotificationController(
  enqueueNotificationUseCase,
);

// Routes
app.post("/api/notify/email", notificationController.send);

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
