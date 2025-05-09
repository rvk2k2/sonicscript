"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const AuthModal = ({ isOpen, onClose }) => {
  const { login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("signup"); // "signup" or "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Only for signup
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        await signup(email, password, username); // custom method
        setMessage("Sign Up successful!");
      } else {
        await login(email, password);
        setMessage("Login successful!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      setMessage("Login with Google successful!");
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>

        <div className="flex justify-between mb-4">
          <button
            onClick={() => setMode("login")}
            className={`w-1/2 py-2 font-semibold border-b-2 ${
              mode === "login" ? "border-blue-500 text-blue-500" : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`w-1/2 py-2 font-semibold border-b-2 ${
              mode === "signup" ? "border-blue-500 text-blue-500" : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {message && <div className="mb-2 text-green-600">{message}</div>}
        {error && <div className="mb-2 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {mode === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="text-center my-3 text-sm text-gray-500">OR</div>

        <button
          onClick={handleGoogle}
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
