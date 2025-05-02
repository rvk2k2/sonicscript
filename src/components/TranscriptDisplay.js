'use client';
import { useState, useRef, useEffect } from 'react';
import { downloadAsTxt, downloadAsPDF } from "../lib/download";
import { Pause, Play } from 'lucide-react';

export default function TranscriptDisplay({ transcription }) {
  const isVideo = transcription?.filename?.endsWith('.mp4') || transcription?.filename?.endsWith('.mov');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (audioRef.current) {
      const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
      };
      
      const handleDurationChange = () => {
        setDuration(audioRef.current.duration);
      };
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('durationchange', handleDurationChange);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('durationchange', handleDurationChange);
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current.removeEventListener('pause', handlePause);
        }
      };
    }
  }, [audioRef.current]);
  
  if (!transcription) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-6xl font-bold text-black mb-16">SonicScript</h1>
        <p className="text-gray-500 mb-8">Supports MP3, M4A file</p>
      </div>
    );
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleProgressChange = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  
  const handleVolumeChange = (e) => {
    if (audioRef.current) {
      audioRef.current.volume = e.target.value;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* File Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-black mb-8">{transcription.filename}</h1>
        
        {/* Transcription Result */}
        <div className="mb-8">
          {transcription.result ? (
            <div className="space-y-4">
              {transcription.result.split('. ').map((chunk, idx) => (
                <p key={idx} className="p-2 text-black">
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
      <div className="border-t border-gray-200">
        {transcription.url && (
          <>
            {/* Hidden audio/video element for functionality */}
            {isVideo ? (
              <video 
                ref={audioRef} 
                src={transcription.url} 
                className="hidden"
              />
            ) : (
              <audio 
                ref={audioRef} 
                src={transcription.url} 
                className="hidden"
              />
            )}
            
            {/* Custom player UI */}
            <div className="border-t border-gray-200 py-4">
              {/* Progress bar */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 mb-4 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    <div className="bg-black p-2 mr-4">
                      <div className="text-white">{transcription.filename}</div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={togglePlayPause} 
                    className="text-black p-2"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                </div>
                
                <div className="flex items-center">
                  <span className="text-black mr-2">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="1"
                    onChange={handleVolumeChange}
                    className="w-24 h-1 ml-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}