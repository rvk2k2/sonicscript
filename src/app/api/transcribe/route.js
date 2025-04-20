import { transcriptionQueue } from "@/lib/queue";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    const { url, filename, type } = await request.json();

    if (!url || !filename) {
      return new Response(JSON.stringify({ error: "Missing url or filename" }), {
        status: 400,
      });
    }

    // 1. Create a new Firestore document
    const docRef = await addDoc(collection(db, "transcriptions"), {
      filename,
      url,
      type,
      createdAt: Timestamp.now(),
    });

    const docId = docRef.id;

    // 2. Add to queue with the document ID
    await transcriptionQueue.add("transcribe-job", { url, filename, type, docId });

    return new Response(JSON.stringify({ message: "Job queued successfully", docId }), {
      status: 200,
    });
  } catch (error) {
    console.error("Transcription API error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
