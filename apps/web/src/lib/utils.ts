import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BlogTag } from "@/types"

export function cn(...inputs: ClassValue[])
{
  return twMerge(clsx(inputs))
}

// Reading time
// Assumes ~200 words per minute average reading speed

export function computeReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

// Excerpt
// Strips markdown syntax and returns a plain-text excerpt

export function getExcerpt(markdown: string, maxLen = 140): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, "")   // remove code blocks
    .replace(/`[^`]*`/g, "")          // remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, "")  // remove images
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // keep link text
    .replace(/#{1,6}\s+/g, "")        // remove headings
    .replace(/[*_~>|]/g, "")          // remove emphasis / blockquote / table chars
    .replace(/\n+/g, " ")             // collapse newlines
    .trim()

  if (plain.length <= maxLen) return plain
  return plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…"
}

// Format date 

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  })
}

// Tag label map 

export const TAG_LABELS: Record<BlogTag, string> = {
  technical: "Technical",
  oss:       "OSS",
  guides:    "Guides",
  general:   "General (Engg)",
  others:    "Others",
}

// Author initials (for avatar fallback) 

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? "")
    .join("")
}