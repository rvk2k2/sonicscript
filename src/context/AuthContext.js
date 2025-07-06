"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { updateProfile } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { initializeUserInFirestore } from "@/lib/firestoreHelpers";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          await initializeUserInFirestore(user.uid, user);
        } catch (error) {
          console.error("Error initializing Firestore user:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Manually inject displayName from form, since Firebase doesn't allow setting it on sign-up
      user.displayName = username;
      await initializeUserInFirestore(user.uid, user, username); // send username explicitly
      await updateProfile(user, { displayName: username });
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Ensure Firestore profile and credits are created
    await initializeUserInFirestore(user.uid, user);

    return user;
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      console.error("You closed the sign-in popup before completing the login.");
    } else {
      console.error("Google login failed:", error);
    }
    throw error;
  }
};


  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = useMemo(() => ({
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
  }), [currentUser]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
