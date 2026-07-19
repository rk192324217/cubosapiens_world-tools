"use client"

import Link                from "next/link"
import Image               from "next/image"
import { useRecentItems }  from "@/hooks/useRecentItems"
import type { RecentItem } from "@/types"

// ── Relative time helper ──────────────────────────────────────
function relativeTime(ts: number): string
{
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if(mins < 1)   return "just now"
  if(mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if(hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if(days === 1) return "yesterday"
  return `${days}d ago`
}

// ── Single card ───────────────────────────────────────────────
function RecentCard({ item }: { item: RecentItem })
{
  const href = item.type === "tool" ? `/tools/${item.slug}` : `/games/${item.slug}`

  return (
    <Link href={href} className="recent-card">
      <div className="recent-card-icon">
        {item.icon.endsWith(".png") || item.icon.endsWith(".svg") ? (
          <Image
            src={`/icons/${item.icon}`}
            alt={item.name}
            width={36}
            height={36}
            unoptimized
            className="recent-card-icon-img"
          />
        ) : (
          <span className="recent-card-emoji">{item.icon}</span>
        )}
      </div>
      <p className="recent-card-name">{item.name}</p>
      <span className="recent-card-meta">{item.category}</span>
      <span className="recent-card-time">{relativeTime(item.lastAccessed)}</span>
    </Link>
  )
}

// ── Section ───────────────────────────────────────────────────
export default function RecentlyAccessed()
{
  const { items, clearAll } = useRecentItems()

  // Hidden when no history
  if(items.length === 0) return null

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Recently Accessed</h2>
        </div>
        <button
          className="recent-clear-btn"
          onClick={clearAll}
          title="Clear history"
          aria-label="Clear recently accessed history"
        >
          <i className="fas fa-trash" aria-hidden="true" /> Clear History
        </button>
      </div>

      <div className="recent-row">
        {items.map(item => (
          <RecentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
