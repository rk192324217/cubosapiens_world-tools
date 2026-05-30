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


    const requestCounts = new Map<string, { count: number; resetAt: number }>();

const rateLimiter = (limit: number, windowMs: number) => {
  return async (c: any, next: any) => {
    const ip = c.req.header("CF-Connecting-IP") ?? 
               c.req.header("X-Forwarded-For") ?? 
               "unknown";
    
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
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

app.get("/api/ai", async (c) => {

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  const liveOnly = c.req.query("live")

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
// Uses upsert — inserts if not exists, updates if exists

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

  // Read current value
  const { data } = await supabase
    .from("Counter")
    .select("value")
    .eq("key", "visit_count")
    .single()

  const newValue = (data?.value || 0) + 1

  // Upsert = update if exists, insert if not
  await supabase
    .from("Counter")
    .upsert({ key: "visit_count", value: newValue })

  return c.json({
    success: true,
    visits:  newValue
  })

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

  const { data } = await supabase
    .from("Counter")
    .select("value")
    .eq("key", "download_count")
    .single()

  const newValue = (data?.value || 0) + 1

  await supabase
    .from("Counter")
    .upsert({ key: "download_count", value: newValue })

  return c.json({
    success:   true,
    downloads: newValue
  })

})


export default app