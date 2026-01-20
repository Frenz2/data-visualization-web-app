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

const captionRes = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "You are a data analyst specialized in chart interpretation."
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `
            Analyze this chart following these steps:

            1. Identify the chart type (line, bar, scatter, pie, etc.)
            2. Identify X and Y axes, including units and scale
            3. Identify all data series and legends
            4. Extract approximate numerical values where possible
            5. Describe trends, patterns, correlations, or anomalies
            6. Provide analytical insights (growth, decline, peaks, outliers)
            7. Explain the chart's main message in technical terms

            Be precise, structured, and analytical.
            Avoid generic descriptions.

            IMPORTANT:
            - If numerical values are not clearly readable, mark them as "uncertain"
            - Do NOT invent exact values
            - Use ranges if necessary
        `
        },
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

app.post("/image2text", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

  const filePath = req.file.path;

  try {
    const base64Image = fs.readFileSync(filePath, { encoding: "base64" });

    const captionRes = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "You are an expert computer vision assistant."
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `
                      Analyze this image in detail.

          Focus ONLY on elements that are actually visible.

          If the image contains:
          - people: describe appearance and actions
          - objects: list and describe them
          - text: transcribe it exactly (including language)
          - scenes: describe the environment and context
          - charts or diagrams: analyze them ONLY if clearly present

          Additionally, attempt to infer the possible geographic location of the scene
          using ONLY visual clues present in the image, such as:
          - language on signs or advertisements
          - street names, station names, or place names
          - architectural style
          - public transportation symbols or infrastructure
          - road signs, markings, or traffic conventions

          IMPORTANT RULES:
          - Location inference must be explicitly marked as an inference, not a fact
          - If no reliable clues are present, state that the location cannot be inferred
          - Do NOT guess or invent specific places
          - Provide reasoning for each hypothesis
          - Assign a confidence level (0 to 1) to any inferred location

          If a chart or diagram is NOT present, do NOT mention charts at all.
          Do NOT explain what is missing.
          Describe only what you can actually see and logically infer.

          Be precise, neutral, and structured.

        `
        },
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
    res.status(500).json({ error: "Errore image2text", detail: err.message });
  } finally {
    fs.unlink(filePath, () => {});
  }
});


app.listen(5005, () =>
  console.log(" Microservizio Chart2Text attivo su http://localhost:5005")
);
