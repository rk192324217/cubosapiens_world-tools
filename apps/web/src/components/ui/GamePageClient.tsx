"use client"

import { useState, useEffect, useCallback } from "react"
import Link                                 from "next/link"
import type { Game }                        from "@/lib/api"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGamepad } from "@fortawesome/free-solid-svg-icons"
interface Props {
  game:        Game
  recommended: Game[]
}

export default function GamePageClient({ game, recommended }: Props)
{
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobilePanelOpen, setMobilePanelOpen] = useState(false)

  // ESC exits fullscreen
  const handleKey = useCallback((e: KeyboardEvent) => {
    if(e.key === "Escape") setIsFullscreen(false)
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [handleKey])

  // Hide header/footer in fullscreen
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
      {/* ── FULLSCREEN OVERLAY ─────────────────────────────── */}
      {isFullscreen && (
        <div className="tool-fullscreen">
          <div className="tool-fullscreen-bar">
            <span className="tool-fullscreen-name">
              {game.name}
            </span>
            <button
              className="tool-fullscreen-exit"
              onClick={() => setIsFullscreen(false)}
            >
              ✕ Exit Fullscreen &nbsp;<kbd>Esc</kbd>
            </button>
          </div>
          <iframe
            src={game.url}
            className="tool-fullscreen-iframe"
            title={game.name}
            allow="autoplay"
          />
        </div>
      )}

      {/* ── MAIN LAYOUT ────────────────────────────────────── */}
      <div className="game-page">

        {/* LEFT — main content */}
        <div className="game-page-main">

          {/* Game embed or coming soon */}
          {game.isLive ? (
            <div className="game-iframe-wrap">
              <iframe
                src={game.url}
                className="game-iframe"
                title={game.name}
                allow="autoplay"
              />
            </div>
          ) : (
            <div className="game-coming-soon">
              <span className="game-coming-icon">{game.icon}</span>
              <h2>Coming Soon</h2>
              <p>This game is under development. Check back soon!</p>
            </div>
          )}

          {/* Game info bar */}
          <div className="game-page-header">
            <div className="game-page-icon">{game.icon.endsWith(".png") || tool.icon.endsWith(".svg") ? (
                      <Image
                        src={`/icons/${game.icon}`}
                        alt={game.name}
                        className="tool-card-icon-img"
                        width={48}
                        height={48}
                        unoptimized
                      />
                    ) : (
                      <span>{game.icon}</span>
                    )}</div>
            <div className="game-page-holder">
              <h1 className="game-page-title">{game.name}</h1>
              <p className="game-page-desc">{game.description}</p>
              <span className="game-genre-pill">{game.genre}</span>
            </div>
            <div className="game-page-actions">
              {game.isLive && (
                <button
                  className="game-fullscreen-btn"
                  onClick={() => setIsFullscreen(true)}
                >
                  ⛶ Fullscreen
                </button>
              )}
              {/* Mobile — toggle recommended panel */}
              <button
                className="game-rec-toggle"
                onClick={() => setMobilePanelOpen(p => !p)}
                aria-label="More games"
              >
                <FontAwesomeIcon icon={faGamepad} /> More Games
              </button>
            </div>
          </div>

          {/* Mobile recommended panel — slides in below info bar */}
          {isMobilePanelOpen && (
            <div className="game-rec-mobile">
              <p className="sidebar-title">More Games</p>
              <div className="game-rec-mobile-list">
                {recommended.map(rec => (
                  <RecommendedGameCard key={rec.id} game={rec} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — sidebar (desktop only) */}
        <aside className="game-page-sidebar">
          <h3 className="sidebar-title">More Games</h3>
          <div className="recommended-list">
            {recommended.map(rec => (
              <RecommendedGameCard key={rec.id} game={rec} />
            ))}
          </div>
        </aside>

      </div>
    </>
  )
}

// ── Recommended card ──────────────────────────────────────────
function RecommendedGameCard({ game }: { game: Game })
{
  const inner = (
    <div className={`recommended-card ${!game.isLive ? "recommended-card-soon" : ""}`}>
      <div className="recommended-icon">
        <span>{game.icon.endsWith(".png") || game.icon.endsWith(".svg") ? (
                  <Image
                    src={`/icons/${game.icon}`}
                    alt={game.name}
                    className="tool-card-icon-img"
                    width={48}
                    height={48}
                    unoptimized
                  />
                ) : (
                  <span>{game.icon}</span>
                )}</span>
      </div>
      <div className="recommended-info">
        <p className="recommended-name">{game.name}</p>
        <p className="recommended-desc">
          {game.description.length > 40
            ? game.description.slice(0, 40) + "…"
            : game.description}
        </p>
      </div>
      {game.isLive
        ? <span className="recommended-live">LIVE</span>
        : <span className="badge-soon">SOON</span>
      }
    </div>
  )

  if(game.isLive)
    return <Link href={`/games/${game.slug}`}>{inner}</Link>

  return <div style={{ cursor: "default" }}>{inner}</div>
}
