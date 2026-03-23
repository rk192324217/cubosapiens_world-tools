"use client"

import { useState }  from "react"
import ToolCard      from "@/components/ui/ToolCard"
import type { Tool } from "@/types"

interface Props {
  tools:      Tool[]
  categories: { key: string; label: string }[]
}

export default function ToolsFilter({ tools, categories }: Props)
{
  const [active, setActive]   = useState("all")
  const [search, setSearch]   = useState("")

  const filtered = tools.filter(t => {
    const matchCat    = active === "all" || t.category === active
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      {/* Search */}
      <div className="tools-search-wrap">
        <input
          className="tools-search"
          placeholder="Search tools..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category tabs */}
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

      {/* Results count */}
      <p className="tools-count">
        {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
        {search ? ` matching "${search}"` : ""}
      </p>

      {/* Grid */}
      <div className="tool-grid">
        {filtered.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No tools found</p>
          <span>Try a different search or category</span>
        </div>
      )}
    </>
  )
}