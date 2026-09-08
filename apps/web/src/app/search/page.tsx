import { fetchTools, fetchGames } from "@/lib/api"
import SearchResults from "@/components/ui/SearchResults"

interface Props {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams

  const [tools, games] = await Promise.all([
    fetchTools(),
    fetchGames(),
  ])

  return (
    <div className="page-container">
      <div className="page-hero">
        <span className="section-tag">Search</span>
        <h1 className="page-hero-title">
          {q ? `Results for "${q}"` : "Search Everything"}
        </h1>
      </div>

      <SearchResults
        tools={tools}
        games={games}
        initialQuery={q}
      />
    </div>
  )
}





