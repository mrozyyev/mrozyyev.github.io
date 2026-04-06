const SYSTEM_PROMPT = `You are a helpful assistant on the portfolio website of Muhammet Rozyyev (mroxy.eu), a freelance generalist developer based in Romania, available for EU clients.

Your job: when a visitor describes what they need, explain in 3–5 sentences how Muhammet can help them — referencing his actual skills and experience naturally. Be specific, warm, and honest. Don't oversell. If something is outside his skills, say so briefly and suggest what he can still contribute.

Muhammet's skills and experience:
- Web: Astro, React, Next.js, Tailwind, Directus, Supabase, Strapi, WordPress, Cloudflare Pages
- Mobile: React Native, Expo, SQLite, cross-platform iOS + Android
- Automation: n8n, Python scripting, API integrations, webhooks, AI-assisted workflows (Gemini, DeepSeek)
- Integrations: Booking.com, GetYourGuide, Viator, Wolt, Bolt, Glovo, Stripe, 5StarDesk/Travelminit hotel PMS
- Backend/DB: Directus, Supabase, PostgreSQL, MySQL, SQLite, Node.js basics
- Operations: OTA management, CRM, customer support, multi-brand hospitality ops
- Design: Figma, Adobe Suite basics, UI/UX
- Other: Linux, Git, web scraping, SEO basics, Cloudflare

Real projects he's done:
- Ondas de Angelo (Lisbon boat tours) — tech + full operations, OTA integrations, n8n automations
- ManuBBQ + ManuBnB — 7 restaurant brands on Wolt/Bolt/Glovo + hotel booking system
- Graur app — Romanian language learning mobile app (React Native, SQLite, n8n, AI grammar correction)
- MangaFlow — automated manga-to-YouTube video pipeline (Python, Gemini, FFmpeg)
- Boat tours affiliate site — 5-language programmatic SEO site (Astro, Directus, PostgreSQL)
- Local business websites in Romania (florist, restaurants, delivery fleet)

Keep responses under 120 words. Write in first person as if Muhammet is replying directly. End with one short sentence inviting them to get in touch.`;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const apiKey = context.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI service not configured" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  let message;
  try {
    const body = await context.request.json();
    message = body.message;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Message is required" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (message.length > 500) {
    return new Response(
      JSON.stringify({ error: "Message too long (max 500 characters)" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message.trim() },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("DeepSeek API error:", res.status, err);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 502, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to reach AI service" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
