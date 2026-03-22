// Shared types — used by both frontend and backend

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
  createdAt:   Date
}

export interface Blog {
  id:          number
  title:       string
  slug:        string
  content:     string
  excerpt:     string
  coverImage?: string
  published:   boolean
  createdAt:   Date
}

export interface ApiResponse<T> {
  data:    T | null
  error:   string | null
  success: boolean
}