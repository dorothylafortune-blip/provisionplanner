// supabase/functions/suggest-meals/index.ts
//
// Supabase Edge Function that proxies meal suggestion requests to the Claude API.
// Running this server-side solves two problems:
//   1. CORS — the Claude API blocks direct browser requests
//   2. API key security — the key never reaches the client
//
// Deploy with: supabase functions deploy suggest-meals
// Set the secret with: supabase secrets set ANTHROPIC_API_KEY=your-key-here

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Forward the request to the Claude API
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-opus-4-5",
        max_tokens: 1000,
        messages: [{
          role:    "user",
          content: `You are a helpful meal planning assistant. Suggest meals based on: "${query}".

Respond ONLY with a valid JSON array of exactly 5 objects. No markdown, no explanation, just JSON.
Each object must have exactly these keys:
- "name": short meal name (string)
- "description": one sentence about the meal (string)  
- "ingredients": comma-separated main ingredients (string)

Example: [{"name":"Pasta","description":"Quick weeknight pasta.","ingredients":"pasta, garlic, olive oil"}]`,
        }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Claude API error ${claudeRes.status}: ${err}`);
    }

    const claudeData = await claudeRes.json();
    const text       = claudeData.content?.[0]?.text ?? "[]";

    // Parse and validate the JSON array before returning it
    const suggestions = JSON.parse(text);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("suggest-meals error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
