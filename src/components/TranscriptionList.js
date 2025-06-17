import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function TranscriptionList({ transcriptions, selected, setSelected, onDelete }) {
  const [hoverFile, setHoverFile] = useState(null);

  const handleDelete = (e, fileId) => {
    e.stopPropagation();
    if (onDelete) onDelete(fileId);
  };

return (
  <div className="space-y-3">
    {transcriptions.length === 0 ? (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-lg">📝</span>
        </div>
        <p className="text-white/80 font-medium mb-1">No transcriptions yet</p>
        <p className="text-white/60 text-sm">Upload your first audio file to get started</p>
      </div>
    ) : (
      transcriptions.map((item, index) => (
        <div
          key={item.id}
          className={`group relative cursor-pointer p-4 rounded-xl transition-all duration-300 border backdrop-blur-sm ${
            selected?.id === item.id 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400/50 shadow-lg text-white' 
              : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white/80 hover:text-white'
          }`}
          onClick={() => setSelected(item)}
          onMouseEnter={() => setHoverFile(item.id)}
          onMouseLeave={() => setHoverFile(null)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* File Number Badge */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors duration-300 ${
                selected?.id === item.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white'
              }`}>
                {index + 1}
              </div>
              
              {/* File Details */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate transition-colors duration-300 ${
                  selected?.id === item.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                }`}>
                  {item.filename}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  selected?.id === item.id ? 'text-white/80' : 'text-white/60'
                }`}>
                  {item.result ? '✓ Transcribed' : '⏳ Processing...'}
                </div>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center gap-2">
              {/* Status Dot */}
              <div className={`w-2 h-2 rounded-full ${
                item.result ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
              }`}></div>
              
              {/* Delete Button */}
              {hoverFile === item.id && (
                <button 
                  className="p-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-400/50 rounded-lg transition-all duration-300 hover:scale-110"
                  onClick={(e) => handleDelete(e, item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);
}