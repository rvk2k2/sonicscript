// src/app/page.js
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-md shadow-lg w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to SonicScript</h1>
        <p className="text-lg text-gray-600">
      Go to <code className="bg-gray-100 px-2 py-1 rounded">/dashboard</code> to upload audio and get started.
    </p>
       
      </div>
    </div>
  );
}
