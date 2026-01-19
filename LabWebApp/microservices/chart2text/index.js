import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Directory per salvataggio risultati
const resultsDir = path.join(process.cwd(), "results");
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

app.post("/chart2text", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

  const filePath = req.file.path;

  try {
    console.log("Invio immagine a GPT-4o");

    // Leggi immagine
    const base64Image = fs.readFileSync(filePath, { encoding: "base64" });

    // Caption inglese
    const captionRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this chart in detail in English.  " },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64Image}` }
            }
          ]
        }
      ]
    });

    const captionEn = captionRes.choices[0].message.content.trim();

    // Traduzione in italiano
    const translateRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional technical translator." },
        { role: "user", content: `Translate this to Italian:\n\n${captionEn}` }
      ]
    });

    const captionIt = translateRes.choices[0].message.content.trim();

    //Riassunto opzionale
    const summaryRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Riassumi in modo tecnico e conciso." },
        { role: "user", content: captionIt }
      ]
    });

    const summaryIt = summaryRes.choices[0].message.content.trim();

    //  Salvataggio
    const timestamp = Date.now();
    const savePath = path.join(resultsDir, `chart2text_${timestamp}.json`);

    const resultData = {
      timestamp,
      caption_en: captionEn,
      caption_it: captionIt,
      summary_it: summaryIt
    };

    fs.writeFileSync(savePath, JSON.stringify(resultData, null, 2));

    console.log("Risultato salvato in:", savePath);

    // Risposta FE
    res.json({
      success: true,
      caption_en: captionEn,
      caption_it: captionIt,
      summary_it: summaryIt,
      saved_file: savePath
    });

  } catch (err) {
    console.error("Errore:", err);
    res.status(500).json({ error: "Errore durante chart2text", detail: err.message });
  } finally {
    fs.unlink(filePath, () => {});
  }
});

app.listen(5005, () =>
  console.log(" Microservizio Chart2Text attivo su http://localhost:5005")
);
