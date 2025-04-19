'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import UploadForm from '../components/UploadForm';
import { downloadAsTxt, downloadAsPDF } from '../lib/download';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'transcriptions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFiles(data);
      if (!selectedFile && data.length > 0) {
        setSelectedFile(data[0]);
      }
    });
    return () => unsubscribe();
  }, [selectedFile]);

  return (
    <div className="flex h-screen">
      <Navbar />
      <div>
      {/* Sidebar */}
      <div className="w-1/4 bg-zinc-900 text-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">History</h2>
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className={`cursor-pointer px-2 py-1 rounded hover:bg-zinc-700 ${
                selectedFile?.id === file.id ? 'bg-zinc-700' : ''
              }`}
            >
              {file.filename}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Upload Form */}
        <UploadForm />

        {/* Transcript Viewer */}
        {selectedFile && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">{selectedFile.filename}</h3>

            {/* Media Player */}
            {selectedFile.downloadURL ? (
              selectedFile.filename.endsWith('.mp4') || selectedFile.filename.endsWith('.mov') ? (
                <video
                  controls
                  src={selectedFile.downloadURL}
                  className="w-full max-w-2xl rounded-lg mb-4"
                />
              ) : (
                <audio
                  controls
                  src={selectedFile.downloadURL}
                  className="w-full max-w-2xl rounded-lg mb-4"
                />
              )
            ) : null}

            {/* Transcription Text */}
            {selectedFile.result ? (
              <>
                <div className="space-y-2 bg-zinc-100 text-black p-4 rounded">
                  {selectedFile.result.split('. ').map((chunk, idx) => (
                    <p key={idx} className="bg-white p-2 rounded shadow">
                      {chunk.trim()}
                    </p>
                  ))}
                </div>

                {/* Download Buttons */}
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() =>
                      downloadAsTxt({
                        filename: selectedFile.filename,
                        text: selectedFile.result,
                      })
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Download as TXT
                  </button>
                  <button
                    onClick={() =>
                      downloadAsPDF({
                        filename: selectedFile.filename,
                        text: selectedFile.result,
                      })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Download as PDF
                  </button>
                </div>
              </>
            ) : (
              <div className="text-yellow-600 font-medium">Not transcribed</div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
