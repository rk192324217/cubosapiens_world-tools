"use client"

import { useState }  from "react"
import ToolCard      from "@/components/ui/ToolCard"
import GameCard      from "@/components/ui/GameCard" 
import type { Tool, Games } from "@/types"

const categories = [
  { key: "all",       label: "All"       },
  { key: "image",     label: "🖼 Image"  },
  { key: "pdf",       label: "📄 PDF"    },
  { key: "generator", label: "⚡ Generator" },
  { key: "text",      label: "✏️ Text"   },
  { key: "converter", label: "🔄 Converter" },
  { key: "game",      label: "🎮 Games"   }, 
]

interface Props {
  tools:        Tool[]
  games:        Games[] 
  initialQuery: string
}

// Our unified type for the search array
type SearchItem = 
  | (Tool & { itemType: "tool"; unifiedCategory: string })
  | (Games & { itemType: "game"; unifiedCategory: string })

export default function SearchResults({ tools, games, initialQuery }: Props)
{
  const [query,  setQuery]  = useState(initialQuery)
  const [active, setActive] = useState("all")

  const allItems: SearchItem[] = [
    ...tools.map((t): SearchItem => ({ ...t, itemType: "tool", unifiedCategory: t.category })),
    ...games.map((g): SearchItem => ({
  ...g,
  itemType: "game",
  unifiedCategory: "game"
}))
  ]

  const results = allItems.filter(item => {
    const matchCat    = active === "all" || item.unifiedCategory === active
    const q           = query.toLowerCase()
    
    const matchSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.unifiedCategory.toLowerCase().includes(q)
      
    return matchCat && matchSearch
  })
  return (
    <>
      <div className="tools-search-wrap">
        <input
          className="tools-search"
          placeholder="Search tools and games..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="filter-tabs">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`filter-tab ${active === cat.key ? "filter-tab-active" : ""}`}
            onClick={() => setActive(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className="tools-count">
        {results.length} result{results.length !== 1 ? "s" : ""}
      </p>

      {results.length > 0 ? (
        <div className="tool-grid">
          {results.map((item, i) => {
  

  if (item.itemType === "tool") {
    return (
      <ToolCard
        key={`tool-${item.id}`}
        tool={item as Tool}
        index={i}
      />
    )
  }

  return (
    <GameCard
      key={`game-${item.id}`}
      game={item as Games}
      index={i}
    />
  )
})}
        </div>
      ) : (
        <div className="empty-state">
          <p>No results found</p>
          <span>Try different keywords or browse all categories</span>
        </div>
      )}
    </>
  )
}