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
    // Try different models in order of preference
    const models = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    let lastError = null;

    for (const modelName of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const fullPrompt = `${SYSTEM_CONTEXT}\n\nVartotojo klausimas: ${message}\n\nTavo atsakymas:`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        });

        const data = await response.json();

        if (data.error) {
          console.log(`Model ${modelName} failed:`, data.error.message);
          lastError = data.error.message;
          continue;
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          console.log(`Success with model: ${modelName}`);
          res.status(200).json({ response: text });
          return;
        }
      } catch (e) {
        console.log(`Model ${modelName} threw error:`, e.message);
        lastError = e.message;
        continue;
      }
    }

    // All models failed
    throw new Error(lastError || "All models failed");

  } catch (error) {
    console.error("Gemini API Error:", error.message || error);
    res.status(500).json({
      error: "Atsiprašome, šiuo metu kilo techninių kliūčių. Prašome kreiptis tiesiogiai tel. +370 645 69000.",
      debug: error.message || "Unknown error"
    });
  }
};
