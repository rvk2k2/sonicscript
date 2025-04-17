import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, Timestamp } from 'firebase/firestore';
import firebaseConfig from './src/lib/firebase.js'; // you'll create this
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

initializeApp(firebaseConfig);
const db = getFirestore();

const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL, {
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
    maxRetriesPerRequest: null,
    tls: true, 
  });
  

const worker = new Worker('transcription', async job => {
  const { url, filename } = job.data;

  console.log("🔄 Transcribing:", filename);

  const response = await axios.post("http://localhost:9000/transcribe", new URLSearchParams({ url }));

  const transcription = response.data.text;

  await addDoc(collection(db, "transcriptions"), {
    filename,
    url,
    result: transcription,
    createdAt: Timestamp.now(),
  });

  console.log("✅ Transcription saved:", filename);
}, { connection });

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed for ${job.id}:`, err);
});
