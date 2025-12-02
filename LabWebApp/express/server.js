// SERVER.JS aggiornato per ES Modules
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';

// --- Variabili per __dirname in ES Module ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const WHISPER_URL = process.env.WHISPER_URL || 'http://localhost:8000/transcribe';

// ✅ Middleware
app.use(cors({ origin: ['http://localhost:4200'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer storage (temp)
const upload = multer({
  dest: path.join(__dirname, 'tmp/'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Route di test
app.get('/', (req, res) => {
    res.send('Backend Express funzionante!');
});

// Avvio server
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});

// route: health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

//WHISPER

// route: transcribe (riceve file da Angular e lo inoltra a Whisper)
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = req.file.path;
  try {
    // prepara form-data per Whisper
    const form = new FormData();
    form.append('audio', fs.createReadStream(filePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    // opzioni addizionali (model size, language ecc.)
    form.append('model_size', req.body.model_size || 'small');
    if (req.body.language) form.append('language', req.body.language);

    const headers = form.getHeaders();

    // forward request a whisper
    const response = await axios.post(WHISPER_URL, form, {
      headers: {
        ...headers
      },
      timeout: parseInt(process.env.WHISPER_TIMEOUT_MS || '120000') // 2 min
    });

    // ritorna la risposta di whisper ad Angular
    res.json(response.data);
  } catch (err) {
    console.error('Error forwarding to Whisper:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Error transcribing audio', detail: err?.response?.data || err.message });
  } finally {
    // pulizia file temporaneo
    fs.unlink(filePath, (e) => { if (e) console.warn('Errore rimuovendo file tmp:', e.message); });
  }
});

//TESSERACT

// 🧠 TESSERACT - Inoltra immagine al microservizio OCR
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file immagine caricato' });
  }

  const filePath = req.file.path;

  try {
    // prepara il form-data da inviare al microservizio OCR
    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));

    const response = await axios.post('http://localhost:5000/ocr', form, {
      headers: form.getHeaders(),
      timeout: 60000 // 60s timeout
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ Errore chiamando OCR:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Errore durante la chiamata OCR',
      detail: error.response?.data || error.message
    });
  } finally {
    // elimina il file temporaneo
    fs.unlink(filePath, (err) => {
      if (err) console.warn('Errore eliminando file tmp:', err.message);
    });
  }
});

//Text-To-Graph
// 🧠 OPENAI - Function Calling per estrarre dati per dashboard
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// definizione della funzione che OpenAI deve rispettare
export const extractDashboardFunction = {
  name: "extract_dashboard_data",
  description: "Estrae dati percentuali e trend temporali da un testo descrittivo per creare dashboard",
  parameters: {
    type: "object",
    properties: {
      chartData: {
        description: "Array dei dati percentuali correnti, ogni elemento rappresenta un'opzione con la sua percentuale",
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "Nome della categoria / prodotto / opzione" },
            value: { type: "number", description: "Valore percentuale associato alla categoria (0-100)" }
          },
          required: ["label", "value"]
        }
      },

      // Trend multipli
      trend: {
        description: "Trend temporale di una categoria, array di valori storici",
        type: "array",
        items: {
          type: "object",
          properties: {
            product: { type: "string", description: "Nome della categoria / prodotto" },
            value: { type: "number", description: "Percentuale per quel periodo" },
            time_period: { type: "string", description: "Periodo di tempo (es. '2 anni fa', '1 anno fa')" }
          },
          required: ["product", "value", "time_period"]
        }
      }
    },
    required: ["chartData"]
  }
};



// ROUTE: AI Dashboard extraction (aggiornata)
app.post("/api/ai/dashboard", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text field" });
    }

    // ✅ System prompt ottimizzato con few-shot
const systemPrompt = `
Sei un parser specializzato nell'estrazione di dati da testo per dashboard. 
Devi restituire SOLO JSON conforme a questo schema:

- chartData: array di categorie con label (nome) e value (percentuale)
- trend: opzionale, ma se presente include un array di valori storici:
    - product: nome della categoria
    - value: percentuale per quel periodo
    - time_period: periodo di tempo (es. '2 anni fa', '1 anno fa')

Regole:
1. Non restituire testo libero, solo JSON.
2. Percentuali devono essere numeri (0-100).
3. chartData è obbligatorio, trend opzionale ma completo se disponibile.

Esempi di input → output JSON (few-shot):

Input: "Il 60% degli utenti preferisce il prodotto A, il 40% il prodotto B. Il trend del prodotto A è 45% 3 mesi fa, 50% 2 mesi fa, 60% ora."
Output:
{
  "chartData": [
    { "label": "Prodotto A", "value": 60 },
    { "label": "Prodotto B", "value": 40 }
  ],
  "trend": [
    { "product": "Prodotto A", "value": 45, "time_period": "3 mesi fa" },
    { "product": "Prodotto A", "value": 50, "time_period": "2 mesi fa" },
    { "product": "Prodotto A", "value": 60, "time_period": "Oggi" }
  ]
}

Input: "Il 55% degli utenti beve latte senza caffè, il 45% con caffè. Il trend del latte senza caffè è 40% 2 anni fa, 45% 1 anno fa, 50% 6 mesi fa, 55% oggi."
Output:
{
  "chartData": [
    { "label": "Latte senza caffè", "value": 55 },
    { "label": "Latte con caffè", "value": 45 }
  ],
  "trend": [
    { "product": "Latte senza caffè", "value": 40, "time_period": "2 anni fa" },
    { "product": "Latte senza caffè", "value": 45, "time_period": "1 anno fa" },
    { "product": "Latte senza caffè", "value": 50, "time_period": "6 mesi fa" },
    { "product": "Latte senza caffè", "value": 55, "time_period": "Oggi" }
  ]
}

Fine degli esempi. Ora processa l'input fornito dall'utente e restituisci JSON conforme.
`;


    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      functions: [extractDashboardFunction],
      function_call: { name: "extract_dashboard_data" },
      temperature: 0
    });

    // ✅ Parsing sicuro della funzione
    const functionCall = response.choices?.[0]?.message?.function_call;
    let parsedData = null;

    if (functionCall?.arguments) {
      try {
        parsedData = JSON.parse(functionCall.arguments);
      } catch (err) {
        console.warn("Errore parsing JSON da OpenAI:", err.message);
        // fallback: invia l'output raw
        parsedData = { raw: functionCall.arguments };
      }
    }

    return res.json({ ok: true, data: parsedData });

  } catch (error) {
    console.error("Errore OpenAI:", error.response?.data || error.message);
    res.status(500).json({
      error: "Errore chiamando OpenAI",
      detail: error.response?.data || error.message
    });
  }
});



/* app.listen(PORT, () => console.log(`Express API gateway running on http://localhost:${PORT}`));
 */