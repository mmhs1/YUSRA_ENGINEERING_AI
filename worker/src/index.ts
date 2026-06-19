import { Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import { setupOcrWorker } from './workers/ocr';
import { setupTtsWorker } from './workers/tts';
import { setupAudioProcessWorker } from './workers/audio_process';
import { setupSpeakerVerifyWorker } from './workers/speaker_verify';
import { setupEmbeddingsWorker } from './workers/embeddings';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

console.log('Starting Yusra Engineering Ai Workers...');

// Initialize individual workers
setupOcrWorker(connection);
setupTtsWorker(connection);
setupAudioProcessWorker(connection);
setupSpeakerVerifyWorker(connection);
setupEmbeddingsWorker(connection);

console.log('Workers initialized. Listening for jobs...');
