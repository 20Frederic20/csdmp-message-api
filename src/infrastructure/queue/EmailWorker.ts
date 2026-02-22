import { Worker, Job } from 'bullmq';
import { SendEmailUseCase } from '../../use-cases/SendEmailUseCase';
import { EmailMessage } from '../../domain/entities/EmailMessage';

export const setupEmailWorker = (sendEmailUseCase: SendEmailUseCase) => {
  const worker = new Worker('email-queue', async (job: Job<EmailMessage>) => {
    console.log(`Traitement du job ${job.id}...`);
    await sendEmailUseCase.execute(job.data);
  }, {
    connection: { 
      host: process.env.REDIS_HOST || 'localhost', 
      port: Number(process.env.REDIS_PORT) || 6379 
    }
  });

  worker.on('failed', (job, err) => console.error(`${job?.id} a échoué: ${err.message}`));
  
  const gracefulShutdown = async () => {
    console.log('Fermeture du worker...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  
  return worker;
};