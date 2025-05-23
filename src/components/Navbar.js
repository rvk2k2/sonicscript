"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    setDropdownOpen(false);
  };

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

  return (
    <nav className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 py-4 px-6">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-slate-800" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">
              SonicScript
            </h1>
          </div>
        </div>

        {/* Center Navigation Pills */}
        <div className="hidden lg:flex items-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-2 py-2">
            <div className="flex items-center space-x-1">
              <button className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                <span>Products</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                <span>Resources</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                <span>Docs</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                <span>Company</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1">
                <span>Pricing</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Get a demo equivalent - could be Dashboard */}
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-sm font-medium transition-all duration-200"
              >
                Dashboard
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-sm font-medium transition-all duration-200"
                >
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                    {!loading && username ? username.charAt(0).toUpperCase() : "U"}
                  </div>
                  {!loading && username && (
                    <span className="hidden sm:block">{username}</span>
                  )}
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden">
                      <div className="py-1">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Account</p>
                          <p className="text-sm font-medium text-gray-900 truncate mt-1">
                            {currentUser?.email}
                          </p>
                        </div>
                        <button
                          className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => {
                            router.push("/settings");
                            setDropdownOpen(false);
                          }}
                        >
                          <svg
                            className="mr-3 h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </button>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <svg
                              className="mr-3 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-sm font-medium transition-all duration-200"
              >
                Get a demo
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-lg"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </nav>
  );
};

export default Navbar;