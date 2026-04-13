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
  SUPABASE_URL:      string   // Cloudflare Worker env variable
  SUPABASE_KEY:      string   // Cloudflare Worker env variable
  VISIT_COUNT:       number
  DOWNLOAD_COUNT:    number
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

app.get("/api/tools", async (c) => {

  // Create Supabase client using Worker env variables
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  // Read optional query params from URL
  const category = c.req.query("category")  // e.g. "image"
  const liveOnly = c.req.query("live")      // e.g. "true"

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

app.get("/api/tools/:slug", async (c) => {

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  )

  // Get the slug from the URL
  // e.g. if URL is /api/tools/gps-cam then slug = "gps-cam"
  const slug = c.req.param("slug")

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
app.get("/api/games", async (c) => {

  const genre    = c.req.query("genre")
  const liveOnly = c.req.query("live") === "true"

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
app.get("/api/games/:slug", async (c) => {

  const slug = c.req.param("slug")

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

// ── Increment visit counter ───────────────────────────────────
// POST /api/counter/visit
// Called once per session when user opens the site
// Uses upsert — inserts if not exists, updates if exists

app.post("/api/counter/visit", async (c) => {

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

app.post("/api/counter/download", async (c) => {

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