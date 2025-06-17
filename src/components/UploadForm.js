"use client";
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { Upload } from "lucide-react";
import { getAuth } from "firebase/auth";

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
        console.log(`Upload is ${progress}% done`);
        setProgress(prog);
      },
      (err) => {
        setError("Upload failed: " + err.message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const fileType = selectedFile.type.startsWith("audio/") ? "audio" : "video";

        const auth = getAuth();
        const user = auth.currentUser;
      

        if (!user) {
          alert("⚠️ Please sign in before uploading a file.");
          return;
        }

        const idToken = await user.getIdToken();

        
        try {

          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              url: downloadURL,
              filename: selectedFile.name,
              type: fileType,
      
            }),
          });

          const data = await res.json();

          if (res.ok && data.docId) {
            setSuccess("File uploaded and transcription started!");
            if (onUploadComplete) onUploadComplete(data.docId);
          } else {
            setError("Transcription failed to start.");
          }
        } 
        
        catch (err) {
          setError("Error sending data to server: " + err.message);
        }

        setUploading(false);
        setFile(null);
        setProgress(0);
      }
    );
  };

 return (
  <div className="w-full">
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
        dragActive 
          ? 'border-purple-500 bg-purple-500/10 backdrop-blur-sm scale-105' 
          : 'border-white/30 hover:border-purple-400 hover:bg-white/5 backdrop-blur-sm'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
        dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
      </div>

      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept="audio/*,video/*"
      />
      
      <label htmlFor="file-upload" className="w-full cursor-pointer relative z-10">
        <div className="text-center">
          {/* Upload Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragActive 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-110' 
              : 'bg-white/10 group-hover:bg-gradient-to-r group-hover:from-purple-600/50 group-hover:to-pink-600/50'
          }`}>
            <Upload className={`transition-all duration-300 ${
              dragActive ? 'h-8 w-8 text-white' : 'h-8 w-8 text-white/80 group-hover:text-white'
            }`} />
          </div>

          {/* Upload Text */}
          <div className="space-y-3">
            <h3 className={`text-2xl font-bold transition-colors duration-300 ${
              dragActive ? 'text-white' : 'text-white/90 group-hover:text-white'
            }`}>
              {dragActive ? 'Drop your file here' : 'Upload your audio file'}
            </h3>
            
            <p className={`text-lg transition-colors duration-300 ${
              dragActive ? 'text-purple-200' : 'text-white/60 group-hover:text-white/80'
            }`}>
              {dragActive ? 'Release to upload' : 'Drag and drop or click to browse'}
            </p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">MP3</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">MP4</span>
            </div>
          </div>
        </div>
      </label>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
      <div className="absolute top-6 right-8 w-1 h-1 bg-pink-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-8 left-6 w-1 h-1 bg-green-400 rounded-full opacity-60"></div>
    </div>

    {/* Error Message */}
    {error && (
      <div className="mt-4 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-sm">⚠️</span>
          </div>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    )}

    {/* Progress Bar */}
    {progress > 0 && (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/80 font-medium">Uploading...</span>
          <span className="text-white/60 text-sm">{progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    )}

    {/* Success Message */}
    {success && (
      <div className="mt-4 p-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="text-green-400 text-sm">✅</span>
          </div>
          <p className="text-green-400 font-medium">{success}</p>
        </div>
      </div>
    )}
  </div>
);
}
