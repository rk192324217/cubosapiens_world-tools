"use client"
import Link        from "next/link"
import type { Game } from "@/lib/api"
import Image from "next/image"

interface GameCardProps {
  game:  Game
  index: number
}

export default function GameCard({ game, index }: GameCardProps)
{
  const card = (
    <div className={`game-card ${game.isLive ? "game-card-live" : "game-card-soon"}`}>

      <div className="game-card-badge">
        <span className={game.isLive ? "badge-live" : "badge-soon"}>
          {game.isLive ? "LIVE" : "SOON"}
        </span>
      </div>

      <div className="game-card-icon">
        {game.icon.endsWith(".png") || game.icon.endsWith(".svg") ? (
                  <Image
                    src={`/icons/${game.icon}`}
                    alt={game.name}
                    className="tool-card-icon-img"
                    width={48}
                    height={48}
                    unoptimized
                  />
                ) : (
                  <span>{game.icon}</span>
                )}
      </div>

      <div className="game-card-info">
        <p className="game-card-name">{game.name}</p>
        <p className="game-card-desc">
          {game.description.length > 32
            ? game.description.slice(0, 32) + "…"
            : game.description}
        </p>
        <span className="game-card-genre">{game.genre}</span>
      </div>

    </div>
  )

  if(game.isLive)
    return <Link href={`/games/${game.slug}`}>{card}</Link>

  return card
}

export function GameSeeMoreCard({ href, label }: { href: string; label: string })
{
  return (
    <Link href={href}>
      <div className="see-more-card">
        <span className="see-more-arrow">→</span>
        <p className="see-more-label">{label}</p>
      </div>
    </Link>
  )
}