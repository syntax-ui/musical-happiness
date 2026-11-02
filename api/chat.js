// ========== DANIEL THREADS CHATBOT API ==========
// Runs on Vercel's server. Reads the OpenRouter key from the
// OPENROUTER_API_KEY environment variable, and the store details
// from Supabase. Neither secret lives in this file.

const SUPABASE_URL = "https://ausbxxfnudnzwgpsbffg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WvWVOGkFWygmCfseIQyFIg_kxQ56-id";

const BASE_PROMPT = "You are the shop assistant for Daniel Threads, a luxury fashion store in Lagos, Nigeria. Be warm, concise, and honest. Delivery is usually within 48 hours in Lagos. Payment: bank transfer, cash on delivery, or card at pickup. If you don't know something, such as stock, exact returns policy, or order status, say so and suggest contacting the store.";

async function fetchBusinessInfo() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/chatbot_settings?select=business_info&id=eq.1`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return "";
    const rows = await res.json();
    return (rows && rows[0] && rows[0].business_info) || "";
  } catch (e) {
    return "";
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Chatbot key is missing on the server." });
  }

  const messages = (req.body && req.body.messages) || [];
  if (!messages.length) {
    return res.status(400).json({ error: "No messages sent." });
  }

  const businessInfo = await fetchBusinessInfo();
  const systemPrompt = businessInfo
    ? `${BASE_PROMPT}\n\nAdditional details from the store owner. Treat these as accurate and current:\n${businessInfo}`
    : BASE_PROMPT;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://musical-happiness-five.vercel.app",
        "X-Title": "Daniel Threads Fashion Store",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-10)],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || "The shop assistant is having trouble right now.";
      return res.status(502).json({ error: msg });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "Sorry, I didn't catch that. Try asking again." });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Couldn't reach the shop assistant. Try again shortly." });
  }
}
