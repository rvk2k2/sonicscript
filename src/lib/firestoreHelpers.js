// src/lib/firestoreHelpers.js
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function initializeUserInFirestore(uid, user) {
  const userDocRef = doc(db, "users", uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    const profileRef = doc(db, "users", uid, "credentials", "profile");
    const creditsRef = doc(db, "users", uid, "credits", "balance");

    await Promise.all([
      setDoc(profileRef, {
        username: user.displayName || "Unnamed User",
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
      }),
      setDoc(creditsRef, {
        totalCredits: 500,
        lastUpdated: serverTimestamp(),
      }),
    ]);
  }
}
