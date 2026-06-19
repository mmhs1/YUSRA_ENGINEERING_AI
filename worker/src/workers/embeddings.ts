import { Worker } from 'bullmq';
import IORedis from 'ioredis';

export function setupEmbeddingsWorker(connection: IORedis) {
  const worker = new Worker(
    'embeddings',
    async (job) => {
      console.log(`Processing embeddings for job ${job.id}`);
      const { text, metadata } = job.data;
      
      // Simulate embedding generation (e.g., via OpenAI or local model)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const embedding = Array(1536).fill(0).map(() => Math.random() * 2 - 1);
      console.log(`Embeddings generated for job ${job.id}`);
      
      return { embeddingSize: 1536, stored: true };
    },
    { 
      connection,
      limiter: {
        max: 20,
        duration: 1000,
      }
    }
  );

  worker.on('completed', (job) => {
    console.log(`Embeddings Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Embeddings Job ${job?.id} has failed with ${err.message}`);
  });

  return worker;
}
