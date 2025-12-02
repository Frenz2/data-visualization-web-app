/**
 * Script di test per il microservizio OpenAI Dashboard
 * ----------------------------------------------------
 * Questo script invia un testo al tuo endpoint Express:
 *    POST http://localhost:3000/api/ai/dashboard
 * Il server chiamerà OpenAI usando function calling e
 * ti restituisce i dati già strutturati per i grafici.
 */

// Importo axios per fare richieste HTTP
const axios = require("axios");

// URL del tuo servizio Express
const API_URL = "http://localhost:3000/api/ai/dashboard";

// Testo di esempio (puoi cambiarlo a piacere)
const testText = `
L'analisi mostra che il 55% degli utenti preferisce bere il latte senza caffè,
mentre il 45% preferisce bere il latte con caffè.
Il trend delle persone che bevono il latte senza caffè è in aumento del 20%
nell'arco di due anni.

`;

// Funzione che esegue il test
async function runTest() {
  try {
    console.log("📤 Invio richiesta al microservizio...");

    // Chiamata POST
    const response = await axios.post(
      API_URL,
      { text: testText },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("📥 Risposta ricevuta con successo!\n");

    // Stampa la risposta formattata
    console.log("🧩 Dati strutturati restituiti:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("\n❌ Errore durante la richiesta:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Avvio del test
runTest();
