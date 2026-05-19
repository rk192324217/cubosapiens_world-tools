"use client"

import { useState } from "react"
import GameCard     from "@/components/ui/GameCard"
import type { Game } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"

interface Props {
  games:  Game[]
  genres: { key: string; label: string }[]
}

const GENRE_COLOR: Record<string, string> = {
  arcade:   "#ff6b00",
  puzzle:   "#4488ff",
  strategy: "#9b59ff",
  action:   "#ff3366",
  word:     "#00e5cc",
}

function genreColor(genre: string): string {
  return GENRE_COLOR[genre?.toLowerCase()] ?? "#00ff26"
}

export default function GamesFilter({ games, genres }: Props) {
  const [active,  setActive]  = useState("all")
  const [search,  setSearch]  = useState("")
  const [sortBy,  setSortBy]  = useState("popular")

  const filtered = games.filter(g => {
    const matchGenre  = active === "all" || g.genre === active
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
                        g.description.toLowerCase().includes(search.toLowerCase())
    return matchGenre && matchSearch
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "popular") {
      const aP = a.playCount || a.id * 314 + 500
      const bP = b.playCount || b.id * 314 + 500
      return bP - aP
    }
    if (sortBy === "featured") {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return 0
    }
    return a.name.localeCompare(b.name)
  })

  const live     = sorted.filter(g => g.isLive)
  const upcoming = sorted.filter(g => !g.isLive)
  const featured = games.find(g => g.isFeatured && g.isLive)
  const featuredPlays = featured ? (featured.playCount || 4280) : 0

  return (
    <div>
      {/* ── FEATURED SPOTLIGHT ───────────────────────────────── */}
      {featured && active === "all" && !search && (
        <Link href={`/games/${featured.slug}`} style={{ textDecoration: "none" }}>
          <div className="gs-spotlight">
            <div className="gs-spotlight-glow" />

            {/* Icon */}
            <div className="gs-spotlight-icon">
              {featured.icon.endsWith(".png") || featured.icon.endsWith(".svg") ? (
                <Image
                  src={`/icons/${featured.icon}`}
                  alt={featured.name}
                  width={100}
                  height={100}
                  style={{ borderRadius: 20, objectFit: "cover" }}
                  unoptimized
                />
              ) : (
                <span style={{ fontSize: 64 }}>{featured.icon}</span>
              )}
            </div>

            {/* Body */}
            <div className="gs-spotlight-body">
              <div className="gs-spotlight-label">
                <span>⭐</span> Featured Game
              </div>
              <h2 className="gs-spotlight-title">{featured.name}</h2>
              <p className="gs-spotlight-desc">{featured.description}</p>
              <div className="gs-spotlight-meta">
                <span
                  className="gs-spotlight-genre"
                  style={{
                    color: genreColor(featured.genre as string),
                    borderColor: genreColor(featured.genre as string) + "44",
                    background: genreColor(featured.genre as string) + "11",
                  }}
                >
                  {featured.genre}
                </span>
                <span className="gs-spotlight-plays">
                  🔥 {featuredPlays.toLocaleString()} plays
                </span>
                <span style={{ fontSize: 12, color: "#00ff26", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff26", display: "inline-block" }} />
                  Instant Play
                </span>
              </div>
              <span className="gs-spotlight-btn">▶ Play Now</span>
            </div>
          </div>
        </Link>
      )}

      {/* ── FILTER BAR ──────────────────────────────────────────── */}
      <div className="gs-filter-bar">
        {/* Genre pills */}
        <div className="gs-genre-pills">
          {genres.map(genre => (
            <button
              key={genre.key}
              className={`gs-pill ${active === genre.key ? "gs-pill-active" : ""}`}
              onClick={() => setActive(genre.key)}
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="gs-filter-right">
          <div className="gs-search-wrap">
            <span className="gs-search-icon">🔍</span>
            <input
              className="gs-search"
              placeholder="Search games..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="gs-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="popular">🔥 Most Popular</option>
            <option value="featured">⭐ Featured First</option>
            <option value="name">🔤 A–Z</option>
          </select>
        </div>
      </div>

      {/* ── COUNT BAR ───────────────────────────────────────────── */}
      <div className="gs-count-bar">
        <span>Showing {filtered.length} game{filtered.length !== 1 ? "s" : ""}{search ? ` for "${search}"` : ""}</span>
        <span style={{ display: "flex", gap: 16 }}>
          <span style={{ color: "#00ff26" }}>● {live.length} Live</span>
          {upcoming.length > 0 && <span>{upcoming.length} Upcoming</span>}
        </span>
      </div>

      {/* ── LIVE GAMES GRID ─────────────────────────────────────── */}
      {live.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div className="gs-section-head">
            <span className="gs-section-dot" style={{ background: "#00ff26", color: "#00ff26" }} />
            <span className="gs-section-label" style={{ color: "#fff" }}>Play Now</span>
          </div>
          <div className="gs-grid">
            {live.map((game, i) => <GameCard key={game.id} game={game} index={i} />)}
          </div>
        </div>
      )}

      {/* ── COMING SOON GRID ────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <div>
          <div className="gs-section-head">
            <span className="gs-section-label" style={{ color: "rgba(255,255,255,0.4)" }}>Coming Soon</span>
          </div>
          <div className="gs-grid">
            {upcoming.map((game, i) => <GameCard key={game.id} game={game} index={i} />)}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="gs-empty">
          <div className="gs-empty-icon">🎮</div>
          <h3>No games found</h3>
          <p>Try a different search or genre filter.</p>
          <button
            className="gs-empty-btn"
            onClick={() => { setActive("all"); setSearch("") }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}