import { fetchTools }  from "@/lib/api"

export const metadata = {
  title:       "All Tools — CUBOSAPIENS",
  description: "Browse all free browser tools on CUBOSAPIENS",
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