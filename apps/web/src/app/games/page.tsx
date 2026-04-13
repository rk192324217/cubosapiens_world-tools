import { fetchGames }  from "@/lib/api"
import GamesFilter     from "@/components/ui/GameFilter"

export const metadata = {
  title:       "Games — CUBOSAPIENS",
  description: "Free browser games — no download, no signup. Play instantly on CUBOSAPIENS.",
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