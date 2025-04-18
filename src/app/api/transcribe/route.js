import { transcriptionQueue } from "@/lib/queue";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function POST(request) {
  const formData = await request.formData();
  const url = formData.get("url");
  const filename = formData.get("filename");
  const type = formData.get("type"); // optional if you're handling audio/video

  if (!url || !filename) {
    return new Response(JSON.stringify({ error: "Missing url or filename" }), { status: 400 });
  }

  // 1. Create Firestore document now
  const docRef = await addDoc(collection(db, "transcriptions"), {
    filename,
    url,
    type,
    createdAt: Timestamp.now(),
  });

  const docId = docRef.id;

  // 2. Pass docId to the queue
  await transcriptionQueue.add("transcribe-job", { url, filename, type, docId });

  return new Response(JSON.stringify({ message: "Job queued successfully", docId }), {
    status: 200,
  });
}
