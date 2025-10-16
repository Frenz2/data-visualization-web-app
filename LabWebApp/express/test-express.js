// test-express.js
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const EXPRESS_URL = "http://localhost:3000/api/transcribe"; // endpoint Express

async function testTranscription() {
  try {
    console.log("🎧 Inizio test di upload verso Express...");

    // Percorso locale del file audio da testare
    const audioPath = "../microservices/whisper/audio/audio_test1.wav"; // cambia con il tuo file!
    

    if (!fs.existsSync(audioPath)) {
      console.error("❌ File audio non trovato:", audioPath);
      process.exit(1);
    }

    const form = new FormData();
    form.append("audio", fs.createReadStream(audioPath));
    form.append("model_size", "small");

    console.log("📡 Invio richiesta a Express...");
    const res = await axios.post(EXPRESS_URL, form, {
      headers: form.getHeaders(),
      timeout: 120000 // 2 minuti
    });

    console.log("✅ Risposta ricevuta da Express:");
    console.log(res.data);

  } catch (err) {
    console.error("❌ Errore durante il test:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testTranscription();
