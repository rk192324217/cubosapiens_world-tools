"use client"

import { useState }  from "react"
import ToolCard      from "@/components/ui/ToolCard"
import type { Tool } from "@/types"

const categories = [
  { key: "all",       label: "All"       },
  { key: "image",     label: "🖼 Image"  },
  { key: "pdf",       label: "📄 PDF"    },
  { key: "generator", label: "⚡ Generator" },
  { key: "text",      label: "✏️ Text"   },
  { key: "converter", label: "🔄 Converter" },
]

interface Props {
  tools:        Tool[]
  initialQuery: string
}

export default function SearchResults({ tools, initialQuery }: Props)
{
  const [query,  setQuery]  = useState(initialQuery)
  const [active, setActive] = useState("all")

  const results = tools.filter(t => {
    const matchCat    = active === "all" || t.category === active
    const q           = query.toLowerCase()
    const matchSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <>
      {/* Search input */}
      <div className="tools-search-wrap">
        <input
          className="tools-search"
          placeholder="Search tools..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Filters */}
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

      {/* Count */}
      <p className="tools-count">
        {results.length} result{results.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {results.length > 0 ? (
        <div className="tool-grid">
          {results.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No results found</p>
          <span>Try different keywords or browse all tools</span>
        </div>
      )}
    </>
  )
}