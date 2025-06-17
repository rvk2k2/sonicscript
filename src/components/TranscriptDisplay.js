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
  <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm">
    {/* File Content */}
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">📄</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{transcription.filename}</h1>
            <p className="text-white/60">Audio Transcription</p>
          </div>
        </div>
      </div>
      
      {/* Transcription Result */}
      <div className="mb-8">
        {transcription.result ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
              <h2 className="text-xl font-semibold text-white">Transcription</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {transcription.result.split('. ').map((chunk, idx) => (
                <p key={idx} className="px-4  rounded-xl text-white/90 leading-relaxed hover:bg-white/10 transition-colors duration-300">
                  {chunk.trim()}{chunk.trim() && !chunk.trim().endsWith('.') ? '.' : ''}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="text-yellow-400 font-medium text-lg mb-2">Processing Audio</div>
            <div className="text-yellow-400/60">Your transcription will appear here once complete</div>
          </div>
        )}
      </div>

      {/* Download Buttons */}
      {transcription.result && (
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => downloadAsPDF({
              filename: transcription.filename,
              text: transcription.result,
            })}
            className="group flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
          >
            <span className="text-xl">📄</span>
            <span className="font-medium">Download PDF</span>
          </button>
          <button
            onClick={() => downloadAsTxt({
              filename: transcription.filename,
              text: transcription.result,
            })}
            className="group flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <span className="text-xl">📝</span>
            <span className="font-medium">Download TXT</span>
          </button>
        </div>
      )}
    </div>

    {/* Enhanced Media Player */}
    {transcription.url && (
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        {/* Hidden audio/video element */}
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
        
        {/* Custom Player UI */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="relative mb-6">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer progress-bar"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #EC4899 ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* File Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="text-white font-medium truncate max-w-xs">
                  {transcription.filename}
                </div>
              </div>
              
              {/* Play/Pause Button */}
              <button 
                onClick={togglePlayPause} 
                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              >
                {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}
              </button>
            </div>
            
            {/* Time and Volume */}
            <div className="flex items-center gap-4">
              <span className="text-white/80 font-mono text-sm bg-white/10 px-3 py-1 rounded-full">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white/60">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  defaultValue="1"
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-white/10 rounded-full appearance-none cursor-pointer volume-slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #8B5CF6, #EC4899);
        border-radius: 3px;
      }
      .progress-bar::-webkit-slider-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: linear-gradient(45deg, #8B5CF6, #EC4899);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        appearance: none;
      }
      .volume-slider::-webkit-slider-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: linear-gradient(45deg, #8B5CF6, #EC4899);
        cursor: pointer;
        appearance: none;
      }
    `}</style>
  </div>
);
}