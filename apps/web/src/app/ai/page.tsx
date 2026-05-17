import { fetchTools }    from "@/lib/api"
import AIFilter          from "@/components/ui/AIFilter"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:       "AI Tools — CUBOSAPIENS",
  description: "Free AI-powered tools — chat, write, generate images, summarise, translate and more on CUBOSAPIENS.",
  keywords:    ["free AI tools", "AI chat", "AI writer", "AI image generator", "AI summariser", "cubosapiens"],
  authors:     [{ name: "AI Tools — CUBOSAPIENS", url: "https://cubosapiens.world/ai" }],
  creator:     "CUBOSAPIENS",
  metadataBase: new URL("https://cubosapiens.world/ai"),
  alternates: {
    canonical: "https://cubosapiens.world/ai",
  },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://cubosapiens.world/ai",
    siteName:    "CUBOSAPIENS",
    title:       "CUBOSAPIENS — Free AI Tools",
    description: "Free AI-powered tools for everyone. No accounts. No cost. Just open and use.",
    images: [{
      url:    "https://cubosapiens.world/og-image.png",
      width:  1200,
      height: 630,
      alt:    "CUBOSAPIENS — Free AI Tools",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "CUBOSAPIENS — Free AI Tools",
    description: "Free AI-powered tools for everyone. No accounts. No cost.",
    images:      ["https://cubosapiens.world/og-image.png"],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-image-preview": "large",
      "max-snippet":       -1,
      "max-video-preview": -1,
    },
  },
}

export default async function AIPage()
{
  // Fetch only tools tagged with category "ai" from the backend.
  // next: { revalidate: 60 } is set inside fetchTools, so this is
  // ISR-cached — not every request hits the database.
  const tools = await fetchTools({ category: "ai" })

  return (
    <div className="page-container">

      <div className="page-hero">
        <span className="section-tag">Powered by AI</span>
        <h1 className="page-hero-title">AI Tools</h1>
        <p className="page-hero-sub">
          {tools.length > 0
            ? `${tools.length} tools · ${tools.filter(t => t.isLive).length} live · intelligent tools powered by the latest AI models`
            : "Intelligent tools powered by the latest AI models"}
        </p>
      </div>

      {/* AIFilter is a client component — handles search + filtering */}
      <AIFilter tools={tools} />

    </div>
  )
}