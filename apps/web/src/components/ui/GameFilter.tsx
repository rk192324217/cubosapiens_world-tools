"use client"

import { useState }  from "react"
import GameCard      from "@/components/ui/GameCard"
import type { Game } from "@/lib/api"

interface Props {
  games:  Game[]
  genres: { key: string; label: string }[]
}

export default function GamesFilter({ games, genres }: Props)
{
  const [active, setActive] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = games.filter(g => {
    const matchGenre  = active === "all" || g.genre === active
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
                        g.description.toLowerCase().includes(search.toLowerCase())
    return matchGenre && matchSearch
  })

  const live     = filtered.filter(g => g.isLive)
  const upcoming = filtered.filter(g => !g.isLive)

  return (
    <>
      {/* Search */}
      <div className="tools-search-wrap">
        <input
          className="tools-search"
          placeholder="Search games..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Genre filter tabs */}
      <div className="filter-tabs">
        {genres.map(genre => (
          <button
            key={genre.key}
            className={`filter-tab ${active === genre.key ? "filter-tab-active" : ""}`}
            onClick={() => setActive(genre.key)}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="tools-count">
        {filtered.length} game{filtered.length !== 1 ? "s" : ""}
        {search ? ` matching "${search}"` : ""}
        {" · "}{live.length} live
      </p>

      {/* Live games */}
      {live.length > 0 && (
        <div style={{ marginBottom: "48px" }}>
          <div className="games-section-header" style={{ marginBottom: "20px" }}>
            <h2 className="games-section-title">
              <span className="games-live-dot" />
              Play Now
            </h2>
          </div>
          <div className="tool-grid">
            {live.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Coming soon games */}
      {upcoming.length > 0 && (
        <div>
          <div className="games-section-header" style={{ marginBottom: "20px" }}>
            <h2 className="games-section-title" style={{ color: "var(--text-muted)" }}>
              Coming Soon
            </h2>
          </div>
          <div className="tool-grid" style={{ opacity: 0.45 }}>
            {upcoming.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No games found</p>
          <span>Try a different search or genre</span>
        </div>
      )}
    </>
  )
}