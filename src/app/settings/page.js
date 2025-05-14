"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getAuth } from "firebase/auth";
import BuyCreditsButton from '@/components/BuyCreditsButton';

const SettingsPage = () => {
  const { currentUser } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating username:", err);
      setMessage("Something went wrong.");
    }
  };

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

      const idToken = await currentUser.getIdToken();

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

      await auth.signOut();

      alert("✅ Your account has been successfully deleted.");
      window.location.href = "/";
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        alert("⚠️ Please re-login and try again to delete your account.");
      } else {
        console.error("Account deletion error:", err);
        alert("❌ Something went wrong while deleting your account.");
      }
    }
  };

  if (!currentUser || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-10">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 -mx-6 -mt-6 p-6 mb-6 rounded-t-xl">
        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
      </div>

      {!loading && username && (
        <div className="mb-6 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl text-blue-600">{username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-800">Hi, {username} 👋</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block font-medium mb-2 text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border-2 border-gray-300 p-3 rounded-lg bg-gray-100 cursor-not-allowed text-black"
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">Username</label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!isEditing}
              className={`w-full border-2 p-3 rounded-lg text-black ${
                isEditing 
                  ? 'border-blue-500 focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-300 bg-gray-100'
              }`}
            />
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setUsername(username);
                    setIsEditing(false);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
            {message}
          </div>
        )}
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Payment Info</h3>
           <BuyCreditsButton />
        </div>
        <button
          onClick={() => window.location.href = '/account-deletion'}
          className="text-red-600 hover:text-red-700 border border-red-600 px-4 py-2 rounded-lg transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;