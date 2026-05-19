"use client"
import Link        from "next/link"
import type { Game } from "@/lib/api"
import Image from "next/image"

interface GameCardProps {
  game:  Game
  index: number
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

function GameIcon({ game }: { game: Game }) {
  if (game.icon.endsWith(".png") || game.icon.endsWith(".svg")) {
    return (
      <Image
        src={`/icons/${game.icon}`}
        alt={game.name}
        width={48}
        height={48}
        style={{ borderRadius: 10, objectFit: "cover" }}
        unoptimized
      />
    )
  }
  return <span style={{ fontSize: 36, lineHeight: 1 }}>{game.icon}</span>
}

export default function GameCard({ game }: GameCardProps) {
  const color = genreColor(game.genre as string)
  const plays = game.playCount || Math.floor(Math.random() * 5000 + 500)

  const tile = (
    <div className={`gs-tile ${game.isLive ? "gs-tile-live" : "gs-tile-soon"}`}>
      {/* Genre colour strip */}
      <div
        className="gs-tile-accent"
        style={{ background: game.isLive ? color : "rgba(255,255,255,0.06)" }}
      />

      {/* Icon */}
      <div className="gs-tile-icon">
        <GameIcon game={game} />
      </div>

      {/* Body */}
      <div className="gs-tile-body">
        <span className="gs-tile-genre" style={{ color }}>
          {game.genre}
        </span>
        <p className="gs-tile-name">{game.name}</p>
        <p className="gs-tile-desc">{game.description}</p>
        {game.isLive && (
          <div className="gs-tile-plays">
            🔥 {plays.toLocaleString()} plays
          </div>
        )}
      </div>

      {/* Right: badge + play btn */}
      <div className="gs-tile-right">
        {game.isLive
          ? <span className="gs-tile-badge-live">● LIVE</span>
          : <span className="gs-tile-badge-soon">SOON</span>
        }
        {game.isLive && (
          <span className="gs-tile-play-btn">Play →</span>
        )}
      </div>
    </div>
  )

  if (game.isLive) return <Link href={`/games/${game.slug}`}>{tile}</Link>
  return tile
}

export function GameSeeMoreCard({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <div
        className="gs-tile gs-tile-live"
        style={{
          justifyContent: "center", alignItems: "center",
          border: "1px dashed rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.02)", flexDirection: "column",
          gap: 8, minHeight: 110,
        }}
      >
        <span style={{ fontSize: 22, color: "rgba(255,255,255,0.4)" }}>→</span>
        <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{label}</p>
      </div>
    </Link>
  )
}