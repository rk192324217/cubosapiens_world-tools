import { fetchGames }  from "@/lib/api"
import GamesFilter     from "@/components/ui/GameFilter"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:       "Games - Cubosapiens",
  description: "Free browser games — no download. Play instantly on CUBOSAPIENS.",
  keywords:    ["free online games", "browser games", "CUBO SNAKE", "Virtual Games", "Pong CV", "Chess", "AI GAMES", "free games", "AI tools", "cubosapiens", "2 Player Games", "Multiplayer", "Arcade" ,"Puzzle","Strategy","Action","Word","Action", "CUBO", "cubo", "cubos"],
  authors:     [{ name: "Games - Cubosapiens", url: "https://cubosapiens.world/games" }],
  creator:     "CUBOSAPIENS",
  metadataBase: new URL("https://cubosapiens.world/games"),
  alternates: {
    canonical: "https://cubosapiens.world/games",
  },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://cubosapiens.world/games",
    siteName:    "CUBOSAPIENS",
    title:       "CUBOSAPIENS — Free games, Games & AI in One Place",
    description: "Free browser games for everyone. No cost. Just open and play.",
    images: [{
      url:    "https://cubosapiens.world/og-image.png",
      width:  1200,
      height: 630,
      alt:    "CUBOSAPIENS — Free games",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "CUBOSAPIENS - games in One Place",
    description: "Free browser games for everyone. Unlimited play. No cost.",
    images:      ["https://cubosapiens.world/og-image.png"],
  },
  robots: {
    index:               true,
    follow:              true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-image-preview":   "large",
      "max-snippet":         -1,
      "max-video-preview":   -1,
    },
  },
}


export default async function GamesPage()
{
  const games = await fetchGames()

  const genres = [
    { key: "all",      label: "All"      },
    { key: "arcade",   label: "Arcade"  },
    { key: "puzzle",   label: "Puzzle"  },
    { key: "strategy", label: "Strategy" },
    { key: "action",   label: "Action"  },
    { key: "word",     label: "Word"    },
  ]

  return (
    <div className="page-container">

      <div className="page-hero">
        <span className="section-tag">Play in browser</span>
        <h1 className="page-hero-title">Games</h1>
        <p className="page-hero-sub">
          {games.length} games · {games.filter(g => g.isLive).length} live · no download, no signup
        </p>
      </div>

      <GamesFilter games={games} genres={genres} />

    </div>
  )
}