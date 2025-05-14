import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Firebase Auth token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Recursively delete Firestore user doc and subcollections
    const userDocRef = admin.firestore().doc(`users/${uid}`);
    await admin.firestore().recursiveDelete(userDocRef);

    // Delete Firebase Auth account
    await admin.auth().deleteUser(uid);

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
