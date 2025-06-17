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
  <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-8 px-4">
    <div className="max-w-2xl mx-auto">
      {/* Header Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            {!loading && username && (
              <span className="text-2xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            {!loading && username && (
              <p className="text-white/70 text-lg">Welcome back, {username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
        <div className="space-y-8">
          {/* Email Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/90 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 cursor-not-allowed focus:outline-none"
            />
            <p className="text-xs text-white/50">Your email address cannot be changed</p>
          </div>

          {/* Username Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/90 uppercase tracking-wide">
              Username
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                className={`flex-1 rounded-xl px-4 py-3 text-white placeholder-white/50 transition-all duration-200 ${
                  isEditing 
                    ? 'bg-white/10 border-2 border-purple-500/50 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20' 
                    : 'bg-white/5 border border-white/20 cursor-not-allowed'
                }`}
              />
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setUsername(username);
                      setIsEditing(false);
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className="bg-green-500/20 border border-green-500/30 backdrop-blur-sm text-green-300 px-4 py-3 rounded-xl text-center font-medium">
              {message}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/20"></div>

        {/* Payment & Account Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Payment & Billing</h3>
            <p className="text-white/70 text-sm">Manage your subscription and credits</p>
            <div className="pt-2">
              <BuyCreditsButton />
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.location.href = '/account-deletion'}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-red-200 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mt-6">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white/70 text-sm">
            Changes to your account settings are saved automatically and take effect immediately.
          </p>
        </div>
      </div>
    </div>
  </div>
);
};

export default SettingsPage;