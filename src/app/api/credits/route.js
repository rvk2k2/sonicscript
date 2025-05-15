import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    const idToken = authHeader?.split("Bearer ")[1];

    if (!idToken) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const creditRef = adminDb.doc(`users/${uid}/credits/balance`);
    const creditSnap = await creditRef.get();
    const credits = creditSnap.data()?.totalCredits || 0;

    return new Response(JSON.stringify({ totalCredits: credits }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching credits:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
