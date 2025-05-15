import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function initializeUserInFirestore(uid, user, usernameOverride = null) {
  const creditsRef = doc(db, "users", uid, "credits", "balance");
  const creditsSnap = await getDoc(creditsRef);

  if (!creditsSnap.exists()) {
    const profileRef = doc(db, "users", uid, "credentials", "profile");

    const username = usernameOverride || user.displayName || "Unnamed User";

    try {
      await Promise.all([
        setDoc(profileRef, {
          username,
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
        }),
        setDoc(creditsRef, {
          totalCredits: 500,
          lastUpdated: serverTimestamp(),
        }),
      ]);
    } catch (error) {
      console.error("Error creating Firestore user documents:", error);
      throw error;
    }
  }
}
