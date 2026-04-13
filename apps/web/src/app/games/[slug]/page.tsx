import { fetchGame, fetchGames } from "@/lib/api"
import { notFound } from "next/navigation"
import GamePageClient from "@/components/ui/GamePageClient"
import type { Metadata } from "next"

interface Props {
  params: { slug: string }
}

// ── Metadata ──
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params

  const game = await fetchGame(slug)

  if (!game) {
    return { title: "Game not found — CUBOSAPIENS" }
  }

  return {
    title: `${game.name} — CUBOSAPIENS`,
    description: game.description,
    openGraph: {
      title: `${game.name} — CUBOSAPIENS`,
      description: game.description,
    }
  }
}

// ── Page ──
export default async function GamePage({ params }: Props) {

  const { slug } = params

  const [game, allGames] = await Promise.all([
    fetchGame(slug),
    fetchGames()
  ])

  if (!game) notFound()

  const safeGames = allGames || []

  // 🎯 Recommendation engine
  const recommended = safeGames
    .filter(g => g.slug !== slug)
    .sort((a, b) => {

      // Same genre priority
      if (a.genre === game.genre && b.genre !== game.genre) return -1
      if (b.genre === game.genre && a.genre !== game.genre) return 1

      // Live games priority
      if (a.isLive && !b.isLive) return -1
      if (b.isLive && !a.isLive) return 1

      return 0
    })
    .slice(0, 6)

  return (
    <GamePageClient
      game={game}
      recommended={recommended}
    />
  )
}