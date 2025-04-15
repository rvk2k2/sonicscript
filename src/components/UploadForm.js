import { useState } from "react";
import { storage, db } from "../lib/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    // ✅ File Type Check
    if (!selected.type.startsWith("audio/")) {
      alert("Please select a valid audio file.");
      return;
    }

    // ✅ File Size Check (e.g., 10MB)
    if (selected.size > 10 * 1024 * 1024) {
      alert("File too large. Please select a file under 10MB.");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return alert("No file selected!");

    const storageRef = ref(storage, `audio/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // ✅ Progress Tracker
        const prog =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog.toFixed(0));
      },
      (error) => {
        alert("Upload failed: " + error.message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // ✅ Save metadata to Firestore
        await addDoc(collection(db, "transcriptions"), {
          filename: file.name,
          url: downloadURL,
          createdAt: Timestamp.now(),
        });

        alert("Upload successful!");
        setProgress(0);
        setUploading(false);
        setFile(null);
      }
    );
  };

  return (
    <div className="p-4 border rounded shadow w-full max-w-md mx-auto mt-10">
      <input
        type="file"
        onChange={handleFileChange}
        accept="audio/*"
        className="mb-4"
      />

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 h-4 rounded-full text-white text-sm text-center"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
