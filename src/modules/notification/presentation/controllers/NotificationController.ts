import { Request, Response } from "express";
import { EnqueueNotificationUseCase } from "../../use-cases/EnqueueNotificationUseCase";
import { GetNotificationsUseCase } from "../../use-cases/GetNotificationsUseCase";
import { GetNotificationByIdUseCase } from "../../use-cases/GetNotificationByIdUseCase";
import { UpdateNotificationUseCase } from "../../use-cases/UpdateNotificationUseCase";
import { DeleteNotificationUseCase } from "../../use-cases/DeleteNotificationUseCase";

export class NotificationController {
  constructor(
    private enqueueNotificationUseCase: EnqueueNotificationUseCase,
    private getNotificationsUseCase: GetNotificationsUseCase,
    private getNotificationByIdUseCase: GetNotificationByIdUseCase,
    private updateNotificationUseCase: UpdateNotificationUseCase,
    private deleteNotificationUseCase: DeleteNotificationUseCase,
  ) {}

  send = async (req: Request, res: Response) => {
    try {
      const { to, subject, body, channel } = req.body;

      await this.enqueueNotificationUseCase.execute({
        to,
        subject,
        body,
        channel: channel || "email",
      });

      return res.status(202).json({
        message: "Notification successfully queued",
        recipient: to,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getAll = async (_req: Request, res: Response) => {
    try {
      const notifications = await this.getNotificationsUseCase.execute();
      return res.json(notifications);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notification = await this.getNotificationByIdUseCase.execute(
        id as string,
      );

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      return res.json(notification);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notification = await this.updateNotificationUseCase.execute(
        id as string,
        req.body,
      );

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      return res.json(notification);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await this.deleteNotificationUseCase.execute(
        id as string,
      );

      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
