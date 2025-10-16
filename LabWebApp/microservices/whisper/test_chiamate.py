import requests

url = "http://localhost:8000/transcribe"
file_path = "audio/audio_test1.wav"

print("🔄 Invio richiesta al server...")

try:
    with open(file_path, "rb") as f:
        response = requests.post(url, files={"audio": f})
        print("✅ Richiesta inviata, status code:", response.status_code)
        print("📄 Risposta:", response.text)

except requests.exceptions.ConnectionError:
    print("❌ ERRORE: impossibile connettersi al server FastAPI (è avviato?)")

except FileNotFoundError:
    print("❌ ERRORE: file audio non trovato! Controlla il percorso:", file_path)

except Exception as e:
    print("⚠️ Errore generico:", e)
