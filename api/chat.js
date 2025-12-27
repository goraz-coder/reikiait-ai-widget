const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_CONTEXT = `Esi profesionalus IT konsultantas iš įmonės "ReikiaIT". 
Atsakinėk lietuvių kalba, būk mandagus, profesionalus ir konkretus. 
Tavo tikslas - padėti vartotojui diagnozuoti jo IT problemą (kompiuterių gedimai, tinklo trikdžiai, programinės įrangos klaidos).
Jei problema atrodo sudėtinga, pasiūlyk kreiptis į ReikiaIT specialistus tel. +370 645 69000 arba el. paštu gediminas@reikiait.lt.
Niekada neminėk konkurentų pavadinimų.
Atsakymus pateik glaustai ir aiškiai, maksimum 3-4 sakiniai, nebent reikia detalesnio paaiškinimo.`;

module.exports = async (req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message } = req.body || {};

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    res.status(500).json({ error: "API key not configured" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Combine system context with user message
    const fullPrompt = `${SYSTEM_CONTEXT}\n\nVartotojo klausimas: ${message}\n\nTavo atsakymas:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error.message || error);
    res.status(500).json({
      error: "Atsiprašome, šiuo metu kilo techninių kliūčių. Prašome kreiptis tiesiogiai tel. +370 645 69000.",
      debug: error.message || "Unknown error"
    });
  }
};
