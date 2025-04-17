import { transcriptionQueue } from "@/lib/queue";

export async function POST(request) {
  const formData = await request.formData();
  const url = formData.get("url");
  const filename = formData.get("filename");

  if (!url || !filename) {
    return new Response(JSON.stringify({ error: "Missing url or filename" }), { status: 400 });
  }

  // Add to queue
  await transcriptionQueue.add("transcribe-job", { url, filename });

  return new Response(JSON.stringify({ message: "Job queued successfully!" }), { status: 200 });
}
