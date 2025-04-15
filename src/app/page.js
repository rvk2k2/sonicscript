import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
    <h1 className="text-4xl font-bold mb-4">Welcome to Sonic Script 🎧</h1>
    <p className="text-lg text-gray-600">
      Go to <code className="bg-gray-100 px-2 py-1 rounded">/dashboard</code> to upload audio and get started.
    </p>
  </div>
  );
}
