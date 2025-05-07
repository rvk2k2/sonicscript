
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function initializeUserInFirestore(uid, user) {
  const creditsRef = doc(db, "users", uid, "credits", "balance");
  const creditsSnap = await getDoc(creditsRef);

  if (!creditsSnap.exists()) {
    const profileRef = doc(db, "users", uid, "credentials", "profile");

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

export async function getUserCredits(uid) {
    const creditsRef = doc(db, "users", uid, "credits", "balance");
    const snapshot = await getDoc(creditsRef);
  
    if (snapshot.exists()) {
      return snapshot.data().totalCredits;
    } else {
      return 0;
    }
  }
