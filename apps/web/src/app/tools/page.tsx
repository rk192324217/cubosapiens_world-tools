import { fetchTools }  from "@/lib/api"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:       "Tools - Cubosapiens",
  description: "Free browser-based tools for everyone.Geo Tag Photo, QR generator, image compressor, PDF tools and more.",
  keywords:    ["free online tools", "browser tools", "GPS photo stamp", "QR code generator", "image compressor", "PDF merger", "word counter", "free games", "AI tools", "cubosapiens", "cubo", "cubos"],
  authors:     [{ name: "Tools - Cubosapiens", url: "https://cubosapiens.world/tools" }],
  creator:     "CUBOSAPIENS",
  metadataBase: new URL("https://cubosapiens.world/tools"),
  alternates: {
    canonical: "https://cubosapiens.world/tools",
  },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://cubosapiens.world/tools",
    siteName:    "CUBOSAPIENS",
    title:       "CUBOSAPIENS — Free Tools, Games & AI in One Place",
    description: "Free browser tools, games and AI for everyone. No accounts. No cost. Just open and use.",
    images: [{
      url:    "https://cubosapiens.world/og-image.png",
      width:  1200,
      height: 630,
      alt:    "CUBOSAPIENS — Free Tools, Games & AI",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "CUBOSAPIENS — Free Tools, Games & AI in One Place",
    description: "Free browser tools, games and AI for everyone. No accounts. No cost.",
    images:      ["https://cubosapiens.world/og-image.png"],
  },
  robots: {
    index:               true,
    follow:              true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-image-preview":   "large",
      "max-snippet":         -1,
      "max-video-preview":   -1,
    },
  },
}

export default async function ToolsPage()
{
  const tools = await fetchTools()

  const categories = [
    { key: "all",       label: "All"       },
    { key: "image",     label: "Image"     },
    { key: "pdf",       label: "PDF"       },
    { key: "generator", label: "Generator" },
    { key: "text",      label: "Text"      },
    { key: "converter", label: "Converter" },
  ]

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-hero">
        <span className="section-tag">Browse everything</span>
        <h1 className="page-hero-title">All Tools</h1>
        <p className="page-hero-sub">
          {tools.length} tools · {tools.filter(t => t.isLive).length} live · more coming every week
        </p>
      </div>

      {/* Filter tabs — client component */}
      <ToolsFilter tools={tools} categories={categories} />

    </div>
  )
}

// ── Client filter component ───────────────────────────────────
// Needs "use client" for interactivity — defined below

import ToolsFilter from "@/components/ui/ToolsFilter"