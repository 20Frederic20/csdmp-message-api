import { Request, Response } from "express";
import { EnqueueNotificationUseCase } from "../../use-cases/EnqueueNotificationUseCase";

export class NotificationController {
  constructor(private enqueueNotificationUseCase: EnqueueNotificationUseCase) {}

  send = async (req: Request, res: Response) => {
    try {
      const { to, subject, body } = req.body;

      await this.enqueueNotificationUseCase.execute({ to, subject, body });

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
}
