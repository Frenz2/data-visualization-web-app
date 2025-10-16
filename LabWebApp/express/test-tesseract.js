const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testOCR() {
  const imagePath = "../microservices/tesseract/immages/test-img1.png";
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));

  try {
    console.log("📤 Invio immagine a Express (porta 3000)...");
    const res = await axios.post('http://localhost:3000/api/ocr', form, {
      headers: form.getHeaders(),
    });
    console.log("✅ Risposta OCR:", res.data);
  } catch (err) {
    console.error("❌ Errore:", err.message);
  }
}

testOCR();
