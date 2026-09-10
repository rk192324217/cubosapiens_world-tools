// ─────────────────────────────────────────────────────────────────────────────
// CUBOSAPIENS — Cloudflare Worker
// Handles:
//   GET  /counter        → returns current photo count
//   POST /counter        → increments count by 1, returns new count
//
// Setup steps (do once in Cloudflare dashboard):
//   1. Workers & Pages → Create Worker → paste this file → Deploy
//   2. Worker Settings → Variables → KV Namespace Bindings
//      Variable name: COUNTER_KV
//      KV Namespace:  create one called "cubosapiens_kv"
//   3. Workers & Pages → your Pages project → Settings → Functions
//      Add same KV binding so Pages can call this Worker
// ─────────────────────────────────────────────────────────────────────────────

export default {

  async fetch(request, env)
  {

    // ── CORS — only allow your domain ──────────────────────
    // Change this to your actual domain after deploying
    const ALLOWED_ORIGIN = "https://cubosapiens.com"

    const corsHeaders = {
      "Access-Control-Allow-Origin":  ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }

    // Handle preflight
    if(request.method === "OPTIONS")
    {
      return new Response(null, { headers: corsHeaders })
    }

    const url    = new URL(request.url)
    const path   = url.pathname

    // ── GET /counter — fetch current count ─────────────────
    if(request.method === "GET" && path === "/counter")
    {

      try
      {
        const raw   = await env.COUNTER_KV.get("photo_count")
        const count = raw ? parseInt(raw) : 0

        return new Response(
          JSON.stringify({ count }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              // Cache for 30 seconds — reduces KV reads
              "Cache-Control": "public, max-age=30",
            }
          }
        )
      }
      catch(err)
      {
        return new Response(
          JSON.stringify({ count: 0, error: "KV read failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

    }

    // ── POST /counter — increment count ────────────────────
    if(request.method === "POST" && path === "/counter")
    {

      try
      {
        // Read → increment → write atomically enough for a counter
        const raw      = await env.COUNTER_KV.get("photo_count")
        const newCount = (raw ? parseInt(raw) : 0) + 1

        await env.COUNTER_KV.put("photo_count", String(newCount))

        return new Response(
          JSON.stringify({ count: newCount }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            }
          }
        )
      }
      catch(err)
      {
        return new Response(
          JSON.stringify({ error: "KV write failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

    }

    // ── 404 for everything else ─────────────────────────────
    return new Response("Not found", { status: 404, headers: corsHeaders })

  }

}
