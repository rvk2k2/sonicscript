import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL, {
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: true,// Upstash requires TLS
});

export const transcriptionQueue = new Queue('transcription', { connection });

export async function POST(request) {
  const formData = await request.formData();
  const url = formData.get("url");
  const filename = formData.get("filename");
  const docId = formData.get("docId");

  if (!url || !filename || !docId) {
    return new Response(JSON.stringify({ error: "Missing url, filename, or docId" }), {
      status: 400,
    });
  }

  await transcriptionQueue.add("transcribe-job", { url, filename, docId });

  return new Response(JSON.stringify({ message: "Job queued successfully!" }), {
    status: 200,
  });
}

