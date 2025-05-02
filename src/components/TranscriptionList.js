import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function TranscriptionList({ transcriptions, selected, setSelected, onDelete }) {
  const [hoverFile, setHoverFile] = useState(null);

  const handleDelete = (e, fileId) => {
    e.stopPropagation();
    if (onDelete) onDelete(fileId);
  };

  return (
    <div className="space-y-4">
      {transcriptions.map((item) => (
        <div
          key={item.id}
          className="relative cursor-pointer py-2"
          onClick={() => setSelected(item)}
          onMouseEnter={() => setHoverFile(item.id)}
          onMouseLeave={() => setHoverFile(null)}
        >
          <div className={`${selected?.id === item.id ? 'text-white font-medium' : 'text-gray-300'}`}>
            {item.filename}
          </div>
          {hoverFile === item.id && (
            <button 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
              onClick={(e) => handleDelete(e, item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}