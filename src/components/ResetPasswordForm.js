"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase"; 

const ResetPasswordForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-xl overflow-hidden max-w-md mx-auto w-full">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600">
        <h2 className="text-2xl font-bold text-white text-center">Reset Password</h2>
      </div>
      <div className="p-6">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        <div>
          <div className="relative mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              onClick={onClose}
              className="w-full p-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;