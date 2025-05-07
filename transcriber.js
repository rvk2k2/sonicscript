import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';
import './loadEnv.js';
import { adminDb } from "./src/lib/firebase-admin.js";
import admin from 'firebase-admin';

// Redis Connection
const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL, {
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  maxRetriesPerRequest: null,
  tls: true,
});

// Worker setup
const worker = new Worker(
  "transcription",
  async (job) => {
    const { url, filename, docId, uid } = job.data;

    console.log(`🔄 Transcribing: ${filename}`);

    try {
      const response = await axios.post(
        "http://localhost:9000/transcribe",
        new URLSearchParams({ url })
      );

      const transcription = response.data.text;

      const docRef = adminDb.doc(`users/${uid}/transcriptions/${docId}`);
      await docRef.update({
        result: transcription,
        completedAt: admin.firestore.Timestamp.now(),
      });

      console.log(`✅ Transcription saved for: ${filename}`);
    } catch (error) {
      console.error(`❌ Error during transcription of ${filename}:`, error);
      throw error;
    }
  },
  { connection }
);

// Error handler
worker.on('failed', (job, err) => {
  console.error(`❌ Job failed for ${job.id}:`, err);
});
