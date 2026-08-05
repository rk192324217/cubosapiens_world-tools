// apps/mobile/lib/api.ts

const API_BASE = "https://api.cubosapiens.world";

export interface Tool {
  id: string | number;
  name: string;
  description: string;
  icon: string;
  isLive: boolean;
  slug: string;
  category: string;
  url?: string;
}

export interface Game {
  id: string | number;
  name: string;
  description: string;
  icon: string;
  isLive: boolean;
  slug: string;
  genre: string;
  url?: string;
}

export async function fetchTools(options?: { category?: string }): Promise<Tool[]>
{
  try
  {
    const endpoint = options?.category
      ? `${API_BASE}/api/tools?category=${options.category}`
      : `${API_BASE}/api/tools`

    const res  = await fetch(endpoint)
    const json = await res.json()
    return json.data || json || []
  }
  catch(error)
  {
    console.warn("fetchTools error:", error)
    return []
  }
}

export async function fetchGames(): Promise<Game[]>
{
  try
  {
    const res  = await fetch(`${API_BASE}/api/games`)
    const json = await res.json()
    return json.data || json || []
  }
  catch(error)
  {
    console.warn("fetchGames error:", error)
    return []
  }
}