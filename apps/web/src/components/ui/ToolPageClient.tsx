"use client"

import { useState, useEffect, useCallback } from "react"
import Link                                 from "next/link"
import type { Tool }                        from "@/types"
import Image from"next/image"
interface Props {
  tool:        Tool
  recommended: Tool[]
}

export default function ToolPageClient({ tool, recommended }: Props)
{
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ESC key exits fullscreen
  const handleKey = useCallback((e: KeyboardEvent) => {
    if(e.key === "Escape") setIsFullscreen(false)
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [handleKey])

  // When fullscreen — hide header and footer
  useEffect(() => {
    const header = document.querySelector(".header-wrap") as HTMLElement
    const footer = document.querySelector(".footer")      as HTMLElement
    if(isFullscreen)
    {
      if(header) header.style.display = "none"
      if(footer) footer.style.display = "none"
      document.body.style.overflow = "hidden"
    }
    else
    {
      if(header) header.style.display = ""
      if(footer) footer.style.display = ""
      document.body.style.overflow = ""
    }
    return () => {
      if(header) header.style.display = ""
      if(footer) footer.style.display = ""
      document.body.style.overflow = ""
    }
  }, [isFullscreen])

  return (
    <>
      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="tool-fullscreen">
          <div className="tool-fullscreen-bar">
            <span className="tool-fullscreen-name">
              {tool.icon} {tool.name}
            </span>
            <button
              className="tool-fullscreen-exit"
              onClick={() => setIsFullscreen(false)}
            >
              ✕ Exit Fullscreen &nbsp;<kbd>Esc</kbd>
            </button>
          </div>
          <iframe
            src={tool.url}
            className="tool-fullscreen-iframe"
            title={tool.name}
            allow="geolocation; camera"
          />
        </div>
      )}

      {/* Normal YouTube-style layout */}
      <div className="tool-page">

        {/* LEFT */}
        <div className="tool-page-main">

          <div className="tool-page-header">
            <div className="tool-page-icon">{tool.icon.endsWith(".png") || tool.icon.endsWith(".svg") ? (
                      <Image
                        src={`/icons/${tool.icon}`}
                        alt={tool.name}
                        className="tool-card-icon-img"
                        width={48}
                        height={48}
                        unoptimized
                        // style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <span>{tool.icon}</span>
                    )}</div>
            <div>
              <h1 className="tool-page-title">{tool.name}</h1>
              <p className="tool-page-desc">{tool.description}</p>
            </div>
            {tool.isLive && (
              <button
                className="tool-open-btn"
                onClick={() => setIsFullscreen(true)}
              >
                ⛶ View Fullscreen
              </button>
            )}
          </div>

          {tool.isLive ? (
            <div className="tool-iframe-wrap">
              <iframe
                src={tool.url}
                className="tool-iframe"
                title={tool.name}
                allow="geolocation; camera"
              />
            </div>
          ) : (
            <div className="tool-coming-soon">
              <span className="tool-coming-icon">{tool.icon}</span>
              <h2>Coming Soon</h2>
              <p>This tool is under development. Check back soon.</p>
            </div>
          )}

        </div>

        {/* RIGHT — sidebar */}
        <aside className="tool-page-sidebar">

          <h3 className="sidebar-title">Recommended Tools</h3>

          <div className="recommended-list">
            {recommended.map(rec => (
              <Link
                key={rec.id}
                href={`/tools/${rec.slug}`}
                className="recommended-card"
              >
                <div className="recommended-icon">{rec.icon}</div>
                <div className="recommended-info">
                  <p className="recommended-name">{rec.name}</p>
                  <p className="recommended-desc">
                    {rec.description.length > 40
                      ? rec.description.slice(0, 40) + "…"
                      : rec.description}
                  </p>
                </div>
                {rec.isLive && <span className="recommended-live">LIVE</span>}
              </Link>
            ))}
          </div>

        </aside>

      </div>
    </>
  )
}