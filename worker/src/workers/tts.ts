import { Worker } from 'bullmq';
import IORedis from 'ioredis';

export function setupTtsWorker(connection: IORedis) {
  const ttsWorker = new Worker(
    'tts',
    async (job) => {
      console.log(`Processing TTS for job ${job.id}`);
      const { text } = job.data;
      
      // Simulate TTS generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const audioUrl = `https://mock-storage.example.com/tts/${job.id}.mp3`;

      console.log(`TTS complete for job ${job.id}`);
      return { audioUrl, duration: 2.5 };
    },
    { 
      connection,
      limiter: {
        max: 5,
        duration: 1000,
      }
    }
  );

  ttsWorker.on('completed', (job) => {
    console.log(`TTS Job ${job.id} has completed!`);
  });

  ttsWorker.on('failed', (job, err) => {
    console.error(`TTS Job ${job?.id} has failed with ${err.message}`);
  });

  return ttsWorker;
}
