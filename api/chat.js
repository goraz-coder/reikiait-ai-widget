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
    // Try different API versions and models
    const attempts = [
      { version: 'v1beta', model: 'gemini-2.0-flash-exp' },
      { version: 'v1', model: 'gemini-pro' },
      { version: 'v1', model: 'gemini-1.5-flash' },
      { version: 'v1beta', model: 'gemini-1.5-flash-latest' },
      { version: 'v1beta', model: 'gemini-pro-latest' },
    ];

    let lastError = null;

    for (const { version, model } of attempts) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;

        const fullPrompt = `${SYSTEM_CONTEXT}\n\nVartotojo klausimas: ${message}\n\nTavo atsakymas:`;

        console.log(`Trying ${version}/${model}...`);

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
          console.log(`${version}/${model} failed:`, data.error.message);
          lastError = data.error.message;
          continue;
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          console.log(`Success with ${version}/${model}`);
          res.status(200).json({ response: text });
          return;
        }
      } catch (e) {
        console.log(`${version}/${model} threw error:`, e.message);
        lastError = e.message;
        continue;
      }
    }

    // All attempts failed
    throw new Error(lastError || "All models failed");

  } catch (error) {
    console.error("Gemini API Error:", error.message || error);
    res.status(500).json({
      error: "Atsiprašome, šiuo metu kilo techninių kliūčių. Prašome kreiptis tiesiogiai tel. +370 645 69000.",
      debug: error.message || "Unknown error"
    });
  }
};
