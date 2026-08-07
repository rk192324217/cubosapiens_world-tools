"use client"

import Link from "next/link"
import Image from "next/image"
import { useRecentlyUsedTools } from "@/hooks/useRecentlyUsedTools"

export default function RecentlyUsedTools() {
  const { entries, clear } = useRecentlyUsedTools()

  if (entries.length === 0) {
    return null
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Recently Used</h2>
        </div>
        <button
          type="button"
          onClick={clear}
          className="recently-used-clear"
          aria-label="Clear recently used tools history"
        >
          Clear history
        </button>
      </div>

      <div className="tool-grid">
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/tools/${entry.slug}`}
            className="tool-card tool-card-live"
          >
            <div className="tool-card-icon">
              {entry.icon.endsWith(".png") || entry.icon.endsWith(".svg") ? (
                <Image
                  src={`/icons/${entry.icon}`}
                  alt={entry.name}
                  className="tool-card-icon-img"
                  width={48}
                  height={48}
                  unoptimized
                />
              ) : (
                <span>{entry.icon}</span>
              )}
            </div>
            <div>
              <p className="tool-card-name">{entry.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}