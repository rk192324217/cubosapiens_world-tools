"use client"
import Link       from "next/link"
import Image      from "next/image"
import type { Tool } from "@/types"

interface ToolCardProps {
  tool:  Tool
  index: number
}

export default function ToolCard({ tool }: ToolCardProps)
{
  const card = (
    <div className={`tool-card ${tool.isLive ? "tool-card-live" : "tool-card-soon"}`}>

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
    
      )
  if(tool.isLive)
    return <Link href={`/tools/${tool.slug}`}>{card}</Link>
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