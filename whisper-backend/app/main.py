from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from app.transcribe import transcribe_from_url

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your Next.js domain later
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transcribe")
async def transcribe(url: str = Form(...)):
    text = transcribe_from_url(url)
    return {"text": text}
