import { fetchTools }   from "@/lib/api"
import SearchResults    from "@/components/ui/SearchResults"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props)
{
  const { q }  = await searchParams
  const tools  = await fetchTools()

  return (
    <div className="page-container">
      <div className="page-hero">
        <span className="section-tag">Search</span>
        <h1 className="page-hero-title">
          {q ? `Results for "${q}"` : "Search Tools"}
        </h1>
      </div>
      <SearchResults tools={tools} initialQuery={q || ""} />
    </div>
  )
}