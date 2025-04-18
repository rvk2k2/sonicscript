export default function TranscriptionList({ transcriptions, selected, setSelected }) {
    return (
      <div className="space-y-2">
        {transcriptions.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
              selected?.id === item.id ? "bg-gray-300 font-semibold" : ""
            }`}
          >
            {item.filename}
          </div>
        ))}
      </div>
    );
  }
  