'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getAuth } from "firebase/auth";
import { getUserCredits } from "@/lib/api";
import UploadForm from '@/components/UploadForm';
import { Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import TranscriptionList from '@/components/TranscriptionList';
import TranscriptDisplay from '@/components/TranscriptDisplay';


export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [newlyUploadedId, setNewlyUploadedId] = useState(null);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
  
    const uid = user.uid;

    const q = query(
      collection(db, `users/${uid}/transcriptions`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFiles(data);

      // Auto-select the new transcription when result is ready
      if (newlyUploadedId) {
        const uploadedFile = data.find(file => file.id === newlyUploadedId);
        if (uploadedFile?.result && !selectedFile) {
          setSelectedFile(uploadedFile);
          setIsTranscribing(false);
          setNewlyUploadedId(null);
        }
      }

      // Deselect if current file was deleted
      if (selectedFile && !data.find(file => file.id === selectedFile.id)) {
        setSelectedFile(null);
      }
    });

    return () => unsubscribe();
  }, [selectedFile, newlyUploadedId]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const idToken = await user.getIdToken();
        const totalCredits = await getUserCredits(idToken);
        setCredits(totalCredits);
      } catch (err) {
        console.error("Failed to fetch credits:", err);
      }
    };

    fetchCredits();
  }, []);

  const handleDeleteFile = async (fileId) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("User not authenticated");
  
      const docRef = doc(db, `users/${user.uid}/transcriptions`, fileId);
      await deleteDoc(docRef);
  
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(files.length > 1 ? files.find(file => file.id !== fileId) : null);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };
  

  const refreshDashboard = () => {
    setSelectedFile(null);
  };

  const handleFileUploadStart = () => {
    setIsUploading(true);
  };

  const handleFileUploadComplete = (docId) => {
    setIsUploading(false);
    setIsTranscribing(true);
    setNewlyUploadedId(docId);
  };

 return (
  <div className="flex flex-col min-h-[calc(100vh-100px)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>

    <div className="flex flex-1 overflow-hidden relative z-10">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white flex flex-col relative">
        {/* Sidebar Header with Glass Container */}
        <div className="p-6 border-b border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white">SonicScript</span>
              </Link>
              <button 
                onClick={refreshDashboard}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <RefreshCw className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Credits Component */}
        <div className="p-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium mb-2">Remaining Credits</p>
                {credits !== null ? (
                  <p className="text-3xl font-bold text-white">{credits}</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white/80 font-medium">Loading...</span>
                  </div>
                )}
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
            </div>
          </div>

          {/* History Section with Glass Container */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-white">History</h2>
            </div>
            <TranscriptionList 
              transcriptions={files} 
              selected={selectedFile} 
              setSelected={setSelectedFile} 
              onDelete={handleDeleteFile}
            />
          </div>
        </div>

        {/* Subtle Background Decoration */}
        <div className="absolute top-20 right-4 w-2 h-2 bg-purple-400/30 rounded-full"></div>
        <div className="absolute top-32 right-8 w-1 h-1 bg-pink-400/30 rounded-full"></div>
        <div className="absolute bottom-40 left-4 w-2 h-2 bg-blue-400/30 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {selectedFile ? (
          <TranscriptDisplay transcription={selectedFile} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                SonicScript
              </h1>
              <p className="text-xl text-white/60 mb-2">Transform your audio into text with AI</p>
              <p className="text-white/40">Supports MP3, M4A, MP4, WEBM</p>
            </div>

            {/* Upload Section */}
            <div className="w-full max-w-2xl">
              {isUploading ? (
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/30 border-b-pink-500 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                  </div>
                  <p className="text-xl font-medium text-white mb-2">Uploading your file...</p>
                  <p className="text-white/60">Please wait while we prepare your audio</p>
                </div>
              ) : isTranscribing ? (
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-green-500/30 border-b-green-500 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
                  </div>
                  <p className="text-xl font-medium text-white mb-2">Transcribing with AI...</p>
                  <p className="text-white/60">Converting your audio to text</p>
                </div>
              ) : (
                <UploadForm 
                  onUploadStart={handleFileUploadStart}
                  onUploadComplete={handleFileUploadComplete}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
