"use client"
import ToolCard, { SeeMoreCard } from "@/components/ui/ToolCard"
import type { Tool }             from "@/types"

interface ToolGridProps {
  tools:        Tool[]
  seeMoreHref:  string
  seeMoreLabel: string
  maxItems?:    number
  faded?:       boolean
}

export default function ToolGrid({
  tools,
  seeMoreHref,
  seeMoreLabel,
  maxItems = 11,
  faded    = false,
}: ToolGridProps)
{
  const visible = tools.slice(0, maxItems)

  return (
    <div className={faded ? "tool-grid-faded" : "tool-grid"}>
      {visible.map((tool, i) => (
        <ToolCard key={tool.id} tool={tool} index={i} />
      ))}
      <SeeMoreCard href={seeMoreHref} label={seeMoreLabel} />
    </div>
  )
}