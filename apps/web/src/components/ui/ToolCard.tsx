"use client"
import Link from "next/link";
import type { Tool } from "@/types";
import Image from "next/image";

// const gradients = [
//   "linear-gradient(145deg, #0a1a2e, #0d3358)",
//   "linear-gradient(145deg, #0a1f0e, #0d4a1f)",
//   "linear-gradient(145deg, #1a0e06, #3d1a08)",
//   "linear-gradient(145deg, #0e0a1a, #1f0d3d)",
//   "linear-gradient(145deg, #1a0808, #3d0d0d)",
//   "linear-gradient(145deg, #081a1a, #0d3d3d)",
//   "linear-gradient(145deg, #0e1a08, #1f3d0d)",
//   "linear-gradient(145deg, #1a1a08, #3d3d0d)",
//   "linear-gradient(145deg, #080e1a, #0d1f3d)",
//   "linear-gradient(145deg, #0e0814, #220d33)",
//   "linear-gradient(145deg, #081408, #0d331a)",
//   "linear-gradient(145deg, #14080a, #331020)",
// ]

interface ToolCardProps {
  tool:  Tool
  index: number
}

export default function ToolCard({ tool }: ToolCardProps) 
{
  // const bg = gradients[index % gradients.length]

  const card = (
    
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 hover:bg-white/20 transition duration-300">
<div
      className={`tool-card ${tool.isLive ? "tool-card-live" : "tool-card-soon"}`}    >
      <div className="tool-card-badge">
        <span className={tool.isLive ? "badge-live" : "badge-soon"}>
          {tool.isLive ? "LIVE" : "SOON"}
        </span>
      </div>

      <div className="tool-card-icon">
        {tool.icon.endsWith(".png") || tool.icon.endsWith(".svg") ? (
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
        )}
      </div>

      <div>
        <p className="tool-card-name">{tool.name}</p>
        <p className="tool-card-desc">
          {tool.description.length > 30
            ? tool.description.slice(0, 30) + "…"
            : tool.description}
        </p>
      </div>
    </div>
</div>
    
  )

  if(tool.isLive) 
    {
    return <Link href={`/tools/${tool.slug}`}>{card}</Link>
  }

  return card
}


export function SeeMoreCard({ href, label }: { href: string; label: string })
 {
  return (
    <Link href={href}>
      <div className="see-more-card">
        <span className="see-more-arrow">→</span>
        <p className="see-more-label">{label}</p>
      </div>
    </Link>
  )
}