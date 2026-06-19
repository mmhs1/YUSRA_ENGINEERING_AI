import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import Tesseract from 'tesseract.js';

export function setupOcrWorker(connection: IORedis) {
  const ocrWorker = new Worker(
    'ocr',
    async (job) => {
      console.log(`Processing OCR for job ${job.id}`);
      const { imageUrl } = job.data;
      
      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        'eng',
        { logger: m => console.log(m) }
      );

      // In real scenario, store text in DB and trigger embeddings
      console.log(`OCR complete for job ${job.id}: text extracted.`);
      
      return { text };
    },
    { 
      connection,
      limiter: {
        max: 10,
        duration: 1000,
      }
    }
  );

  ocrWorker.on('completed', (job) => {
    console.log(`OCR Job ${job.id} has completed!`);
  });

  ocrWorker.on('failed', (job, err) => {
    console.error(`OCR Job ${job?.id} has failed with ${err.message}`);
  });

  return ocrWorker;
}
