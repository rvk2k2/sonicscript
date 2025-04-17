import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL, {
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {}, // Upstash requires TLS
});

export const transcriptionQueue = new Queue('transcription', { connection });
