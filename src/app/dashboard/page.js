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
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-black text-white flex flex-col">
          <div className="flex justify-between p-4 border-b border-gray-700">
            <Link href="/">
              <Home className="h-6 w-6 text-white cursor-pointer" />
            </Link>
            <RefreshCw 
              className="h-6 w-6 text-white cursor-pointer" 
              onClick={refreshDashboard}
            />
          </div>
          {credits !== null ? (
        <p className="text-green-600 font-medium">
          Remaining Credits: {credits}
        </p>
      ) : (
        <p>Loading credits...</p>
      )}
         
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">History</h2>
            <TranscriptionList 
              transcriptions={files} 
              selected={selectedFile} 
              setSelected={setSelectedFile} 
              onDelete={handleDeleteFile}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {selectedFile ? (
            <TranscriptDisplay transcription={selectedFile} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <h1 className="text-6xl font-bold mb-16">SonicScript</h1>
              <p className="text-gray-500 mb-8">Supports MP3, M4A, MP4, WEBM</p>

              {isUploading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-lg">Uploading...</p>
                </div>
              ) : isTranscribing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-lg">Transcribing...</p>
                </div>
              ) : (
                <div className="w-full max-w-xl">
                  <UploadForm 
                    onUploadStart={handleFileUploadStart}
                    onUploadComplete={handleFileUploadComplete}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
