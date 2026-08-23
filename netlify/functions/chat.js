// netlify/functions/chat.js
//
// Keeps your OpenRouter API key private on the server, and forwards
// chat messages to it. The site's JavaScript never sees the key.

const PROVIDER = {
  name: "openrouter",
  model: "openrouter/free",
  endpoint: "https://openrouter.ai/api/v1/chat/completions",
  apiKeyEnvVar: "OPENROUTER_API_KEY"
};

const SUPABASE_URL = "https://ausbxxfnudnzwgpsbffg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WvWVOGkFWygmCfseIQyFIg_kxQ56-id";

const BASE_SYSTEM_PROMPT = `You are the shop assistant for Daniel Threads, a luxury fashion store based in Lagos, Nigeria.

What you can help with: product categories (tailoring, dresses, tops, trousers, outerwear, shoes, bags, accessories), general sizing guidance, delivery (typically within 48 hours in Lagos), and payment methods (Bank Transfer, Cash on Delivery, or Card at Pickup — there is no online card payment on the site itself).

Tone: warm, concise, confident — a helpful boutique assistant, not a generic corporate bot.

Important: if you don't know the exact answer (specific stock levels, exact return/exchange policy, order status, exact pricing), say so honestly and direct the customer to contact the store directly rather than guessing or inventing an answer.`;

async function fetchBusinessInfo() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/chatbot_settings?select=business_info&id=eq.1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) return "";
    const rows = await res.json();
    return (rows && rows[0] && rows[0].business_info) || "";
  } catch (e) {
    return "";
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  const apiKey = process.env[PROVIDER.apiKeyEnvVar];
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "not_configured",
        message: "The shop assistant isn't set up yet. Add an OPENROUTER_API_KEY environment variable in Netlify (Site settings → Environment variables) and redeploy."
      })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_json" }) };
  }

  const userMessages = Array.isArray(payload.messages) ? payload.messages.slice(-10) : [];
  if (!userMessages.length) {
    return { statusCode: 400, body: JSON.stringify({ error: "no_messages" }) };
  }

  const businessInfo = await fetchBusinessInfo();
  const systemPrompt = businessInfo
    ? `${BASE_SYSTEM_PROMPT}\n\nAdditional details from the store owner — treat these as accurate and current:\n${businessInfo}`
    : BASE_SYSTEM_PROMPT;

  try {
    const response = await fetch(PROVIDER.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://danielthreads.netlify.app",
        "X-Title": "Daniel Threads Fashion Store"
      },
      body: JSON.stringify({
        model: PROVIDER.model,
        messages: [{ role: "system", content: systemPrompt }, ...userMessages],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const isRateLimit = response.status === 429;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: isRateLimit ? "rate_limited" : "provider_error",
          message: isRateLimit
            ? "We've hit today's free chat limit — please try again tomorrow, or reach us directly using the contact details in the footer."
            : "The shop assistant is having trouble right now — please try again in a moment."
        })
      };
    }

    const data = await response.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : null;
    if (!reply) {
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "empty_reply", message: "Sorry, I didn't catch that — could you try asking again?" }) };
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply }) };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "network_error", message: "Couldn't reach the shop assistant — please try again in a moment." })
    };
  }
};
