// ─────────────────────────────────────────────────────────────
// CUBOSAPIENS — API helper functions
// All calls to api.cubosapiens.world go through here
// ─────────────────────────────────────────────────────────────

import type { Tool, ApiResponse, CounterResponse } from "@/types"

// Base URL of your Hono API
// process.env.NEXT_PUBLIC_API_URL lets you change this
// in different environments (local vs production)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.cubosapiens.world"


// ── Fetch all tools ───────────────────────────────────────────
// Called on homepage to show the tool grid
// Optional filters: category, liveOnly

export async function fetchTools(options?: {
  category?: string
  liveOnly?: boolean
}): Promise<Tool[]>
{

  // Build URL with optional query params
  const params = new URLSearchParams()
  if(options?.category) params.set("category", options.category)
  if(options?.liveOnly) params.set("live", "true")

  const url = `${API_URL}/api/tools${params.toString() ? "?" + params.toString() : ""}`

  try
  {
    const res  = await fetch(url, {
      // next: { revalidate: 60 } means:
      // cache this response for 60 seconds
      // so not every page load hits the database
      next: { revalidate: 60 }
    })

    const data: ApiResponse<Tool[]> = await res.json()

    if(!data.success || !data.data) return []

    return data.data
  }
  catch(err)
  {
    console.error("fetchTools error:", err)
    return []
  }

}


// ── Fetch single tool ─────────────────────────────────────────
// Called on individual tool pages
// e.g. cubosapiens.world/tools/gps-cam

export async function fetchTool(slug: string): Promise<Tool | null>
{

  try
  {
    const res  = await fetch(`${API_URL}/api/tools/${slug}`, {
      next: { revalidate: 60 }
    })

    const data: ApiResponse<Tool> = await res.json()

    if(!data.success || !data.data) return null

    return data.data
  }
  catch(err)
  {
    console.error("fetchTool error:", err)
    return null
  }

}


// ── Fetch counters ────────────────────────────────────────────
// Called on homepage to show visitor count

export async function fetchCounters(): Promise<CounterResponse>
{

  try
  {
    const res  = await fetch(`${API_URL}/api/counter`, {
      next: { revalidate: 30 }  // refresh every 30 seconds
    })

    const data: CounterResponse = await res.json()

    return data
  }
  catch(err)
  {
    console.error("fetchCounters error:", err)
    return { success: false, visits: 0, downloads: 0 }
  }

}


// ── Track visit ───────────────────────────────────────────────
// Called client-side when user opens the site
// POST request — increments visit counter

export async function trackVisit(): Promise<void>
{

  try
  {
    await fetch(`${API_URL}/api/counter/visit`, {
      method: "POST"
    })
  }
  catch(err)
  {
    // Silently fail — not critical
    console.error("trackVisit error:", err)
  }

}

// ── Games ──────────────────────────────────────────────────────
export async function fetchGames(): Promise<Game[]> {

  try {
    const res = await fetch(`${API_URL}/api/games`)

    if (!res.ok) throw new Error("Failed to fetch games")

    const json = await res.json()
    return json.data || []
  }
  catch (err) {
    console.error("fetchGames error:", err)
    return []
  }

}

export async function fetchGame(slug: string): Promise<Game | null> {

  try {
    const res = await fetch(`${API_URL}/api/games/${slug}`)

    if (!res.ok) throw new Error("Game not found")

    const json = await res.json()
    return json.data || null
  }
  catch (err) {
    console.error("fetchGame error:", err)
    return null
  }

}


// ── Track download ────────────────────────────────────────────
// Called when user downloads a stamped photo

export async function trackDownload(): Promise<void>
{

  try
  {
    await fetch(`${API_URL}/api/counter/download`, {
      method: "POST"
    })
  }
  catch(err)
  {
    console.error("trackDownload error:", err)
  }

}