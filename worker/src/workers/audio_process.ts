import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import ffmpeg from 'fluent-ffmpeg';

export function setupAudioProcessWorker(connection: IORedis) {
  const worker = new Worker(
    'audio_process',
    async (job) => {
      console.log(`Processing audio for job ${job.id}`);
      const { inputUrl } = job.data;
      
      // Simulate FFmpeg processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const normalizedUrl = `https://mock-storage.example.com/audio/${job.id}_normalized.wav`;
      console.log(`Audio normalization complete for job ${job.id}`);
      
      return { normalizedUrl, format: 'wav', sampleRate: 16000 };
    },
    { 
      connection,
      limiter: {
        max: 5,
        duration: 1000,
      }
    }
  );

  worker.on('completed', (job) => {
    console.log(`AudioProcess Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`AudioProcess Job ${job?.id} has failed with ${err.message}`);
  });

  return worker;
}
