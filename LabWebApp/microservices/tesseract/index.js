const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/ocr", upload.single("image"), async (req, res) => {
    try {
        const imagePath = req.file.path;
        console.log("📄 Elaborazione OCR:", imagePath);

        const { data: { text } } = await Tesseract.recognize(imagePath, "eng");

        fs.unlinkSync(imagePath); // cancella file temporaneo
        res.json({ text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Errore durante l’OCR" });
    }
});

app.listen(5000, () => {
    console.log("✅ Microservizio Tesseract in ascolto su http://localhost:5000");
});
