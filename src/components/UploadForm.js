"use client";
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { storage, db } from "../lib/firebase";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const allowedTypes = ["audio/mpeg", "audio/wav", "video/mp4", "video/webm"];
  const maxSize = 50 * 1024 * 1024; // 50MB

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      setError("Only audio (MP3, WAV) and video (MP4, WEBM) files are allowed.");
      setFile(null);
      return;
    }

    if (selected.size > maxSize) {
      setError("File size should be less than 50MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => {
        setError("Upload failed: " + err.message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const fileType = file.type.startsWith("audio/") ? "audio" : "video";
      
        // 1. Save to Firestore
        await addDoc(collection(db, "transcriptions"), {
          filename: file.name,
          url: downloadURL,
          type: fileType,
          createdAt: Timestamp.now(),
        });
      
        // 2. 🔁 Send to /api/transcribe for background processing
        await fetch("/api/transcribe", {
          method: "POST",
          body: new URLSearchParams({
            url: downloadURL,
            filename: file.name,
          }),
        });
      
        setSuccess("File uploaded and transcription started!");
        setUploading(false);
        setFile(null);
        setProgress(0);
      }
      
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4"
        accept="audio/*,video/*"
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}
