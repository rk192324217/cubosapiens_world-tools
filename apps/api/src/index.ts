import { validate } from "./middleware/validation"

import {
  toolQuerySchema,
  toolSlugSchema,
} from "./validations/tool.schema"

import {
  gameQuerySchema,
  gameSlugSchema,
} from "./validations/game.schema"

import { Hono }           from "hono"
import { cors }           from "hono/cors"
import { createClient }   from "@supabase/supabase-js"
// ─────────────────────────────────────────────────────────────
// Types — what our data looks like
// ─────────────────────────────────────────────────────────────

type Tool = {
  id:          number
  name:        string
  slug:        string
  description: string
  category:    string
  icon:        string
  url:         string
  isLive:      boolean
  isFeatured:  boolean
  usageCount:  number
  order:       number
  createdAt:   string
}

type Env = {
  SUPABASE_URL:           string
  SUPABASE_KEY:           string
  VISIT_COUNT:            number
  DOWNLOAD_COUNT:         number
  RATE_LIMIT_MAX?:        number
  RATE_LIMIT_WINDOW_MS?:  number
  WRITE_LIMIT_MAX?:       number
}

// ─────────────────────────────────────────────────────────────
// FIX 1: Atomic counter increment (compare-and-swap)
// Avoids the read-then-upsert race condition where two concurrent
// requests can read the same value and both write value+1,
// silently losing an increment. No Supabase console/SQL access
// needed — this works entirely through the JS client.
// ─────────────────────────────────────────────────────────────

async function incrementCounter(
  supabase: any,
  key: string,
  maxRetries = 5
): Promise<number> {
  for (let i = 0; i < maxRetries; i++) {
    const { data: current, error: readErr } = await supabase
      .from("Counter")
      .select("value")
      .eq("key", key)
      .maybeSingle()

    if (readErr) throw readErr

    const oldValue = current?.value ?? 0
    const newValue = oldValue + 1

    if (!current) {
      // Row doesn't exist yet — try to insert it.
      // If another request inserts first, this fails and we retry.
      const { error: insertErr } = await supabase
        .from("Counter")
        .insert({ key, value: newValue })

      if (!insertErr) return newValue
      continue
    }

    // Only update if the value is still what we read (compare-and-swap).
    const { data: updated, error: updateErr } = await supabase
      .from("Counter")
      .update({ value: newValue })
      .eq("key", key)
      .eq("value", oldValue)
      .select()

    if (updateErr) throw updateErr

    if (updated && updated.length > 0) {
      return newValue
    }
    // Someone else updated it concurrently — loop and retry.
  }

  throw new Error(`Could not increment counter "${key}" after ${maxRetries} retries`)
}

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>()


// ── CORS ──────────────────────────────────────────────────────
// Allows your frontend to call this API
// Without this the browser blocks the request

app.use("*", cors({
  origin: [
    "https://cubosapiens.world",
    "https://gps-cam.cubosapiens.world",
    "http://localhost:3000",    // for local development
    "http://localhost:3001",
  ],
  allowMethods: ["GET", "POST", "OPTIONS"],
}))


// ─────────────────────────────────────────────────────────────
// FIX 2 + FIX 3: Rate limiter
// - FIX 2: only trust CF-Connecting-IP (set by Cloudflare's edge,
//   not spoofable). The old fallback to X-Forwarded-For let a
//   client reset their own rate-limit bucket just by changing a
//   header on each request.
// - FIX 3: the in-memory Map is still per-isolate (a proper fix
//   needs a KV/Durable Object binding), but it now evicts expired
//   entries on every request instead of growing forever.
// ─────────────────────────────────────────────────────────────

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function cleanupExpiredEntries(now: number) {
  for (const [ip, record] of requestCounts) {
    if (now > record.resetAt) {
      requestCounts.delete(ip)
    }
  }
}

const rateLimiter = (limit: number, windowMs: number) => {
  return async (c: any, next: any) => {
    const ip = c.req.header("CF-Connecting-IP") ?? "unknown";

    const now = Date.now();

    // Periodic cleanup so the Map doesn't grow unbounded with
    // one-off IPs that never come back.
    if (Math.random() < 0.01) {
      cleanupExpiredEntries(now)
    }

    const record = requestCounts.get(ip);

    if (!record || now > record.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      c.header("X-RateLimit-Limit", String(limit));
      c.header("X-RateLimit-Remaining", String(limit - 1));
      return next();
    }

    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      console.warn(`[RateLimit] Blocked IP: ${ip} at ${new Date().toISOString()}`);
      c.header("Retry-After", String(retryAfter));
      c.header("X-RateLimit-Limit", String(limit));
      c.header("X-RateLimit-Remaining", "0");
      return c.json({
        success: false,
        error: `Too many requests. Please try again after ${retryAfter} seconds.`,
        data: null
      }, 429);
    }

    record.count++;
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(limit - record.count));
    return next();
  };
};

app.use("*", async (c: any, next: any) => {
  const limit = Number(c.env.RATE_LIMIT_MAX) || 100;
  const windowMs = Number(c.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  return rateLimiter(limit, windowMs)(c, next);
});

const writeLimit = (limit: number, windowMs: number) => rateLimiter(limit, windowMs);


// ── Health check ──────────────────────────────────────────────
// GET /
// Used to confirm the API is alive
// Visit api.cubosapiens.world/ to test

app.get("/", (c) => {
  return c.json({
    status:  "ok",
    message: "CUBOSAPIENS API is running",
    version: "1.0.0"
  })
})


// ── Get all tools ─────────────────────────────────────────────
// GET /api/tools
// Returns all tools from database
// Frontend uses this to show the tool grid on homepage
//
// Optional query params:
//   ?category=image    → filter by category
//   ?live=true         → only live tools
//
// Example: /api/tools?category=image&live=true

app.get(
  "/api/tools",
  validate("query", toolQuerySchema),

  async (c) =>  {

  // Create Supabase client using Worker env variables
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  // Read optional query params from URL
  const {
  category,
  live: liveOnly
  } = c.req.valid("query")

  // Start building the query
  // .from("Tool") → which table
  // .select("*")  → all columns
  let query = supabase
    .from("Tool")
    .select("*")
    .order("order", { ascending: true })  // sort by order column

  // Add filters only if provided
  if(category) query = query.eq("category", category)
  if(liveOnly === "true") query = query.eq("isLive", true)

  // Run the query
  const { data, error } = await query

  // If something went wrong in the database
  if(error)
  {
    return c.json({
      success: false,
      data:    null,
      error:   error.message
    }, 500)
  }

  // Return tools as JSON
  return c.json({
    success: true,
    data:    data as Tool[],
    error:   null
  })

})


// ── Get single tool ───────────────────────────────────────────
// GET /api/tools/:slug
// Returns one tool by its slug
// Example: /api/tools/gps-cam

app.get(
  "/api/tools/:slug",
  validate("param", toolSlugSchema),

  async (c) => {

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  // Get the slug from the URL
  // e.g. if URL is /api/tools/gps-cam then slug = "gps-cam"
  const {slug }= c.req.valid("param")

  const { data, error } = await supabase
    .from("Tool")
    .select("*")
    .eq("slug", slug)   // WHERE slug = 'gps-cam'
    .single()           // expect exactly one result

  if(error)
  {
    return c.json({
      success: false,
      data:    null,
      error:   "Tool not found"
    }, 404)
  }

  return c.json({
    success: true,
    data:    data as Tool,
    error:   null
  })

})


// ── Get counters ──────────────────────────────────────────────
// GET /api/counter
// Returns visit and download counts
// Homepage uses this to show the visitor counter

app.get("/api/counter", async (c) => {

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  // Get both counters in parallel (at the same time)
  // Promise.all = run both queries simultaneously, faster
  const [visitResult, downloadResult] = await Promise.all([
    supabase.from("Counter").select("value").eq("key", "visit_count").single(),
    supabase.from("Counter").select("value").eq("key", "download_count").single()
  ])

  return c.json({
    success:   true,
    visits:    visitResult.data?.value    || 0,
    downloads: downloadResult.data?.value || 0,
    error:     null
  })

})

// ══════════════════════════════════════════════════════════════
// GAMES
// ══════════════════════════════════════════════════════════════

// GET /api/games  — optional ?genre= and ?live=true
app.get(
  "/api/games",
  validate("query", gameQuerySchema),

  async (c) =>  {

  const {
  genre,
  live
} = c.req.valid("query")

const liveOnly = live === "true"

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  let query = supabase
    .from("Game")
    .select("*")
    .order("order", { ascending: true })

  if (genre) {
    query = query.eq("genre", genre)
  }

  if (liveOnly) {
    query = query.eq("isLive", true)
  }

  const { data, error } = await query

  if (error) {
    return c.json({ success: false, error: error.message }, 500)
  }

  return c.json({
    success: true,
    data: data
  })
})

// GET /api/games/:slug
app.get(
  "/api/games/:slug",
  validate("param", gameSlugSchema),

  async (c) => {

  const {slug} = c.req.valid("param")

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  const { data, error } = await supabase
    .from("Game")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return c.json({ success: false, error: "Not found" }, 404)
  }

  return c.json({
    success: true,
    data: data
  })
})

// ── Get all AI tools ──────────────────────────────────────────
// GET /api/ai
// Convenience route — equivalent to /api/tools?category=ai
// Returns only tools whose category is "ai", ordered by `order`
//
// Optional query params:
//   ?live=true   → only live AI tools
//
// FIX 4: now runs through the same validation as /api/tools
// instead of reading the raw query string directly, so malformed
// input gets a consistent 400 response instead of being silently
// ignored.

app.get(
  "/api/ai",
  validate("query", toolQuerySchema),

  async (c) => {

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  const { live: liveOnly } = c.req.valid("query")

  let query = supabase
    .from("Tool")
    .select("*")
    .eq("category", "ai")                     
    .order("order", { ascending: true })

  if (liveOnly === "true") query = query.eq("isLive", true)

  const { data, error } = await query

  if (error) {
    return c.json({
      success: false,
      data:    null,
      error:   error.message
    }, 500)
  }

  return c.json({
    success: true,
    data:    data as Tool[],
    error:   null
  })

})

// ── Increment visit counter ───────────────────────────────────
// POST /api/counter/visit
// Called once per session when user opens the site
// Uses incrementCounter() — see FIX 1 above — instead of a plain
// upsert, to avoid losing increments under concurrent requests.

app.post("/api/counter/visit", async (c: any, next: any) => {
  const limit = Number(c.env.WRITE_LIMIT_MAX) || 20;
  return writeLimit(limit, 15 * 60 * 1000)(c, next);
}, async (c) => {

  // Basic bot filter
  // User-Agent is a string the browser sends identifying itself
  // Bots like Googlebot send recognisable strings
  const ua    = c.req.header("User-Agent") || ""
  const isBot = /bot|crawler|spider|headless/i.test(ua)

  if(isBot)
  {
    return c.json({ ignored: true, reason: "bot" })
  }

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  try {
    const newValue = await incrementCounter(supabase, "visit_count")
    return c.json({
      success: true,
      visits:  newValue
    })
  } catch (err) {
    return c.json({
      success: false,
      error:   err instanceof Error ? err.message : "Failed to update counter"
    }, 500)
  }

})


// ── Increment download counter ────────────────────────────────
// POST /api/counter/download
// Called when user downloads a stamped photo

app.post("/api/counter/download", async (c: any, next: any) => {
  const limit = Number(c.env.WRITE_LIMIT_MAX) || 20;
  return writeLimit(limit, 15 * 60 * 1000)(c, next);
}, async (c) =>  {

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  try {
    const newValue = await incrementCounter(supabase, "download_count")
    return c.json({
      success:   true,
      downloads: newValue
    })
  } catch (err) {
    return c.json({
      success: false,
      error:   err instanceof Error ? err.message : "Failed to update counter"
    }, 500)
  }

})


export default app