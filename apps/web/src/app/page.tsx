import { fetchTools, fetchCounters } from "@/lib/api"
import ToolGrid                      from "@/components/ui/ToolGrid"

export default async function HomePage()
{
  const [tools, counters] = await Promise.all([
    fetchTools(),
    fetchCounters()
  ])

  const liveCount = tools.filter(t => t.isLive).length

  // Placeholder data for games and AI
  const games = [
    { icon: "🐍", name: "Snake"      },
    { icon: "🟩", name: "Wordle"     },
    { icon: "🧠", name: "Memory"     },
    { icon: "♟️", name: "Chess"      },
  ]

  const aiTools = [
    { icon: "🤖", name: "AI Chat"      },
    { icon: "✍️", name: "AI Writer"    },
    { icon: "🎨", name: "AI Image"     },
    { icon: "📊", name: "AI Summarise" },
  ]

  return (
    <div>

      {/* Ambient glow */}
      <div className="hero-glow" />

      {/* ── HERO ── */}
      <section className="hero">

        {/* <div className="hero-tag">
          ⚡ Free · No signup · Works in browser
        </div> */}

        <h1 className="hero-title">
          Everything you need.<br />
          <span className="hero-title-accent">All in One place.</span>
        </h1>

        <p className="hero-subtitle">
          Free tools, games and AI — built for everyone.
          No accounts. No cost. Just open and use.
        </p>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">
              {counters.visits > 0 ? counters.visits.toLocaleString() : "0"}
            </span>
            <span className="stat-label">Visitors</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{liveCount}</span>
            <span className="stat-label">Live Tools</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">∞</span>
            <span className="stat-label">Always Free</span>
          </div>
        </div>

      </section>


      {/* ── TOOLS ── */}
      <section className="section">
        {/* <span className="section-tag">What we offer</span> */}
        <h2 className="section-title">Tools</h2>
        <ToolGrid
          tools={tools}
          seeMoreHref="/tools"
          seeMoreLabel="All Tools"
          maxItems={11}
        />
      </section>


      {/* ── GAMES ── */}
      <section className="section">
        <span className="section-tag">Play in browser</span>
        <h2 className="section-title">
          Games
          <span className="section-title-muted">— coming soon</span>
        </h2>

        <div className="tool-grid-faded">
          {games.map((g, i) => (
            <div
              key={i}
              className="tool-card"
              style={{ background: "linear-gradient(145deg, #080e1a, #0d1f3d)" }}
            >
              <div className="tool-card-badge">
                <span className="badge-soon">SOON</span>
              </div>
              <div className="tool-card-icon">{g.icon}</div>
              <div>
                <p className="tool-card-name">{g.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── AI ── */}
      <section className="section">
        <span className="section-tag">Powered by AI</span>
        <h2 className="section-title">
          AI Tools
          <span className="section-title-muted">— coming soon</span>
        </h2>

        <div className="tool-grid-faded">
          {aiTools.map((a, i) => (
            <div
              key={i}
              className="tool-card"
              style={{ background: "linear-gradient(145deg, #0a080e, #14082a)" }}
            >
              <div className="tool-card-badge">
                <span className="badge-soon">SOON</span>
              </div>
              <div className="tool-card-icon">{a.icon}</div>
              <div>
                <p className="tool-card-name">{a.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}