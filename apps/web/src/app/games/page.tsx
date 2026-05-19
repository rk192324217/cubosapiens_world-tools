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

      {/* ── PAGE HERO ───────────────────────────────────────────── */}
      <div style={{ padding: "48px 0 40px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "48px" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          fontSize: "10px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase",
          color: "var(--brand)", background: "rgba(0,255,38,0.05)", border: "1px solid rgba(0,255,38,0.2)",
          padding: "6px 16px", borderRadius: "99px", marginBottom: "20px"
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand)", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
          Play in Browser
        </span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 80px)", color: "#fff", lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "16px" }}>
          Games
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", maxWidth: "420px", lineHeight: 1.6 }}>
            Free browser games — no download, no sign-up.
          </p>
          <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
            <span style={{ padding: "6px 14px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
              {games.length} Total
            </span>
            <span style={{ padding: "6px 14px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, background: "rgba(0,255,38,0.1)", border: "1px solid rgba(0,255,38,0.3)", color: "var(--brand)", boxShadow: "0 0 12px rgba(0,255,38,0.15)" }}>
              {games.filter(g => g.isLive).length} Live Now
            </span>
          </div>
        </div>
      </div>

      <GamesFilter games={games} genres={genres} />

    </div>
  )
}