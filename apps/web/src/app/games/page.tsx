 export const metadata = {
  title: "Games — CUBOSAPIENS",
  description: "Free browser games — coming soon on CUBOSAPIENS",
}

export default function GamesPage()
{
  const games = [
    { icon: "🐍", name: "Snake",   desc: "Classic arcade snake game"    },
    { icon: "🟩", name: "Wordle",  desc: "Guess the 5-letter word"      },
    { icon: "🧠", name: "Memory",  desc: "Card matching memory game"    },
    { icon: "♟️", name: "Chess",   desc: "Play chess vs computer"       },
    { icon: "🎯", name: "Aim Lab", desc: "Train your aim and reflexes"  },
    { icon: "🧩", name: "Tetris",  desc: "Classic block stacking game"  },
  ]

  return (
    <div className="page-container">

      <div className="page-hero">
        <span className="section-tag">Play in browser</span>
        <h1 className="page-hero-title">Games</h1>
        <p className="page-hero-sub">Free browser games — no download, no signup</p>
      </div>

      <div className="coming-soon-banner">
        🚧 Games are under development — launching soon
      </div>

      <div className="tool-grid-faded">
        {games.map((g, i) => (
          <div key={i} className="tool-card" style={{
            background: "linear-gradient(145deg, #080e1a, #0d1f3d)"
          }}>
            <div className="tool-card-badge">
              <span className="badge-soon">SOON</span>
            </div>
            <div className="tool-card-icon">{g.icon}</div>
            <div>
              <p className="tool-card-name">{g.name}</p>
              <p className="tool-card-desc">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}