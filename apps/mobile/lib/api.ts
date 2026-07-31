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

export async function fetchTools(options?: { category?: string }): Promise<Tool[]> {
  try {
    const endpoint = options?.category 
      ? `${API_BASE}/api/tools?category=${options.category}` 
      : `${API_BASE}/api/tools`;

    const res = await fetch(endpoint, {
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Using fallback tools due to network/CORS block:", error);
    // Graceful fallback so your UI renders even if the edge worker blocks local browser testing
    return [
      { id: 1, name: "QR Generator", description: "Generate QR codes easily.", icon: "qrcode", isLive: true, slug: "qr-generator", category: "generator" },
      { id: 2, name: "PDF Merger", description: "Merge multiple PDFs into one.", icon: "file-pdf", isLive: false, slug: "pdf-merger", category: "pdf" },
    ];
  }
}

export async function fetchGames(): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE}/api/games`, {
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Using fallback games due to network/CORS block:", error);
    return [
      { id: 101, name: "Snake Game", description: "Classic retro snake game.", icon: "gamepad", isLive: true, slug: "snake", genre: "Arcade" },
    ];
  }
}