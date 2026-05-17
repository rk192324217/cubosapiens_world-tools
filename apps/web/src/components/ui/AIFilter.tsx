"use client"

import { useState }  from "react"
import Link          from "next/link"
import Image         from "next/image"
import type { Tool } from "@/types"

interface Props {
  tools: Tool[]
}

// ── Filter tabs ───────────────────────────────────────────────
const TABS = [
  { key: "all",  label: "All"         },
  { key: "live", label: "Live"        },
  { key: "soon", label: "Coming soon" },
]

// ── Fallback shown when DB has no AI tools yet ────────────────
// Mirrors the original placeholder list so the page never looks empty.
// Once the seed is run these are replaced by real DB rows automatically.
const FALLBACK_TOOLS: Tool[] = [
  { id: -1, name: "AI Chat",      slug: "ai-chat",      description: "Chat with AI assistant",       category: "ai", icon: "🤖", url: "", isLive: false, isFeatured: false, usageCount: 0, order: 1, createdAt: "" },
  { id: -2, name: "AI Writer",    slug: "ai-writer",    description: "Write content with AI",         category: "ai", icon: "✍️", url: "", isLive: false, isFeatured: false, usageCount: 0, order: 2, createdAt: "" },
  { id: -3, name: "AI Image",     slug: "ai-image",     description: "Generate images from text",     category: "ai", icon: "🎨", url: "", isLive: false, isFeatured: false, usageCount: 0, order: 3, createdAt: "" },
  { id: -4, name: "AI Summarise", slug: "ai-summarise", description: "Summarise any text instantly",  category: "ai", icon: "📊", url: "", isLive: false, isFeatured: false, usageCount: 0, order: 4, createdAt: "" },
  { id: -5, name: "AI Translate", slug: "ai-translate", description: "Translate any language",        category: "ai", icon: "🔤", url: "", isLive: false, isFeatured: false, usageCount: 0, order: 5, createdAt: "" },
  { id: -6, name: "AI Code",      slug: "ai-code",      description: "Generate and explain code",     category: "ai", icon: "💻", url: "", isLive: false, isFeatured: false, usageCount: 0, order: 6, createdAt: "" },
]

// ── Main component ────────────────────────────────────────────
export default function AIFilter({ tools }: Props)
{
  // If the API returned nothing, show fallback placeholders so the
  // page never renders blank. Once the seed is run the real rows
  // replace these automatically.
  const source = tools.length > 0 ? tools : FALLBACK_TOOLS

  const [active, setActive] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = source.filter(t => {
    const matchTab =
      active === "all"  ? true :
      active === "live" ? t.isLive :
      /* soon */          !t.isLive

    const q = search.toLowerCase()
    const matchSearch =
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)

    return matchTab && matchSearch
  })

  return (
    <>
      {/* Search */}
      <div className="tools-search-wrap">
        <input
          className="tools-search"
          placeholder="Search AI tools..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`filter-tab ${active === tab.key ? "filter-tab-active" : ""}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count — hide the misleading "0 tools" when showing fallbacks */}
      <p className="tools-count">
        {tools.length > 0
          ? `${filtered.length} tool${filtered.length !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}`
          : "Coming soon"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="tool-grid">
          {filtered.map((tool, i) => (
            <AIToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      ) : (
        // Only reaches here if the user searched and found nothing
        <div className="empty-state">
          <p>No AI tools found</p>
          <span>Try a different search term</span>
        </div>
      )}
    </>
  )
}

// ── Single AI tool card ───────────────────────────────────────
function AIToolCard({ tool }: { tool: Tool; index: number })
{
  const card = (
    <div
      className={`tool-card ${tool.isLive ? "tool-card-live" : "tool-card-soon"}`}
      style={{ background: "linear-gradient(145deg, #0a080e, #14082a)" }}
    >
      <div className="tool-card-badge">
        <span className={tool.isLive ? "badge-live" : "badge-soon"}>
          {tool.isLive ? "LIVE" : "SOON"}
        </span>
      </div>

      <div className="tool-card-icon">
        {tool.icon.endsWith(".png") || tool.icon.endsWith(".svg") ? (
          <Image
            src={`/icons/${tool.icon}`}
            alt={tool.name}
            className="tool-card-icon-img"
            width={48}
            height={48}
            unoptimized
          />
        ) : (
          <span>{tool.icon}</span>
        )}
      </div>

      <div>
        <p className="tool-card-name">{tool.name}</p>
        <p className="tool-card-desc">
          {tool.description.length > 30
            ? tool.description.slice(0, 30) + "…"
            : tool.description}
        </p>
      </div>
    </div>
  )

  // Only live tools with a real URL are clickable
  if (tool.isLive && tool.url)
    return <Link href={`/tools/${tool.slug}`}>{card}</Link>

  return card
}