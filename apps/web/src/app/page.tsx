import { fetchTools, fetchGames, fetchCounters } from "@/lib/api"
import ToolGrid   from "@/components/ui/ToolGrid"
import GameGrid   from "@/components/ui/GameGrid"
// import ColorBends from "@/components/colorbends"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGamepad, faTools, faRobot } from "@fortawesome/free-solid-svg-icons"
export default async function HomePage()
{
  const [tools, games,counter] = await Promise.all([
    fetchTools(),
    fetchGames(),
    fetchCounters(),
  ])

  const aiTools = [
    { icon: "🤖", name: "AI Chat"      },
    { icon: "✍️", name: "AI Writer"    },
    { icon: "🎨", name: "AI Image"     },
    { icon: "📊", name: "AI Summarise" },
  ]

  return (
    <div>

      {/* ── BACKGROUND — fixed, covers whole page ── */}
      {/* <div className="app-background">
        <ColorBends
          rotation={30}
          speed={0.08}
          colors={["#47d306", "#b6ff88", "#fafafa", "#00bf76"]}
          transparent={false}
          autoRotate={0.3}
          scale={1.4}
          frequency={0.7}
          warpStrength={0.6}
          mouseInfluence={0.2}
          parallax={0.1}
          noise={0.02}
        />
      </div> */}

      {/* ── HERO GLOW — subtle top radial ── */}
      <div className="hero-glow" />

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="hero">

        <div className="hero-eyebrow">
          <span className="hero-dot" />
          Free · No signup · Works in browser
        </div>

        <h1 className="hero-title">
          Everything you need.<br />
          <span className="hero-title-accent">All in One place.</span>
        </h1>

        <p className="hero-subtitle">
          Free tools, games and AI — built for everyone.
          No accounts. No cost. Just open and use.
        </p>

        <div className="hero-pills">
          <span className="hero-pill"><FontAwesomeIcon icon={faTools} /> Tools</span>
          <span className="hero-pill"><FontAwesomeIcon icon={faGamepad} /> Games</span>
          <span className="hero-pill"><FontAwesomeIcon icon={faRobot} /> AI</span>
          <span className="hero-pill hero-pill-live">
            <span className="games-live-dot" style={{ width: 6, height: 6 }} />
            Always Free
          </span>
        </div>

      </section>

      {/* ══════════════════════════════════
          TOOLS
      ══════════════════════════════════ */}
      <section className="section">
        <div className="section-header">
          <div>
            <span className="section-tag">What we offer</span>
            <h2 className="section-title">Tools</h2>
          </div>
        </div>
        <ToolGrid
          tools={tools}
          seeMoreHref="/tools"
          seeMoreLabel="All Tools"
          maxItems={11}
        />
      </section>

      {/* ══════════════════════════════════
          GAMES
      ══════════════════════════════════ */}
      <section className="section">
        <div className="section-header">
          <div>
            <span className="section-tag">Play in browser</span>
            <h2 className="section-title">
              Games
              {games.filter(g => g.isLive).length === 0 && (
                <span className="section-title-muted">— coming soon</span>
              )}
            </h2>
          </div>
        </div>

        {games.length > 0 ? (
          <GameGrid
            games={games}
            seeMoreHref="/games"
            seeMoreLabel="All Games"
            maxItems={11}
          />
        ) : (
          <div className="tool-grid-faded">
            {[
              { icon: "🐍", name: "Snake"  },
              { icon: "🟩", name: "Wordle" },
              { icon: "🧠", name: "Memory" },
              { icon: "♟️", name: "Chess"  },
            ].map((g, i) => (
              <div key={i} className="tool-card tool-card-soon">
                <div className="tool-card-badge">
                  <span className="badge-soon">SOON</span>
                </div>
                <div className="tool-card-icon">{g.icon}</div>
                <div><p className="tool-card-name">{g.name}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════
          AI TOOLS
      ══════════════════════════════════ */}
      <section className="section">
        <div className="section-header">
          <div>
            <span className="section-tag">Powered by AI</span>
            <h2 className="section-title">
              AI Tools
              <span className="section-title-muted">— coming soon</span>
            </h2>
          </div>
        </div>

        <div className="tool-grid-faded">
          {aiTools.map((a, i) => (
            <div key={i} className="tool-card tool-card-soon">
              <div className="tool-card-badge">
                <span className="badge-soon">SOON</span>
              </div>
              <div className="tool-card-icon">{a.icon}</div>
              <div><p className="tool-card-name">{a.name}</p></div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}