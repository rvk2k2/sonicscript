'use client';
import { downloadAsTxt, downloadAsPDF } from "../lib/download";

export default function TranscriptDisplay({ transcription }) {
  const isVideo = transcription.type === "video";

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">{transcription.filename}</h2>

      <div className="rounded overflow-hidden mb-4">
        {isVideo ? (
          <video controls className="w-full rounded-md">
            <source src={transcription.url} type="video/mp4" />
          </video>
        ) : (
          <audio controls className="w-full">
            <source src={transcription.url} type="audio/mpeg" />
          </audio>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded-md space-y-2">
        {transcription.text ? (
          transcription.text.split(". ").map((line, i) => (
            <div key={i} className="bg-white p-3 rounded shadow-sm w-fit">
              {line.trim()}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">⏳ Transcribing...</p>
        )}
      </div>

      {transcription.text && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => downloadAsTxt(transcription)}
            className="text-sm text-blue-600 underline"
          >
            Download as TXT
          </button>
          <button
            onClick={() => downloadAsPDF(transcription)}
            className="text-sm text-green-600 underline"
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
}
