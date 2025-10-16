
const bodyParser = require('body-parser');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;
const WHISPER_URL = process.env.WHISPER_URL || 'http://localhost:8000/transcribe';


// middleware
app.use(cors({
  origin: ['http://localhost:4200'] // modifica se necessario
}));
app.use(express.json());

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




app.listen(PORT, () => console.log(`Express API gateway running on http://localhost:${PORT}`));
