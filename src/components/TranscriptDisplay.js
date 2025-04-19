'use client';
import { downloadAsTxt, downloadAsPDF } from "../lib/download";

export default function TranscriptDisplay({ transcription }) {
  const isVideo = transcription?.filename?.endsWith('.mp4') || transcription?.filename?.endsWith('.mov');

  if (!transcription) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-6xl font-bold mb-16">SonicScript</h1>
        <p className="text-gray-500 mb-8">Supports MP3, M4A file</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* File Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">{transcription.filename}</h1>
        
        {/* Transcription Result */}
        <div className="mb-8">
          {transcription.result ? (
            <div className="space-y-4">
              {transcription.result.split('. ').map((chunk, idx) => (
                <p key={idx} className="p-2">
                  {chunk.trim()}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-yellow-600 font-medium">Not transcribed</div>
          )}
        </div>

        {/* Download Buttons */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => downloadAsPDF({
              filename: transcription.filename,
              text: transcription.result,
            })}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Download as PDF
          </button>
          <button
            onClick={() => downloadAsTxt({
              filename: transcription.filename,
              text: transcription.result,
            })}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Download as Txt
          </button>
        </div>
      </div>

      {/* Media Player */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-black p-2">
              <div className="text-white text-lg">{transcription.filename}</div>
            </div>
            
            {transcription.downloadURL && (
              <div className="flex-1">
                {isVideo ? (
                  <video
                    controls
                    src={transcription.downloadURL}
                    className="w-full max-w-2xl rounded"
                  />
                ) : (
                  <audio
                    controls
                    src={transcription.downloadURL}
                    className="w-full"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}