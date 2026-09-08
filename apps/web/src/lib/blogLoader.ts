// ─────────────────────────────────────────────────────────────
// blogLoader.ts
// Reads blog posts from blogData.generated.ts, a build-time
// snapshot of content/blogs/*.md produced by
// scripts/generate-blog-data.mjs. No `fs` access here — the
// Cloudflare Worker runtime can't read bundled project files
// off disk, so content must be baked into the JS bundle instead.
// ─────────────────────────────────────────────────────────────

import { generatedBlogPosts } from "./blogData.generated"
import type { BlogTag } from "@/types"

// ── Public type ───────────────────────────────────────────────
// Use this everywhere instead of the old API-backed Blog type.

export interface BlogPost {
  slug:           string        // derived from filename, used as URL
  title:          string
  description:    string        // shown on listing card + meta description
  author:         string
  authorGithub:   string | null // optional — links to github.com/<handle>
  date:           string        // ISO "YYYY-MM-DD"
  tags:           BlogTag[]
  content:        string        // raw markdown body
  readingTimeMin: number
}

// ── Public API ────────────────────────────────────────────────

/** Returns every slug (filename minus .md) in the blogs directory. */
export function getAllBlogSlugs(): string[] {
  return generatedBlogPosts.map(post => post.slug)
}

/** Returns a single post by slug. Returns null if not found. */
export function getBlogBySlug(slug: string): BlogPost | null {
  return generatedBlogPosts.find(post => post.slug === slug) ?? null
}

/** Returns all posts sorted newest-first. */
export function getAllBlogs(): BlogPost[] {
  return [...generatedBlogPosts].sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** Returns posts that include a given tag, newest-first. */
export function getBlogsByTag(tag: BlogTag): BlogPost[] {
  return getAllBlogs().filter(b => b.tags.includes(tag))
}
