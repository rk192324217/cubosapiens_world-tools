export const metadata = {
  title: "AI Tools — CUBOSAPIENS",
  description: "Free AI tools — coming soon on CUBOSAPIENS",
}

export default function AIPage()
{
  const aiTools = [
    { icon: "🤖", name: "AI Chat",      desc: "Chat with AI assistant"       },
    { icon: "✍️", name: "AI Writer",    desc: "Write content with AI"        },
    { icon: "🎨", name: "AI Image",     desc: "Generate images from text"    },
    { icon: "📊", name: "AI Summarise", desc: "Summarise any text instantly" },
    { icon: "🔤", name: "AI Translate", desc: "Translate any language"       },
    { icon: "💻", name: "AI Code",      desc: "Generate and explain code"    },
  ]

  return (
    <div className="page-container">

      <div className="page-hero">
        <span className="section-tag">Powered by AI</span>
        <h1 className="page-hero-title">AI Tools</h1>
        <p className="page-hero-sub">Intelligent tools powered by the latest AI models</p>
      </div>

      <div className="coming-soon-banner">
        🚧 AI tools are under development — launching soon
      </div>

      <div className="tool-grid-faded">
        {aiTools.map((a, i) => (
          <div key={i} className="tool-card" style={{
            background: "linear-gradient(145deg, #0a080e, #14082a)"
          }}>
            <div className="tool-card-badge">
              <span className="badge-soon">SOON</span>
            </div>
            <div className="tool-card-icon">{a.icon}</div>
            <div>
              <p className="tool-card-name">{a.name}</p>
              <p className="tool-card-desc">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}