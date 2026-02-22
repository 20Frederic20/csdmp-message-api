import { Request, Response } from 'express';
import { EmailQueueService } from '../../infrastructure/queue/EmailQueueService';

export class EmailController {
  constructor(private emailQueueService: EmailQueueService) {}

  send = async (req: Request, res: Response) => {
    try {
      const { to, subject, body } = req.body;

      if (!to || !subject || !body) {
        return res.status(400).json({ error: "Champs manquants" });
      }

      await this.emailQueueService.addEmailToQueue({ to, subject, body });

      return res.status(202).json({ 
        message: "Notification mise en attente pour envoi",
        recipient: to 
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
  };
}