import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { transcriptionQueue } from "@/lib/queue"; 

export async function POST(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    const idToken = authHeader?.split("Bearer ")[1];

    if (!idToken) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Get user credits
    const creditRef = adminDb.doc(`users/${uid}/credits/balance`);
    const creditSnap = await creditRef.get();
    const credits = creditSnap.data()?.totalCredits || 0;

    if (credits < 130) {
      return new Response("Not enough credits", { status: 403 });
    }

    // Deduct credits
    await creditRef.update({
      totalCredits: credits - 130,
      lastUpdated: admin.firestore.Timestamp.now(),
    });

    const { url, filename, type } = await req.json();

    if (!url || !filename) {
      return new Response(JSON.stringify({ error: "Missing url or filename" }), {
        status: 400,
      });
    }

    // Create transcription document
    const docRef = await adminDb
    .collection(`users/${uid}/transcriptions`)
    .add({
      filename,
      url,
      type,
      createdAt: admin.firestore.Timestamp.now(),
    });
  

    const docId = docRef.id;

    // Add job to queue
    await transcriptionQueue.add("transcribe-job", { url, filename, type, docId, uid });

    return new Response(JSON.stringify({ message: "Job queued successfully", docId }), {
      status: 200,
    });

  } catch (err) {
    console.error("Error in /api/transcribe:", err);
    return new Response("Server error", { status: 500 });
  }
}
