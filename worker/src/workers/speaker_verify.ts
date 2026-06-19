import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import crypto from 'crypto';

export function setupSpeakerVerifyWorker(connection: IORedis) {
  const worker = new Worker(
    'speaker_verify',
    async (job) => {
      console.log(`Processing speaker verification for job ${job.id}`);
      const { audioUrl, expectedUserId, action } = job.data;
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (action === 'enroll') {
         const hashedEmbedding = crypto.createHash('sha256').update(audioUrl).digest('hex');
         console.log(`Speaker enrolled for job ${job.id}`);
         return { success: true, hashedEmbedding };
      }

      // Verification action
      const matched = Math.random() > 0.1; // 90% success rate in simulation
      const confidence = matched ? 0.95 : 0.45;
      
      console.log(`Speaker verification complete for job ${job.id}. Matched: ${matched}`);
      
      return { success: matched, confidence };
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
    console.log(`SpeakerVerify Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`SpeakerVerify Job ${job?.id} has failed with ${err.message}`);
  });

  return worker;
}
