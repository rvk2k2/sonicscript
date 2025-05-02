import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from './src/lib/firebase.js'; // Adjust path if needed
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// Firebase Init
initializeApp(firebaseConfig);
const db = getFirestore();

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
    const { url, filename, docId } = job.data;

    console.log(`🔄 Transcribing: ${filename}`);

    const response = await axios.post("http://localhost:9000/transcribe", new URLSearchParams({ url }));

    const transcription = response.data.text;

    const docRef = doc(db, "transcriptions", docId);
    await updateDoc(docRef, {
      result: transcription,
      completedAt: Timestamp.now(),
    });

    console.log(`✅ Transcription saved for: ${filename}`);
  },
  { connection }
);


// Error handler
worker.on('failed', (job, err) => {
  console.error(`❌ Job failed for ${job.id}:`, err);
});
