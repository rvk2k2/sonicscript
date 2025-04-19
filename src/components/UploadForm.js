"use client";
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { Upload } from "lucide-react";

export default function UploadForm({ onUploadStart, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const allowedTypes = ["audio/mpeg", "audio/wav", "video/mp4", "video/webm"];
  const maxSize = 50 * 1024 * 1024;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
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
    handleUpload(selected);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    if (onUploadStart) onUploadStart();
    
    const storageRef = ref(storage, `uploads/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

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
        const fileType = selectedFile.type.startsWith("audio/") ? "audio" : "video";

        // Send to backend to handle doc creation and queuing
        await fetch("/api/transcribe", {
          method: "POST",
          body: new URLSearchParams({
            url: downloadURL,
            filename: selectedFile.name,
            type: fileType,
          }),
        });

        setSuccess("File uploaded and transcription started!");
        setUploading(false);
        setFile(null);
        setProgress(0);
        
        if (onUploadComplete) onUploadComplete();
      }
    );
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
          ${dragActive ? 'border-gray-800 bg-gray-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          accept="audio/*,video/*"
        />
        <label htmlFor="file-upload" className="w-full cursor-pointer">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Drag and drop or select a file to upload</span>
            <Upload className="h-6 w-6 text-gray-500" />
          </div>
        </label>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-gray-800 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}