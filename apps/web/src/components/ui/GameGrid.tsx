"use client"
import GameCard, { GameSeeMoreCard } from "@/components/ui/GameCard"
import type { Game }                 from "@/lib/api"

interface GameGridProps {
  games:        Game[]
  seeMoreHref:  string
  seeMoreLabel: string
  maxItems?:    number
}

export default function GameGrid({
  games,
  seeMoreHref,
  seeMoreLabel,
  maxItems = 11,
}: GameGridProps)
{
  const visible = games.slice(0, maxItems)

  return (
    <div className="tool-grid">
      {visible.map((game, i) => (
        <GameCard key={game.id} game={game} index={i} />
      ))}
      <GameSeeMoreCard href={seeMoreHref} label={seeMoreLabel} />
    </div>
  )
}
