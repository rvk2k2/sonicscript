import UploadForm from "../components/UploadForm";

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Transcription Dashboard</h1>
      <UploadForm />
    </div>
  );
}
