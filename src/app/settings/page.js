"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getAuth } from "firebase/auth";


const SettingsPage = () => {
 const { currentUser } = useAuth();


  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");


   useEffect(() => {
    if (currentUser?.uid) {
      const fetchUsername = async () => {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUsername(docSnap.data().username || "");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUsername();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
  if (!currentUser) return;

  try {
    const profileRef = doc(db, "users", currentUser.uid, "credentials", "profile");
    const docSnap = await getDoc(profileRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUsername(userData.username || "");
      setEmail(userData.email || "");
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
  } finally {
    setLoading(false);
  }
};


    fetchUserData();
  }, [currentUser]);

  const handleUpdate = async () => {
  if (!currentUser) return;

  try {
    const profileRef = doc(db, "users", currentUser.uid, "credentials", "profile");
    await updateDoc(profileRef, { username });
    setMessage("Username updated successfully!");
  } catch (err) {
    console.error("Error updating username:", err);
    setMessage("Something went wrong.");
  }
};


  if (!currentUser || loading) {
    return <p className="p-4">Loading...</p>;
  }

  


const handleDeleteAccount = async () => {
  const confirmed = confirm(
    "⚠️ Are you sure you want to permanently delete your account? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("You must be logged in to delete your account.");
      return;
    }

    // Get the Firebase Auth ID token to authorize the server-side operation
    const idToken = await currentUser.getIdToken();

    // Call your secure server-side API
    const res = await fetch("/api/deleteAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete account.");
    }

    // Optionally sign the user out on client
    await auth.signOut();

    alert("✅ Your account has been successfully deleted.");
    window.location.href = "/"; // Redirect to home/login
  } catch (err) {
    if (err.code === "auth/requires-recent-login") {
      alert("⚠️ Please re-login and try again to delete your account.");
    } else {
      console.error("Account deletion error:", err);
      alert("❌ Something went wrong while deleting your account.");
    }
  }
};


  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      
   {!loading && username && (
        <p className="text-md text-gray-600 mb-4">Hi, {username} 👋</p>
      )}

      <div className="mb-4">
        <label className="block font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Update Username
      </button>

      <button
  onClick={handleDeleteAccount}
  className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
>
  Delete Account
</button>


      {message && <p className="text-green-600 mt-2">{message}</p>}

      <hr className="my-6" />

      <h3 className="text-lg font-semibold mb-2">Payment Info</h3>
      <p className="text-sm text-gray-500">Coming soon in Phase 3.</p>
    </div>
  );
};

export default SettingsPage;
