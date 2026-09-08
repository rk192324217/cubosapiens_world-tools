import { fetchTools, fetchGames } from "@/lib/api"
import ToolGrid from "@/components/ui/ToolGrid"
import GameGrid from "@/components/ui/GameGrid"
import AiAccessButton from "@/components/ui/AIAccessButton"
import LocalTimeWidget from "@/components/LocalTimeWidget"
// import ColorBends from "@/components/colorbends"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import AdUnit from "@/components/ui/AdUnit"
import OnboardingGreeting from "@/components/ui/OnboardingGreeting"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CUBOSAPIENS - DEV",
  description: "Free browser-based tools, games and AI for everyone. No signup, no cost, simply works in your browser.",
  keywords: ["free online tools", "browser tools", "GPS photo stamp", "QR code generator", "image compressor", "PDF merger", "word counter", "free games", "AI tools", "cubosapiens", "AI Games", "Virtual Games"],
  authors: [{ name: "CUBOSAPIENS", url: "https://cubosapiens.world" }],
  creator: "CUBOSAPIENS",
  metadataBase: new URL("https://cubosapiens.world"),
  alternates: {
    canonical: "https://www.cubosapiens.world",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cubosapiens.world",
    siteName: "CUBOSAPIENS",
    title: "CUBOSAPIENS — Free Tools, Games & AI all in One Place",
    description: "Free browser tools, games and AI for everyone. No accounts. No cost. Just open and use.",
    images: [{
      url: "https://cubosapiens.world/og-image.png",
      width: 1200,
      height: 630,
      alt: "CUBOSAPIENS — Free Tools, Games & AI",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CUBOSAPIENS — Free Tools, Games & AI in One Place",
    description: "Free browser tools, games and AI for everyone. No accounts. No cost.",
    images: ["https://cubosapiens.world/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default async function HomePage() {
  // Fetch all three in parallel — no waterfall
  const [alltools, games, aiTools] = await Promise.all([
    fetchTools(),
    fetchGames(),
    fetchTools({ category: "ai" }),
  ])

  const aiHasLive = aiTools.some(t => t.isLive)
  const tools = alltools.filter(tool => tool.category != "ai")

  return (
    <div>
      <LocalTimeWidget />

      {/* ── HERO GLOW — subtle top radial ── */}
      <div className="hero-glow" />

      <section className="hero">

        {/* <div className="hero-eyebrow">
          <span className="hero-dot" />
          Free · No signup · Works in browser
        </div> */}

        <OnboardingGreeting />
        
        <h1 className="hero-title">
          Everything you need.<br />
          <span className="hero-title-accent">All in One place.</span>
        </h1>

        <p className="hero-subtitle">
          Free tools, games and AI - built for everyone.
          No accounts. No cost. Just open and use.
        </p>

        <div className="hero-pills">
          <a href="./tools"><span className="hero-pill"><i className="fas fa-tools"></i> Tools</span></a>
          <a href="./games"><span className="hero-pill"><i className="fas fa-gamepad"></i> Games</span></a>
          <AiAccessButton
            href="/ai"
            label="AI"
            icon={<i className="fas fa-robot"></i>}
            className="hero-pill"
            hasLive={aiHasLive}
          />
          {/* <span className="hero-pill"><i className="fas fa-user"></i> {counters.visits > 0 ? counters.visits.toLocaleString() : "0"}</span> */}

          {/* <span className="hero-pill hero-pill-live">
            <span className="games-live-dot" style={{ width: 6, height: 6 }} />
            Always Free
          </span> */}
        </div>

      </section>
      <section className="section">
        <div className="section-header">
          <div>
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
      <div className="section" style={{ paddingBottom: 0 }}>
      </div>
      <section className="section">
        <div className="section-header">
          <div>
            {/* <span className="section-tag">Play in browser</span> */}
            <h2 className="section-title">
              Games
            </h2>
          </div>
        </div>

        <GameGrid
          games={games}
          seeMoreHref="/games"
          seeMoreLabel="All Games"
          maxItems={11}
        />
      </section>
      <div className="section" style={{ paddingBottom: 0 }}>
      </div>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="section-tag">Powered by AI</span>
            <h2 className="section-title">
              AI Tools
            </h2>
          </div>
        </div>


        <ToolGrid
          tools={aiTools}
          seeMoreHref="/ai"
          seeMoreLabel="All AI Tools"
          maxItems={4}
          faded={aiTools.every(t => !t.isLive)}
        />
      </section>
    </div>
  )
}
