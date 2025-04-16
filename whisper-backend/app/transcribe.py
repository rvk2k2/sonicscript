import whisper
import urllib.request
import os
import uuid

model = whisper.load_model("small")

def download_audio(url: str) -> str:
    filename = f"/tmp/{uuid.uuid4()}.mp3"
    urllib.request.urlretrieve(url, filename)
    return filename

def transcribe_from_url(url: str) -> str:
    file_path = download_audio(url)
    result = model.transcribe(file_path)
    os.remove(file_path)
    return result["text"]
