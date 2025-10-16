# microservices/whisper/app.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import tempfile, shutil, os
from faster_whisper import WhisperModel

import os

app = FastAPI(title="Whisper Microservice")

# Consenti richieste da Angular/Express
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carica modello una volta sola all'avvio
MODEL_SIZE = os.getenv("WHISPER_MODEL", "small")  # tiny, base, small, medium, large
DEVICE = "cuda" if os.getenv("USE_CUDA", "0") == "1" else "cpu"
model = WhisperModel(MODEL_SIZE, device=DEVICE)

@app.get("/health")
async def health():
    return {"status": "ok", "model_size": MODEL_SIZE, "device": DEVICE}
"""
async def save_upload_tmp(upload_file: UploadFile) -> str:
    suffix = Path(upload_file.filename).suffix or ".wav"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return tmp_path

@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    translate: bool = Form(False),
    language: str = Form(None)
):
    tmp_path = await save_upload_tmp(audio)
    try:
        segments, info = model.transcribe(
            tmp_path,
            beam_size=5,
            language=language,
            vad_filter=True
        )
        text = "".join([s.text for s in segments])
        return {
            "text": text,
            "segments": [{"start": s.start, "end": s.end, "text": s.text} for s in segments],
            "runtime": info
        }
    finally:
        try:
            os.remove(tmp_path)
        except:
            pass
"""

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        print(f"🔄 Ricevuto file: {audio.filename}")

        # Salva temporaneamente il file audio
        temp_path = f"temp_{audio.filename}"
        with open(temp_path, "wb") as f:
            f.write(await audio.read())
        print(f"💾 File salvato temporaneamente: {temp_path}")

        # Esegui la trascrizione
        print("⏳ Inizio trascrizione...")
        segments, info = model.transcribe(temp_path)
        text = " ".join([segment.text for segment in segments])
        print(f"✅ Trascrizione completata. Testo parziale: {text[:50]}...")

        # Rimuovi il file temporaneo
        os.remove(temp_path)
        print(f"🗑️ File temporaneo rimosso: {temp_path}")

        return {
            "language": info.language,
            "duration": info.duration,
            "text": text
        }

    except Exception as e:
        print(f"❌ Errore durante la trascrizione: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
