import 'dotenv/config';
import express from 'express';
import { EmailQueueService } from './infrastructure/queue/EmailQueueService';
import { EmailController } from './presentation/controllers/EmailController';
import { NodemailerGateway } from './infrastructure/gateways/NodemailerGateway';
import { SendEmailUseCase } from './use-cases/SendEmailUseCase';
import { setupEmailWorker } from './infrastructure/queue/EmailWorker';

const app = express();
app.use(express.json());

const emailQueueService = new EmailQueueService();
const mailGateway = new NodemailerGateway();

const sendEmailUseCase = new SendEmailUseCase(mailGateway);

const emailController = new EmailController(emailQueueService);

app.post('/api/notify/email', emailController.send);

setupEmailWorker(sendEmailUseCase);

app.listen(3000, () => console.log('Serveur démarré sur http://localhost:3000'));