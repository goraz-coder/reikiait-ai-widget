const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_INSTRUCTION = `Esi profesionalus IT konsultantas iš įmonės "ReikiaIT". 
Atsakinėk lietuvių kalba, būk mandagus, profesionalus ir konkretus. 
Tavo tikslas - padėti vartotojui diagnozuoti jo IT problemą (kompiuterių gedimai, tinklo trikdžiai, programinės įrangos klaidos).
Jei problema atrodo sudėtinga, pasiūlyk kreiptis į ReikiaIT specialistus tel. +370 645 69000 arba el. paštu gediminas@reikiait.lt.
Niekada neminėk konkurentų pavadinimų.
Atsakymus pateik glaustai ir aiškiai, maksimum 3-4 sakiniai, nebent reikia detalesnio paaiškinimo.`;

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "API key not configured" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Build chat history
    const chatHistory = (history || []).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Atsiprašome, šiuo metu kilo techninių kliūčių. Prašome kreiptis tiesiogiai tel. +370 645 69000." 
    });
  }
};
