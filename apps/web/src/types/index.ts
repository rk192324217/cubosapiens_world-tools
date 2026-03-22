// ─────────────────────────────────────────────────────────────
// CUBOSAPIENS — Shared TypeScript types
// These are used across all components and pages
// ─────────────────────────────────────────────────────────────

export type ToolCategory =
  | "image"
  | "pdf"
  | "generator"
  | "text"
  | "converter"
  | "game"
  | "ai"

export interface Tool {
  id:          number
  name:        string
  slug:        string
  description: string
  category:    ToolCategory
  icon:        string
  url:         string
  isLive:      boolean
  isFeatured:  boolean
  usageCount:  number
  order:       number
  createdAt:   string
}

export interface Blog {
  id:          number
  title:       string
  slug:        string
  content:     string
  excerpt:     string
  coverImage?: string
  published:   boolean
  createdAt:   string
}

export interface ApiResponse<T> {
  success: boolean
  data:    T | null
  error:   string | null
}

export interface CounterResponse {
  success:   boolean
  visits:    number
  downloads: number
}